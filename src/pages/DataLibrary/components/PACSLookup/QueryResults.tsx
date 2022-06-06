import React, { useCallback, useContext, useEffect, useState } from "react";
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
  Modal,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  Spinner,
  Title,
  Tooltip,
} from "@patternfly/react-core";
import { useHistory } from "react-router";

import {
  FaRedo,
  FaQuestionCircle,
  FaCodeBranch,
  FaCubes,
} from "react-icons/fa";
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
import FileDetailView from "../../../../components/feed/Preview/FileDetailView";
import { MainRouterContext } from "../../../../routes";
import { FaEye } from "react-icons/fa";

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
  const createFeed = useContext(MainRouterContext).actions.createFeedWithData;
  const cubeClient = ChrisAPIClient.getClient();

  const PatientCard = ({ patient }: { patient: PACSPatient }) => {
    const { PatientID, PatientBirthDate, PatientName, PatientSex } = patient;

    const [isPatientExpanded, setIsPatientExpanded] = useState(false);
    const expandPatient = () => {
      setIsPatientExpanded(!isPatientExpanded);
    };

    const LatestDate = (dates: Date[]) => {
      let latestStudy = dates[0];
      for (const date of dates) {
        if (latestStudy.getTime() < date.getTime()) latestStudy = date;
      }
      return latestStudy;
    };

    return (
      <>
        <Card isRounded isHoverable isExpanded={isPatientExpanded}>
          <CardHeader onExpand={expandPatient.bind(PatientCard)}>
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
                  <Moment format="MMMM Do YYYY">{`${PatientBirthDate}`}</Moment>
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

        {isPatientExpanded && (
          <Grid hasGutter className="patient-studies">
            {patient.studies.map((study) => (
              <GridItem key={study.StudyInstanceUID}>
                <StudyCard study={study} />
              </GridItem>
            ))}
          </Grid>
        )}
      </>
    );
  };

  const StudyCard = ({ study }: { study: PACSStudy }) => {
    const { StudyInstanceUID, PatientID } = study;
    const pullQuery = { StudyInstanceUID, PatientID };

    const [isStudyExpanded, setIsStudyExpanded] = useState(false);
    const expandStudy = () => {
      setIsStudyExpanded(!isStudyExpanded);
    };

    const StudyActions = () => {
      const [existingStudyFiles, setExistingStudyFiles] =
        useState<PACSFileList>();
      const [pullStatus, setPullStatus] = useState<PFDCMPull>();
      const [poll, setPoll] = useState<any>();

      const cubeHasStudy =
        !!existingStudyFiles && existingStudyFiles.totalCount > 0;
      const studyFiles = existingStudyFiles?.getItems() || [];
      const cubeStudyPath = studyFiles.length
        ? studyFiles[0].data.fname.split("/").slice(0, -2).join("/")
        : "#";

      useEffect(() => {
        cubeClient.getPACSFiles(pullQuery).then(async (files) => {
          setExistingStudyFiles(files);
          setPullStatus(await onRequestStatus(pullQuery));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      useEffect(() => {
        if (cubeHasStudy || !pullStatus || !pullStatus.isRunning)
          return () => clearTimeout(poll);

        const _poll = async (): Promise<PFDCMPull> => {
          if (pullStatus.isStageCompleted) {
            await onExecutePACSStage(pullQuery, pullStatus.nextStage);
            return new PFDCMPull(pullQuery, pullStatus.nextStage);
          }

          const _status = await onRequestStatus(pullQuery);
          if (_status.stage >= pullStatus.stage) return _status;

          /**
           * @todo Retry if status is not changing
           * If pfdcm get stuck for more than 10 attempts
           */

          --pullStatus.attempts;
          return pullStatus;
        };

        if (pullStatus.isRunning)
          setPoll(setTimeout(() => _poll().then(setPullStatus), 1000));
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [cubeHasStudy, pullStatus]);

      const route = useHistory().push;

      if (!existingStudyFiles || !pullStatus) return <Spinner size="lg" />;

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
            <div>Files available in ChRIS</div>
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
                <div>
                  <b>Finishing Up</b>
                </div>
                <div>{pullStatus.progressText}</div>
              </div>
            )}
          </div>
        );

      const startPull = (query: PFDCMFilters) => {
        const _p = new PFDCMPull(query, PACSPullStages.RETRIEVE);
        onExecutePACSStage(query, _p.stage);
        setPullStatus(_p);
      };

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
      <>
        <Card isRounded isHoverable isExpanded={isStudyExpanded}>
          <CardHeader
            onExpand={expandStudy.bind(QueryResults, StudyInstanceUID)}
          >
            <Grid hasGutter>
              <GridItem span={4}>
                <div>
                  <b style={{ marginRight: "0.5em" }}>
                    {study.StudyDescription}
                  </b>{" "}
                  {study.StudyDate.getTime() >=
                  Date.now() - 30 * 24 * 60 * 60 * 1000 ? (
                    <Tooltip content="Study was performed in the last 30 days.">
                      <Badge>NEW</Badge>
                    </Tooltip>
                  ) : null}
                </div>
                <div>
                  {study.NumberOfStudyRelatedSeries} series, on{" "}
                  <Moment format="MMMM Do YYYY">{`${study.StudyDate}`}</Moment>
                </div>
              </GridItem>
              <GridItem span={2}>
                <div className="study-detail-title">Modalities in Study</div>
                <div>
                  {study.ModalitiesInStudy.split("\\").map((m) => (
                    <Badge style={{ margin: "auto 0.125em" }} key={m}>
                      {m}
                    </Badge>
                  ))}
                </div>
              </GridItem>
              <GridItem span={2}>
                <div className="study-detail-title">Accession Number</div>
                {study.AccessionNumber.startsWith("no value") ? (
                  <Tooltip content={study.AccessionNumber}>
                    <FaQuestionCircle />
                  </Tooltip>
                ) : (
                  <div>{study.AccessionNumber}</div>
                )}
              </GridItem>

              <GridItem span={2}>
                <div className="study-detail-title">Station</div>
                {study.PerformedStationAETitle.startsWith("no value") ? (
                  <Tooltip content={study.PerformedStationAETitle}>
                    <FaQuestionCircle />
                  </Tooltip>
                ) : (
                  <div>{study.PerformedStationAETitle}</div>
                )}
              </GridItem>

              <GridItem
                span={2}
                style={{
                  margin: "auto 0 auto 2em",
                  minWidth: "12em",
                  textAlign: "right",
                  fontSize: "small",
                }}
              >
                <StudyActions />
              </GridItem>
            </Grid>
          </CardHeader>
        </Card>

        {isStudyExpanded && (
          <Grid hasGutter className="patient-series">
            {study.series.map((series) => (
              <GridItem sm={12} md={3} key={series.SeriesInstanceUID}>
                <SeriesCard series={series} />
              </GridItem>
            ))}
          </Grid>
        )}
      </>
    );
  };

  const SeriesCard = ({ series }: { series: PACSSeries }) => {
    const { SeriesInstanceUID, StudyInstanceUID, PatientID } = series;
    const pullQuery = { SeriesInstanceUID, StudyInstanceUID, PatientID };

    const SeriesActions = () => {
      const [existingSeriesFiles, setExistingSeriesFiles] =
        useState<PACSFileList>();
      const [pullStatus, setPullStatus] = useState<PFDCMPull>();
      const [poll, setPoll] = useState<any>();

      const [cubePollAttempts, setCubePollAttempts] = useState(2);
      const [cubePollError, setCubePollError] = useState(false);

      const cubeSeriesSize = existingSeriesFiles?.totalCount;
      const cubeHasSeries =
        series.NumberOfSeriesRelatedInstances === cubeSeriesSize;

      const seriesFiles = existingSeriesFiles?.getItems() || [];
      const cubeSeriesPath = seriesFiles.length
        ? seriesFiles[0].data.fname.split("/").slice(0, -1).join("/")
        : "#";

      const [openSeriesPreview, setOpenSeriesPreview] = useState(false);

      const fetchCUBESeries = async () => {
        const files = await cubeClient.getPACSFiles({
          ...pullQuery,
          limit: series.NumberOfSeriesRelatedInstances,
        });

        setExistingSeriesFiles(files);
        setPullStatus(await onRequestStatus(pullQuery));
      };

      useEffect(() => {
        fetchCUBESeries();
      }, []);

      useEffect(() => {
        if (cubeHasSeries || !pullStatus) return () => clearTimeout(poll);

        const _poll = async (): Promise<PFDCMPull> => {
          if (pullStatus.isStageCompleted) {
            await onExecutePACSStage(pullQuery, pullStatus.nextStage);
            return new PFDCMPull(pullQuery, pullStatus.nextStage);
          }

          const _status = await onRequestStatus(pullQuery);
          if (_status.stage >= pullStatus.stage) return _status;

          /**
           * @todo Retry if status is not changing
           * If pfdcm get stuck for more than 10 attempts
           */

          // --pullStatus.attempts;
          return new PFDCMPull(pullStatus.query, pullStatus.stage);
        };

        if (pullStatus.isPullCompleted) {
          if (cubePollAttempts > 0) {
            setCubePollAttempts(cubePollAttempts - 1);
            return setPoll(setTimeout(fetchCUBESeries, 5000));
          } else {
            setCubePollError(true);
            return () => clearTimeout(poll);
          }
        }

        if (pullStatus.isRunning)
          return setPoll(setTimeout(() => _poll().then(setPullStatus), 1000));
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [cubeHasSeries, pullStatus]);

      const retryRegister = useCallback(() => {
        if (!pullStatus) return;

        /**
         * @note this can be changed to onExecutePACSStage(pullStatus.query, pullStatus.stage - 1);
         * to enable reusing this callback for any stage
         */
        onExecutePACSStage(pullStatus.query, PACSPullStages.REGISTER);

        setPullStatus(new PFDCMPull(pullStatus.query, PACSPullStages.REGISTER));
        setCubePollError(false);
        setCubePollAttempts(2);
      }, [pullStatus]);

      if (!existingSeriesFiles || !pullStatus)
        return (
          <div style={{ display: "flex", height: "100%" }}>
            <Spinner size="lg" style={{ margin: "auto" }} />
          </div>
        );

      if (cubeHasSeries) {
        return (
          <>
            {seriesFiles.length && (
              <div style={{ marginTop: "-1em", wordWrap : "break-word"}}>
                <FileDetailView
                  preview="small"
                  selectedFile={
                    seriesFiles[
                      Math.floor(series.NumberOfSeriesRelatedInstances / 2)
                    ]
                  }
                />

                {openSeriesPreview && (
                  <Modal
                    title="Preview"
                    aria-label="viewer"
                    width={"50%"}
                    isOpen={!!openSeriesPreview}
                    onClose={() => setOpenSeriesPreview(false)}
                  >
                    <FileDetailView
                      selectedFile={
                        seriesFiles[
                          Math.floor(series.NumberOfSeriesRelatedInstances / 2)
                        ]
                      }
                      preview="large"
                    />
                  </Modal>
                )}
              </div>
            )}

            <div
              className="action-button-container hover"
              style={{ display: "flex", flexFlow: "row", flexWrap: "wrap" }}
            >
              <Tooltip content="Click to create a new feed with this series">
                <Button
                  variant="primary"
                  style={{ fontSize: "small", margin: "auto" }}
                  onClick={() => createFeed([cubeSeriesPath])}
                >
                  <FaCodeBranch /> <b>Create Feed</b>
                </Button>
              </Tooltip>
              <Button
                variant="secondary"
                style={{ fontSize: "small", margin: "auto" }}
                onClick={() => setOpenSeriesPreview(true)}
              >
                <FaEye /> <b>Preview</b>
              </Button>
            </div>
          </>
        );
      }

      const PullProgress = () => {
        return (
          <Progress
            value={pullStatus.progress * 100}
            style={{ gap: "0.5em", textAlign: "left", width: "10em" }}
            title={pullStatus.stageText}
            size={ProgressSize.sm}
            measureLocation={ProgressMeasureLocation.top}
            label={pullStatus.progressText}
            valueText={pullStatus.progressText}
          />
        );
      };

      const FinishingUp = () => {
        if (cubePollError)
          return (
            <div style={{ fontSize: "small" }}>
              <p>Something went wrong</p>
              <Tooltip content="Click to retry registering this series.">
                <Button
                  variant="danger"
                  style={{ fontSize: "small", margin: "auto" }}
                  onClick={retryRegister}
                >
                  <FaRedo /> <b>Retry</b>
                </Button>
              </Tooltip>
            </div>
          );

        return (
          <div>
            <div>
              <Spinner size="md" /> <b>Finishing Up</b>
            </div>
            <div style={{ fontSize: "small" }}>{pullStatus.progressText}</div>
          </div>
        );
      };

      if (pullStatus.stage !== PACSPullStages.NONE)
        return (
          <div className="action-button-container" style={{ display: "flex" }}>
            <div style={{ margin: "auto", textAlign: "center" }}>
              {!pullStatus.isPullCompleted ? <PullProgress /> : <FinishingUp />}
            </div>
          </div>
        );

      const startPull = (query: PFDCMFilters) => {
        const _p = new PFDCMPull(query, PACSPullStages.RETRIEVE);
        onExecutePACSStage(query, _p.stage);
        setPullStatus(_p);
      };

      return (
        <div
          className="action-button-container"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div style={{ margin: "auto" }}>
            <Tooltip content="Pull this series to use it in ChRIS">
              <Button
                variant="secondary"
                style={{ marginBottom: "0.5em", fontSize: "small" }}
                onClick={startPull.bind(SeriesCard, pullQuery)}
              >
                <b>Pull Series</b>
              </Button>
            </Tooltip>
            <div style={{ fontSize: "smaller", color: "gray" }}>
              {series.NumberOfSeriesRelatedInstances}{" "}
              {pluralize("file", series.NumberOfSeriesRelatedInstances)}
            </div>
          </div>
        </div>
      );
    };

    return (
      <Card isRounded isHoverable style={{ height: "100%" }}>
        <CardBody>
          <div className="series-actions">
            <SeriesActions />
          </div>

          <div style={{ fontSize: "small" }}>
            <b>{series.SeriesDescription}</b>
          </div>
        </CardBody>
      </Card>
    );
  };

  results = results as PACSPatient[];

  if (!results.length) {
    return (
      <EmptyState>
        <EmptyStateIcon variant="container" component={FaCubes} />
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

          {/* {isExpanded(patient.PatientID) && (
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
          )} */}
        </GridItem>
      ))}
    </Grid>
  );
};

export default QueryResults;
