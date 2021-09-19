import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Grid,
  GridItem,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  Spinner,
  Split,
  SplitItem,
  Title,
  Tooltip,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons";
import Moment from "react-moment";
import pluralize from "pluralize";
import { PACSFileList } from "@fnndsc/chrisapi";

import "./pacs-lookup.scss";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import {
  PACSPatient,
  PACSPullStages,
  PACSSeries,
  PACSStudy,
  PFDCMFilters,
  PFDCMPull,
} from "../../../../api/pfdcm";
import { LibraryContext, File } from "../../Library";
import FileDetailView from "../../../../components/feed/Preview/FileDetailView";
import { useHistory } from "react-router";

interface QueryResultsProps {
  results: PACSPatient[] | PACSStudy[];
  onRequestStatus: (query: PFDCMFilters) => Promise<PFDCMPull>;
  onExecutePACSStage: (query: PFDCMFilters, stage: PACSPullStages) => any;
}

export const QueryResults: React.FC<QueryResultsProps> = ({
  results,
  onRequestStatus,
  onExecutePACSStage,
}: QueryResultsProps) => {
  const library = useContext(LibraryContext);
  const client = ChrisAPIClient.getClient();

  const selectPath = (path: File) => {
    if (!library.actions.isSelected(path)) library.actions.select(path);
    else library.actions.clear(path);
  };

  const [expanded, setExpanded] = useState<string[]>([]);
  const isExpanded = (uid: string) => expanded.includes(uid);
  const expand = (uid: string) => {
    let _expanded = expanded;
    if (expanded.includes(uid)) {
      _expanded = _expanded.filter((_uid) => _uid !== uid);
      setExpanded(_expanded);
    } else {
      setExpanded([..._expanded, uid]);
    }
  };

  const PatientCard = ({
    patient
  }: {
    patient: PACSPatient
  }) => {
    const { PatientID, PatientBirthDate, PatientName, PatientSex } = patient;

    const LatestDate = (dates: Date[]) => {
      let latestStudy = dates[0];
      for (const date of dates) {
        if (latestStudy.getTime() < date.getTime()) latestStudy = date;
      }
      return latestStudy;
    };

    return (
      <Card isHoverable isExpanded={isExpanded(PatientID)}>
        <CardHeader onExpand={expand.bind(PatientCard, PatientID)}>
          <Grid hasGutter style={{ width: "100%" }}>
            <GridItem lg={4}>
              <div>
                <b>{PatientName.split("^").reverse().join(" ")}</b>
              </div>
              <div>MRN {PatientID}</div>
            </GridItem>
            <GridItem lg={4}>
              <div>
                <b>Sex</b> ({PatientSex})
              </div>
              <div>
                <b>DoB</b>{" "}
                <Moment format="MMMM Do YYYY">
                  {PatientBirthDate.getTime()}
                </Moment>
              </div>
            </GridItem>

            <GridItem lg={4} style={{ textAlign: "right", color: "gray" }}>
              <div>
                <b>
                  {patient.studies.length}{" "}
                  {pluralize("study", patient.studies.length)}
                </b>
              </div>
              <div>
                Latest on{" "}
                {LatestDate(
                  patient.studies.map((s) => s.StudyDate)
                ).toDateString()}
              </div>
            </GridItem>
          </Grid>
        </CardHeader>
      </Card>
    );
  };

  const StudyCard = ({
    study
  }: {
    study: PACSStudy
  }) => {
    const { StudyInstanceUID, PatientID } = study;
    const pullQuery = { StudyInstanceUID, PatientID };

    const StudyActions = () => {
      const [existingStudyFiles, setExistingStudyFiles] = useState<PACSFileList>();
      const [pullStatus, setPullStatus] = useState<PFDCMPull>();
      const [poll, setPoll] = useState<any>();

      const cubeStudySize = existingStudyFiles?.totalCount;
      const cubeHasStudy = study.NumberOfStudyRelatedInstances === cubeStudySize;

      const studyFiles = existingStudyFiles?.getItems() || [];
      const cubeStudyPath = studyFiles.length
        ? studyFiles[0].data.fname.split('/').slice(0, -2).join('/')
        : "#";

      useEffect(() => {
        if (expanded.slice(-1)[0] === PatientID)
          client.getPACSFiles(pullQuery).then(async (files) => {
            setExistingStudyFiles(files);
            setPullStatus(await onRequestStatus(pullQuery));
          });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      
      useEffect(() => {
        if (
          cubeHasStudy ||
          !pullStatus ||
          !pullStatus.isRunning
        )
          return () => clearTimeout(poll);

        const _poll = async (): Promise<PFDCMPull> => {
          if (pullStatus.isStageCompleted) {
            await onExecutePACSStage(pullQuery, pullStatus.nextStage);
            return new PFDCMPull(pullQuery, pullStatus.nextStage);
          }

          const _status = await onRequestStatus(pullQuery);
          if (_status.stage >= pullStatus.stage)
            return _status;
          
          return new PFDCMPull(pullStatus.query, pullStatus.stage);
        }

        if (pullStatus.isRunning)
          setPoll(
            setTimeout(() => _poll().then(setPullStatus), 1000)
          )
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [cubeHasStudy, pullStatus]);

      const route = useHistory().push;

      if (!existingStudyFiles || !pullStatus) 
        return <Spinner size="lg" />;

      if (cubeHasStudy)
        return (
          <div style={{ color: "gray" }}>
            <Button
              variant="link"
              style={{ padding: 0 }}
              onClick={() => route(cubeStudyPath)}
            >
              <b>Browse</b>
            </Button>
            <div>Files are available in ChRIS</div>
          </div>
        );

      if (pullStatus.stage !== PACSPullStages.NONE)
        return (
          <div>
            {!pullStatus.isPullCompleted ? (
              <Progress
                value={pullStatus.progress * 100}
                style={{ gap: "0.5em", textAlign: "left" }}
                title={pullStatus.stageText}
                size={ProgressSize.sm}
                measureLocation={ProgressMeasureLocation.top}
                label={pullStatus.progressText}
                valueText={pullStatus.progressText}
              />
            ) : (
              <div>
                <div><b>{pullStatus.stageText}</b></div>
                <div>{pullStatus.progressText}</div>
              </div>
            )}
          </div>
        );

      const startPull = (query: PFDCMFilters) => {
        const _p = new PFDCMPull(query, PACSPullStages.RETRIEVE);
        onExecutePACSStage(query, _p.stage);
        setPullStatus(_p);
      }

      return (
        <Button
          variant="secondary"
          style={{ fontSize: "small" }}
          onClick={startPull.bind(StudyCard, pullQuery)}
        >
          <b>Pull Study</b>
        </Button>
      );
    };

    return (
      <Card isHoverable isExpanded={isExpanded(StudyInstanceUID)}>
        <CardHeader onExpand={expand.bind(QueryResults, StudyInstanceUID)}>
          <Split>
            <SplitItem style={{ minWidth: "30%", margin: "0 1em 0 0" }}>
              <div>
                <b style={{ marginRight: "0.5em" }}>{study.StudyDescription}</b>{" "}
                {study.StudyDate.getTime() >=
                Date.now() - 30 * 24 * 60 * 60 * 1000 ? (
                  <Tooltip content="Study was performed in the last 30 days.">
                    <Badge>NEW</Badge>
                  </Tooltip>
                ) : null}
              </div>
              <div>
                {study.NumberOfStudyRelatedSeries} series, on{" "}
                {study.StudyDate.toDateString()}
              </div>
            </SplitItem>
            <SplitItem>
              <div>Modalities in Study</div>
              <div>
                {study.ModalitiesInStudy.split("\\").map((m) => (
                  <Badge
                    style={{
                      margin: "auto 0.125em",
                      backgroundColor: "darkgrey",
                    }}
                    key={m}
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            </SplitItem>
            <SplitItem isFilled />

            {!study.PerformedStationAETitle.startsWith("no value") && (
              <SplitItem style={{ textAlign: "right" }}>
                <div>Performed at</div>
                <div>{study.PerformedStationAETitle}</div>
              </SplitItem>
            )}

            <SplitItem
              style={{
                margin: "auto 0 auto 2em",
                minWidth: "12em",
                textAlign: "right",
                fontSize: "small",
              }}
            >
              <StudyActions />
            </SplitItem>
          </Split>
        </CardHeader>
      </Card>
    );
  };

  const SeriesCard = ({
    series
  }: {
    series: PACSSeries
  }) => {
    const { SeriesInstanceUID, StudyInstanceUID, PatientID } = series;
    const pullQuery = { SeriesInstanceUID, StudyInstanceUID, PatientID };

    const SeriesActions = () => {
      const [existingSeriesFiles, setExistingSeriesFiles] = useState<PACSFileList>();
      const [pullStatus, setPullStatus] = useState<PFDCMPull>();
      const [poll, setPoll] = useState<any>();

      const cubeSeriesSize = existingSeriesFiles?.totalCount;
      const cubeHasSeries =
        series.NumberOfSeriesRelatedInstances === cubeSeriesSize;
  
      const seriesFiles = existingSeriesFiles?.getItems() || [];
      const cubeSeriesPath = seriesFiles.length
        ? seriesFiles[0].data.fname.split('/').slice(0, -1).join('/')
        : "#";

      useEffect(() => {
        if (expanded.slice(-1)[0] === StudyInstanceUID)
          client.getPACSFiles(pullQuery).then(async (files) => {  
            setExistingSeriesFiles(files);
            setPullStatus(await onRequestStatus(pullQuery));
          });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      
      useEffect(() => {
        if (
          cubeHasSeries ||
          !pullStatus ||
          !pullStatus.isRunning
        )
          return () => clearInterval(poll);
        
        const _poll = async (): Promise<PFDCMPull> => {
          if (pullStatus.isStageCompleted) {
            await onExecutePACSStage(pullQuery, pullStatus.nextStage);
            return new PFDCMPull(pullQuery, pullStatus.nextStage);
          }

          const _status = await onRequestStatus(pullQuery);
          if (_status.stage >= pullStatus.stage)
            return _status;
          
          return new PFDCMPull(pullStatus.query, pullStatus.stage);
        }
        

        if (pullStatus.isRunning)
          setPoll(
            setTimeout(() => _poll().then(setPullStatus), 1000)
          )
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [cubeHasSeries, pullStatus]);

      const route = useHistory().push;

      if (!existingSeriesFiles || !pullStatus)
        return (
          <div style={{ display: "flex", height: "100%" }}>
            <Spinner size="lg" style={{ margin: "auto" }} />
          </div>
        );

      if (cubeHasSeries) {
        return (
          <>
            {
              seriesFiles.length &&
              <FileDetailView selectedFile={seriesFiles[0]} preview="small" />
            }
            
            <div className="action-button-container hover" style={{ display: "flex" }}>
              <Button
                variant="primary"
                style={{ fontSize: "small", margin: "auto" }}
                onClick={() => route(cubeSeriesPath)}
                >
                <b>Browse</b>
              </Button>
            </div>
          </>
        );
      }

      if (pullStatus.stage !== PACSPullStages.NONE)
        return (
          <div className="action-button-container" style={{ display: "flex" }}>
            <div style={{ margin: "auto", textAlign: "center" }}>
              {!pullStatus.isPullCompleted ? (
                <Progress
                  value={pullStatus.progress * 100}
                  style={{ gap: "0.5em", textAlign: "left", width: "10em" }}
                  title={pullStatus.stageText}
                  size={ProgressSize.sm}
                  measureLocation={ProgressMeasureLocation.top}
                  label={pullStatus.progressText}
                  valueText={pullStatus.progressText}
                />
              ) : (
                <>
                  <div><b>{pullStatus.stageText}</b></div>
                  <div>{pullStatus.progressText}</div>
                </>
              )}
            </div>
          </div>
        );

      const startPull = (query: PFDCMFilters) => {
        const _p = new PFDCMPull(query, PACSPullStages.RETRIEVE);
        onExecutePACSStage(query, _p.stage);
        setPullStatus(_p);
      }

      return (
        <div className="action-button-container" style={{ display: "flex" }}>
          <Tooltip content="Pull this series to use it in ChRIS">
            <Button
              variant="secondary"
              style={{ fontSize: "small", margin: "auto" }}
              onClick={startPull.bind(SeriesCard, pullQuery)}
              >
              <b>Pull Series</b>
            </Button>
          </Tooltip>
        </div>
      );
    };

    return (
      <Card isHoverable>
        <CardBody>
          <div className="series-actions">
            <SeriesActions />
            {/* <Badge
              style={{
                margin: "0 0.5em 0 0",
                position: "absolute",
                top: "0.75em",
                left: "1.75em",
                zIndex: 100,
              }}
            >
              {series.Modality}
            </Badge> */}
          </div>

          <div style={{ fontSize: "small" }}>
            <b>{series.SeriesDescription}</b>
            <div>
              {series.NumberOfSeriesRelatedInstances}{" "}
              {pluralize("file", series.NumberOfSeriesRelatedInstances)}
              <Badge style={{ margin: "0 0 0 0.5em" }}>
                {series.Modality}
              </Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  results = results as PACSPatient[];

  if (!results.length) {
    return (
      <EmptyState>
        <EmptyStateIcon variant="container" component={CubesIcon} />
        <Title size="lg" headingLevel="h4">
          No Results
        </Title>
        <EmptyStateBody>No patients matched your search.</EmptyStateBody>
      </EmptyState>
    );
  }

  /* eslint-disable react/prop-types */

  return (
    <Grid hasGutter id="pacs-query-results">
      {results.map((patient) => (
        <GridItem key={patient.PatientID}>
          <PatientCard patient={patient} />

          {isExpanded(patient.PatientID) && (
            <Grid hasGutter className="patient-studies">
              {patient.studies.map((study) => (
                <GridItem key={study.StudyInstanceUID}>
                  <StudyCard study={study} />

                  {isExpanded(study.StudyInstanceUID) && (
                    <Grid hasGutter className="patient-series">
                      {study.series.map((series) => (
                        <GridItem sm={12} md={3} key={series.SeriesInstanceUID}>
                          <SeriesCard series={series} />
                        </GridItem>
                      ))}
                    </Grid>
                  )}
                </GridItem>
              ))}
            </Grid>
          )}
        </GridItem>
      ))}
    </Grid>
  );
};

export default QueryResults;
