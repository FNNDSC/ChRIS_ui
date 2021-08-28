import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Grid,
  GridItem,
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
import { PACSPatient, PACSSeries, PACSStudy, PFDCMFilters } from "../../../../api/pfdcm";
import { LibraryContext, File } from "../../Library";
import { PACSPulls } from ".";

interface QueryResultsProps {
  results: PACSPatient[] | PACSStudy[]
  pulls: PACSPulls
  onRequestPull: (filter: PFDCMFilters) => any
  onRequestStatus: (filter: PFDCMFilters) => any
}

export const QueryResults: React.FC<QueryResultsProps> = ({
  results,
  pulls,
  onRequestPull,
  onRequestStatus,
}: QueryResultsProps) => {
  const library = useContext(LibraryContext);
  const client = ChrisAPIClient.getClient();

  const selectPath = (path: File) => {
    if (!library.actions.isSelected(path)) 
      library.actions.select(path);
    else 
      library.actions.clear(path);
  };

  // const select = (items: File) => {
  //   if (!library.actions.isSeriesSelected(items)) 
  //     library.actions.select(items);
  //   else 
  //     library.actions.clear(items);
  // };

  const [expanded, setExpanded] = useState<string[]>([]);
  const isExpanded = (uid: string) => expanded.includes(uid);
  const expand = (uid: string) => {
    let _expanded = expanded;
    if (expanded.includes(uid)) {
      _expanded = _expanded.filter((_uid) => _uid !== uid);
      setExpanded(_expanded);
    } else {
      setExpanded([ ..._expanded, uid ]);
    }
  }

  const PatientCard = ({ patient }: { patient: PACSPatient, pacspulls: PACSPulls }) => {
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

  const StudyCard = ({ study, pacspulls }: { study: PACSStudy, pacspulls: PACSPulls }) => {
    const { StudyInstanceUID, PatientID } = study;
    const pullQuery = { StudyInstanceUID, PatientID };

    const [existingStudyFiles, setExistingStudyFiles] = useState<PACSFileList>();

    useEffect(() => {
      client.getPACSFiles(pullQuery).then(setExistingStudyFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cubeStudySize = existingStudyFiles?.totalCount;
    const cubeHasStudy = study.NumberOfStudyRelatedInstances === cubeStudySize;

    const StudyActions = () => {
      if (!existingStudyFiles || !pacspulls) return <Spinner size="lg" />;

      if (cubeHasStudy)
        return (
          <div style={{ color: "gray" }}>
            <Button variant="link" style={{ padding: 0 }}><b>Available</b></Button>
            {/* <div>{(cubeStudySize / (1024 * 1024)).toFixed(3)} MB</div> */}
            <div>{ cubeStudySize } {pluralize('file', cubeStudySize)}</div>
          </div>
        );

      onRequestStatus(pullQuery);

      if (pacspulls.hasPull(pullQuery)) {
        const _pull = pacspulls.getPull(pullQuery);
        if (!_pull) return <Spinner size="lg" />;

        return (
          <div>
            <b>{_pull.statusText}</b>
            {
              _pull.errors.length 
              ? <span style={{ color: "firebrick" }}>{_pull.errors[0]}</span>
              : <div style={{ color: "gray" }}>
                  ({((_pull.progress || 0) * 100).toFixed(0)}%)
                </div>
            }
          </div>
        );
      }

      return (
        <Button
          variant="secondary"
          style={{ fontSize: "small" }}
          onClick={onRequestPull.bind(StudyCard, pullQuery)}
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

  const SeriesCard = ({ series, pacspulls }: { series: PACSSeries, pacspulls: PACSPulls }) => {
    const { SeriesInstanceUID, StudyInstanceUID, PatientID } = series;
    const pullQuery = { SeriesInstanceUID, StudyInstanceUID, PatientID };

    const [existingSeriesFiles, setExistingSeriesFiles] = useState<PACSFileList>();

    useEffect(() => {
      client.getPACSFiles(pullQuery).then(setExistingSeriesFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cubeSeriesSize = existingSeriesFiles?.totalCount;
    const cubeHasSeries = series.NumberOfSeriesRelatedInstances === cubeSeriesSize;

    const seriesFiles = (existingSeriesFiles?.getItems() || []);
    const cubeSeriesPath = seriesFiles.length 
      ? seriesFiles[0].data.fname.slice(0, seriesFiles[0].data.fname.lastIndexOf('/'))
      : [];

    const SeriesActions = () => {
      if (!existingSeriesFiles || !pacspulls) return <Spinner size="md" />;

      if (cubeHasSeries) {
        return (
          <Button
            variant="link"
            style={{ padding: "0" }}
            onClick={selectPath.bind(QueryResults, cubeSeriesPath)}
          >
            Select
          </Button>
        );
      }

      onRequestStatus(pullQuery);

      if (pacspulls.hasPull(pullQuery)) {
        const _pull = pacspulls.getPull(pullQuery);
        if (!_pull) return <Spinner size="md" />;

        return (
          <div>
            <b>{_pull.statusText}</b>
            <div style={{ color: "gray" }}>({((_pull.progress || 0) * 100).toFixed(0)}%)</div>
          </div>
        );
      }

      return (
        <Button
          variant="link"
          style={{ padding: 0, fontSize: "small" }}
          onClick={onRequestPull.bind(SeriesCard, pullQuery)}
        >
          <b>Pull Series</b>
        </Button>
      );
    };

    return (
      <Card
        isHoverable
        isSelectable={cubeHasSeries}
        isSelected={library.actions.isSelected(cubeSeriesPath)}
      >
        <CardHeader>
          <Split
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <SplitItem style={{ minWidth: "50%" }} isFilled>
              <Badge style={{ margin: "0 1em 0 0" }}>{series.Modality}</Badge>
              <span>{series.SeriesDescription}</span>
            </SplitItem>
            <SplitItem
              style={{ color: "gray", margin: "0 2em", textAlign: "right" }}
            >
              {series.NumberOfSeriesRelatedInstances} {
                pluralize('file', series.NumberOfSeriesRelatedInstances)}
            </SplitItem>
            <SplitItem>
              <SeriesActions />
            </SplitItem>
          </Split>
        </CardHeader>
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
          <PatientCard patient={patient} pacspulls={pulls} />

          {isExpanded(patient.PatientID) && (
            <Grid hasGutter className="patient-studies">
              {patient.studies.map((study) => (
                <GridItem key={study.StudyInstanceUID}>
                  <StudyCard study={study} pacspulls={pulls} />

                  {isExpanded(study.StudyInstanceUID) && (
                    <Grid hasGutter className="patient-series">
                      {study.series.map((series) => (
                        <GridItem key={series.SeriesInstanceUID}>
                          <SeriesCard series={series} pacspulls={pulls} />
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

export default QueryResults
