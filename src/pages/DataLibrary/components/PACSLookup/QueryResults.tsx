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
import { PACSFile } from "@fnndsc/chrisapi";

import "./pacs-lookup.scss";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { PACSPatient, PACSSeries, PACSStudy, PFDCMFilters } from "../../../../api/pfdcm";
import { LibraryContext, Series } from "../../Library";
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

  const select = (items: Series) => {
    if (!library.actions.isSeriesSelected(items)) 
      library.actions.select(items);
    else 
      library.actions.clear(items);
  };

  const PatientCard = ({ patient, pacspulls }: { patient: PACSPatient, pacspulls: PACSPulls }) => {
    const { PatientID, PatientBirthDate, PatientName, PatientSex } = patient;

    const [isExpanded, setIsExpanded] = useState(false);

    const LatestDate = (dates: Date[]) => {
      let latestStudy = dates[0];
      for (const date of dates) {
        if (latestStudy.getTime() < date.getTime()) latestStudy = date;
      }
      return latestStudy;
    };

    return (
      <>
        <Card isHoverable isExpanded={isExpanded}>
          <CardHeader onExpand={setIsExpanded.bind(PatientCard, !isExpanded)}>
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

        {isExpanded && (
          <Grid hasGutter className="patient-studies">
            {patient.studies.map((study) => (
              <GridItem key={study.StudyInstanceUID}>
                <StudyCard study={study} pacspulls={pacspulls} />
              </GridItem>
            ))}
          </Grid>
        )}
      </>
    );
  };

  const StudyCard = ({ study, pacspulls }: { study: PACSStudy, pacspulls: PACSPulls }) => {
    const { StudyInstanceUID, PatientID } = study;

    const [isExpanded, setIsExpanded] = useState(false);
    const [existingStudyFiles, setExistingStudyFiles] = useState<PACSFile[]>();

    const pullQuery = { StudyInstanceUID, PatientID };

    useEffect(() => {
      client
        .getPACSFiles({
          StudyInstanceUID,
          PatientID,
          limit: 10e6,
        })
        .then((value) => {
          setExistingStudyFiles(value.getItems() || []);
        });
    }, [PatientID, StudyInstanceUID]);

    const cubeHasStudy =
      study.NumberOfStudyRelatedInstances === existingStudyFiles?.length;

    const StudyActions = () => {
      if (!existingStudyFiles || !pulls) return <Spinner size="lg" />;

      const chrisStudySize = existingStudyFiles.reduce((size, file) => {
        if (file.data.StudyInstanceUID === StudyInstanceUID)
          size += file.data.fsize;
        return size;
      }, 0);

      if (cubeHasStudy)
        return (
          <div style={{ color: "gray" }}>
            <b style={{ color: "darkgreen" }}>Downloaded</b>
            <div>{(chrisStudySize / (1024 * 1024)).toFixed(3)} MB</div>
          </div>
        );

      onRequestStatus(pullQuery);

      if (pacspulls.has(JSON.stringify(pullQuery))) {
        const _pull = pacspulls.get(JSON.stringify(pullQuery));
        if (!_pull) return <Spinner size="lg" />;

        return (
          <div>
            <b>{_pull.status}</b>
            <div style={{ color: "gray" }}>
              ({((_pull.progress || 0) * 100).toFixed(0)}%)
            </div>
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
      <>
        <Card isHoverable isExpanded={isExpanded}>
          <CardHeader onExpand={setIsExpanded.bind(QueryResults, !isExpanded)}>
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

        {isExpanded && (
          <Grid hasGutter className="patient-series">
            {study.series.map((series) => (
              <GridItem key={series.SeriesInstanceUID}>
                <SeriesCard series={series} pacspulls={pacspulls} />
              </GridItem>
            ))}
          </Grid>
        )}
      </>
    );
  };

  const SeriesCard = ({ series, pacspulls }: { series: PACSSeries, pacspulls: PACSPulls }) => {
    const { SeriesInstanceUID, StudyInstanceUID, PatientID } = series;

    const [existingSeriesFiles, setExistingSeriesFiles] = useState<PACSFile[]>();

    const pullQuery = { SeriesInstanceUID, StudyInstanceUID, PatientID };

    useEffect(() => {
      client
        .getPACSFiles({
          SeriesInstanceUID,
          StudyInstanceUID,
          PatientID,
          limit: 10e6,
        })
        .then((value) => {
          setExistingSeriesFiles(value.getItems() || []);
        });
    }, [PatientID, SeriesInstanceUID, StudyInstanceUID]);

    const cubeHasSeries: boolean =
      series.NumberOfSeriesRelatedInstances === existingSeriesFiles?.length;

    const CUBESeries =
      existingSeriesFiles?.map((file) => file.data.fname) || [];

    const SeriesActions = () => {
      if (!existingSeriesFiles || !pulls) return <Spinner size="md" />;

      if (cubeHasSeries)
        return (
          <Button
            variant="link"
            style={{ padding: "0" }}
            onClick={select.bind(QueryResults, CUBESeries)}
          >
            Select
          </Button>
        );

      onRequestStatus(pullQuery);

      if (pacspulls.has(JSON.stringify(pullQuery))) {
        const _pull = pacspulls.get(JSON.stringify(pullQuery));
        if (!_pull) return <Spinner size="md" />;

        return (
          <div>
            <b>{_pull.status}</b>
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
        isSelected={library.actions.isSeriesSelected(CUBESeries)}
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
        </GridItem>
      ))}
    </Grid>
  );
};

export default QueryResults
