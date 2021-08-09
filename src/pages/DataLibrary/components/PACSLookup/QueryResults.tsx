import React, { useContext, useState } from "react";
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
import { PACSFile } from "@fnndsc/chrisapi";

import "./pacs-lookup.scss";
import { PACSPatient, PACSSeries, PACSStudy } from "../../../../api/pfdcm";
import { LibraryContext, Series } from "../../Library";
import ChrisAPIClient from "../../../../api/chrisapiclient";

interface QueryResultsProps {
  results: PACSPatient[] | PACSStudy[]
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results }: QueryResultsProps) => {
  const library = useContext(LibraryContext);
  const client = ChrisAPIClient.getClient();

  const [expandedPatient, setExpandedPatient] = useState<string>()
  const expandPatient = (patientID:string) => {
    if (expandedPatient && expandedPatient === patientID)
      setExpandedPatient(undefined);
    else
      setExpandedPatient(patientID);
  }

  const [expandedStudy, setExpandedStudy] = useState<string>()
  const expandStudy = (studyUID:string) => {
    if (expandedStudy && expandedStudy === studyUID)
      setExpandedStudy(undefined);
    else {
      setExpandedStudy(studyUID);
      setExistingStudyFiles(undefined);
      getPACSFilesForThisStudy(studyUID);      
    }
  }

  const [existingStudyFiles, setExistingStudyFiles] = useState<PACSFile[]>();
  const getPACSFilesForThisStudy = async (studyUID:string) => {
    setExistingStudyFiles(
      (
        await client.getPACSFiles({
          StudyInstanceUID: studyUID,
          PatientID: expandedPatient as string,
          limit: 10e6,
        })
      ).getItems() || []
    );
  }

  const select = (items: Series) => {
    if (!library.actions.isSeriesSelected(items))
      library.actions.select(items)
    else
      library.actions.clear(items)
  }

  const LatestDate = (dates: Date[]) => {
    let latestStudy = dates[0];
    for (const date of dates) {
      if (latestStudy.getTime() < date.getTime())
        latestStudy = date;
    }
    return latestStudy
  }

  const PatientCard = ({ patient }: { patient: PACSPatient }) => {
    return <Card isExpanded={(expandedPatient === patient.patientID)}>
      <CardHeader onExpand={expandPatient.bind(QueryResults, patient.patientID)}>
        <Grid hasGutter style={{ width: "100%" }}>
          <GridItem lg={2}>
            <div><b>{patient.patientName.split('^').reverse().join(" ")}</b></div>
            <div>MRN {patient.patientID}</div>
          </GridItem>
          <GridItem lg={1}>
            <div><b>Sex</b></div>
            <div>({patient.patientSex})</div>
          </GridItem>
          <GridItem lg={6}>
            <div><b>DoB</b></div>
            <div><Moment format="MMMM Do YYYY">{patient.patientBirthDate.getTime()}</Moment></div>
          </GridItem>

          <GridItem lg={3} style={{ textAlign: "right", color: "gray" }}>
            <div><b>{patient.studies.length} studies</b></div>
            <div>Latest on {LatestDate(patient.studies.map(s => s.studyDate)).toDateString()}</div>
          </GridItem>
        </Grid>
      </CardHeader>
    </Card>
  }

  const StudyCard = ({ study }: { study: PACSStudy }) => {
    return <Card isExpanded={expandedStudy === study.studyInstanceUID}>
      <CardHeader onExpand={expandStudy.bind(QueryResults, study.studyInstanceUID)}>
        <Split>
          <SplitItem style={{ minWidth: "30%", margin: "0 1em 0 0" }}>
            <div>
              <b style={{ marginRight: "0.5em" }}>
                {study.studyDescription}
              </b> {
                study.studyDate.getTime() >= Date.now() - (30 * 24*60*60*1000) ? (
                  <Tooltip content="Study was performed in the last 30 days.">
                    <Badge>NEW</Badge>
                  </Tooltip>
                ) : null
              }
            </div>
            <div>
              {study.numberOfStudyRelatedSeries} series, on {study.studyDate.toDateString()}
            </div>
          </SplitItem>
          <SplitItem>
            <div>Modalities in Study</div>
            <div>
              { study.modalitiesInStudy.split('\\').map(m => (
                <Badge style={{ margin: "auto 0.125em", backgroundColor: "darkgrey" }} key={m}>{m}</Badge>
              ))}
            </div>
          </SplitItem>
          <SplitItem isFilled/>
          <SplitItem style={{ textAlign: "right" }}>
            <div>Performed at</div>
            <div>
              { study.performedStationAETitle.startsWith("no value") ? 'unknown' : study.performedStationAETitle }
            </div>
          </SplitItem>
          <SplitItem style={{ color: "gray", margin: "0 0 0 2em",  textAlign: "right" }}>
            <Button variant="link" style={{ padding: "0" }} onClick={() => expandStudy(study.studyInstanceUID)}>
              Browse
            </Button>
            <div>{study.numberOfStudyRelatedInstances} files</div>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  }

  const SeriesCard = ({ series }: { series: PACSSeries }) => {
    const chrisHasSeries = (
      series.numberOfSeriesRelatedInstances === existingStudyFiles?.reduce(
        (count, file) => {
          if (file.data.seriesInstanceUID === series.seriesInstanceUID)
            count++;
          return count;
        }, 
      0)
    );

    const ChrisSeries = (
      existingStudyFiles?.filter(
        (file) => file.data.seriesInstanceUID === series.seriesInstanceUID
      ) || []
    ).map((file) => file.data.fname);

    return <Card 
      isSelectable={chrisHasSeries}
      isSelected={library.actions.isSeriesSelected(ChrisSeries)}
      onClick={chrisHasSeries ? select.bind(QueryResults, ChrisSeries) : undefined}
    >
      <CardHeader>
        <Split style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <SplitItem style={{ minWidth: "50%" }} isFilled>
            <Badge style={{ margin: "0 1em 0 0" }}>{series.modality}</Badge> 
            <span>{ series.seriesDescription }</span>
          </SplitItem>
          <SplitItem style={{ color: "gray", margin: "0 2em", textAlign: "right" }}>
            {series.numberOfSeriesRelatedInstances} files
          </SplitItem>
          <SplitItem>
            {
              existingStudyFiles ?
                !chrisHasSeries ? 
                  <Button variant="link" style={{ padding: "0" }}>Pull</Button>
                : <Button variant="link" style={{ padding: "0" }}>Use</Button>
              : <Spinner size="md" />
            }            
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  }

  results = results as PACSPatient[];
  
  if (!results.length) {
    return (
      <EmptyState>
        <EmptyStateIcon variant="container" component={CubesIcon} />
        <Title size="lg" headingLevel="h4">
          No Results
        </Title>
        <EmptyStateBody>
          No patients matched your search.
        </EmptyStateBody>
      </EmptyState>
    )
  }

  /* eslint-disable react/prop-types */

  return (
    <Grid hasGutter id="pacs-query-results">
    { results.map((patient) => (
      <GridItem key={patient.patientID}>
        <PatientCard patient={patient} />

        { 
          (expandedPatient === patient.patientID) &&
          <Grid hasGutter className="patient-studies">
          { patient.studies.map((study) => (
            <GridItem key={study.studyInstanceUID}>
              <StudyCard study={study} />

              { 
                expandedStudy === study.studyInstanceUID &&
                <Grid hasGutter className="patient-series">
                { study.series.map((series) => (
                  <GridItem key={series.seriesInstanceUID}>
                    <SeriesCard series={series} />
                  </GridItem>
                ))}
                </Grid>
              }
            </GridItem>
          ))}
          </Grid>
        }
      </GridItem>
    ))}
    </Grid>
  );
}

export default QueryResults
