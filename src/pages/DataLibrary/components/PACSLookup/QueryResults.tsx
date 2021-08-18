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
import pluralize from "pluralize";

interface QueryResultsProps {
  results: PACSPatient[] | PACSStudy[]
  onPull?: () => void
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results, onPull }: QueryResultsProps) => {
  const library = useContext(LibraryContext);
  const client = ChrisAPIClient.getClient();

  const select = (items: Series) => {
    if (!library.actions.isSeriesSelected(items))
      library.actions.select(items)
    else
      library.actions.clear(items)
  }

  const [expandedPatient, setExpandedPatient] = useState<string>()
  const expandPatient = (patientID:string) => {
    if (expandedPatient && expandedPatient === patientID)
      setExpandedPatient(undefined);
    else {
      setExpandedPatient(patientID);
      setExistingPatientFiles(undefined);
      getPACSFilesForThisPatient(patientID);
    }
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

  const [existingPatientFiles, setExistingPatientFiles] = useState<PACSFile[]>();
  const getPACSFilesForThisPatient = async (PatientID:string) => {
    setExistingPatientFiles(
      (
        await client.getPACSFiles({
          PatientID,
          limit: 10e6,
        })
      ).getItems() || []
    );
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
          <GridItem lg={4}>
            <div><b>{patient.patientName.split('^').reverse().join(" ")}</b></div>
            <div>MRN {patient.patientID}</div>
          </GridItem>
          <GridItem lg={4}>
            <div><b>Sex</b> ({patient.patientSex})</div>
            <div><b>DoB</b> <Moment format="MMMM Do YYYY">{patient.patientBirthDate.getTime()}</Moment></div>
          </GridItem>

          <GridItem lg={4} style={{ textAlign: "right", color: "gray" }}>
            <div><b>{patient.studies.length} {pluralize('studies', patient.studies.length)}</b></div>
            <div>Latest on {LatestDate(patient.studies.map(s => s.studyDate)).toDateString()}</div>
          </GridItem>
        </Grid>
      </CardHeader>
    </Card>
  }

  const StudyCard = ({ study }: { study: PACSStudy }) => {
    const chrisHasStudy: boolean = (
      study.numberOfStudyRelatedInstances === existingPatientFiles?.reduce(
        (count, file) => {
          if (file.data.studyInstanceUID === study.seriesInstanceUID)
            count++;
          return count;
        },
      0)
    );

    const StudyActions = () => {
      if (existingPatientFiles) {
        const chrisStudySize = existingPatientFiles.reduce(
          (size, file) => {
            if (file.data.studyInstanceUID === study.studyInstanceUID)
              size += file.data.fsize;
            return size;
          }, 
        0);

        if (chrisHasStudy)
          return <div style={{ color: "gray" }}>
            <b style={{ color: "darkgreen" }}>Downloaded</b>
            <div>{(chrisStudySize / (1024 * 1024)).toFixed(3)} MB</div>
          </div>

        if (onPull)
          return <div>
            <Button variant="link" style={{ padding: "0" }} onClick={() => onPull()}>
              <b>Pull Study</b>
            </Button>
            <div style={{ color: "gray" }}>{study.numberOfStudyRelatedInstances} files</div>
          </div>
        
        return null
      }
      
      return <Spinner size="lg" />
    }

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

          { 
            !study.performedStationAETitle.startsWith("no value") && 
            <SplitItem style={{ textAlign: "right" }}>
              <div>Performed at</div>
              <div>
                { study.performedStationAETitle }
              </div>
            </SplitItem>
          }

          <SplitItem style={{ margin: "auto 0 auto 2em", textAlign: "right", fontSize: "small" }}>
            <StudyActions/>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  }

  const SeriesCard = ({ series }: { series: PACSSeries }) => {
    const chrisHasSeries: boolean = (
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

    const SeriesActions = () => {
      if (existingStudyFiles) {
        if (chrisHasSeries)
          return <Button variant="link" style={{ padding: "0" }}>Select</Button>
        
        if (onPull)
          return <Button variant="link" style={{ padding: "0" }}>Pull</Button>

        return null
      }
      
      return <Spinner size="md" />
    }

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
            <SeriesActions/>       
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
