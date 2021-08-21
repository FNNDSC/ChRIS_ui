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
import { PACSPatient, PACSSeries, PACSStudy, PFDCMFilters } from "../../../../api/pfdcm";
import { LibraryContext, Series } from "../../Library";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import pluralize from "pluralize";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";

interface QueryResultsProps {
  results: PACSPatient[] | PACSStudy[]
  onPull?: (filter: PFDCMFilters) => any
  pullStatus?: string
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results, onPull, pullStatus }: QueryResultsProps) => {
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
    const { PatientID, PatientBirthDate, PatientName, PatientSex } = patient;

    return <Card isHoverable isExpanded={(expandedPatient === PatientID)}>
      <CardHeader onExpand={expandPatient.bind(QueryResults, PatientID)}>
        <Grid hasGutter style={{ width: "100%" }}>
          <GridItem lg={4}>
            <div><b>{PatientName.split('^').reverse().join(" ")}</b></div>
            <div>MRN {PatientID}</div>
          </GridItem>
          <GridItem lg={4}>
            <div><b>Sex</b> ({PatientSex})</div>
            <div><b>DoB</b> <Moment format="MMMM Do YYYY">{PatientBirthDate.getTime()}</Moment></div>
          </GridItem>

          <GridItem lg={4} style={{ textAlign: "right", color: "gray" }}>
            <div><b>{patient.studies.length} {pluralize('study', patient.studies.length)}</b></div>
            <div>Latest on {LatestDate(patient.studies.map(s => s.StudyDate)).toDateString()}</div>
          </GridItem>
        </Grid>
      </CardHeader>
    </Card>
  }

  const [isPulling, setIsPulling] = useState(false);

  if (pullStatus === "completed")
    setIsPulling(false);

  const StudyCard = ({ study }: { study: PACSStudy }) => {
    const { StudyInstanceUID } = study;

    const chrisHasStudy: boolean = (
      study.NumberOfStudyRelatedInstances === existingPatientFiles?.reduce(
        (count, file) => {
          if (file.data.StudyInstanceUID === StudyInstanceUID)
            count++;
          return count;
        },
      0)
    );

    const StudyActions = () => {
      if (existingPatientFiles) {
        const chrisStudySize = existingPatientFiles.reduce(
          (size, file) => {
            if (file.data.StudyInstanceUID === StudyInstanceUID)
              size += file.data.fsize;
            return size;
          }, 
        0);

        if (chrisHasStudy || ( !!pullStatus && pullStatus === "Completed" ))
          return <div style={{ color: "gray" }}>
            <b style={{ color: "darkgreen" }}>Downloaded</b>
            { (chrisStudySize !== 0) && <div>{(chrisStudySize / (1024 * 1024)).toFixed(3)} MB</div> }
          </div>

        if (onPull) {
          const onPullStudy = async () => {
            if (onPull) {
              setIsPulling(true);
              onPull({ StudyInstanceUID });
            }
          }
          
          return <div>
            {
              isPulling ? (
                <b>{ pullStatus }</b>
              ) : (
                <Button variant="link" style={{ padding: "0" }} 
                  isDisabled={isPulling}
                  onClick={onPullStudy}
                >
                  <b>Pull Study</b>
                </Button>
              )
            }
            <div style={{ color: "gray" }}>{study.NumberOfStudyRelatedInstances} files</div>
          </div>
        }
        
        return null
      }
      
      return <Spinner size="lg" />
    }

    return <Card isHoverable isExpanded={expandedStudy === StudyInstanceUID}>
      <CardHeader onExpand={expandStudy.bind(QueryResults, StudyInstanceUID)}>
        <Split>
          <SplitItem style={{ minWidth: "30%", margin: "0 1em 0 0" }}>
            <div>
              <b style={{ marginRight: "0.5em" }}>
                {study.StudyDescription}
              </b> {
                study.StudyDate.getTime() >= Date.now() - (30 * 24*60*60*1000) ? (
                  <Tooltip content="Study was performed in the last 30 days.">
                    <Badge>NEW</Badge>
                  </Tooltip>
                ) : null
              }
            </div>
            <div>
              {study.NumberOfStudyRelatedSeries} series, on {study.StudyDate.toDateString()}
            </div>
          </SplitItem>
          <SplitItem>
            <div>Modalities in Study</div>
            <div>
              { study.ModalitiesInStudy.split('\\').map(m => (
                <Badge style={{ margin: "auto 0.125em", backgroundColor: "darkgrey" }} key={m}>{m}</Badge>
              ))}
            </div>
          </SplitItem>
          <SplitItem isFilled/>

          { 
            !study.PerformedStationAETitle.startsWith("no value") && 
            <SplitItem style={{ textAlign: "right" }}>
              <div>Performed at</div>
              <div>
                { study.PerformedStationAETitle }
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
    const { SeriesInstanceUID } = series;
    const chrisHasSeries: boolean = (
      series.NumberOfSeriesRelatedInstances === existingStudyFiles?.reduce(
          (count, file) => {
            if (file.data.SeriesInstanceUID === SeriesInstanceUID)
              count++;
            return count;
          }, 
        0)
    );

    const ChrisSeries = (
      existingStudyFiles?.filter(
        (file) => file.data.SeriesInstanceUID === SeriesInstanceUID
      ) || []
    ).map((file) => file.data.fname);

    const SeriesActions = () => {
      if (existingStudyFiles) {
        if (chrisHasSeries)
          return <Button 
            variant="link" 
            style={{ padding: "0" }}
            onClick={select.bind(QueryResults, ChrisSeries)}
            >
              Select
            </Button>
        
        if (onPull)
          return <Tooltip content="Pull this study to use this series">
            <ExclamationTriangleIcon/>
          </Tooltip>

        return null
      }
      
      return <Spinner size="md" />
    }

    return <Card 
      isHoverable
      isSelectable={chrisHasSeries}
      isSelected={library.actions.isSeriesSelected(ChrisSeries)}
    >
      <CardHeader>
        <Split style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <SplitItem style={{ minWidth: "50%" }} isFilled>
            <Badge style={{ margin: "0 1em 0 0" }}>{series.Modality}</Badge> 
            <span>{ series.SeriesDescription }</span>
          </SplitItem>
          <SplitItem style={{ color: "gray", margin: "0 2em", textAlign: "right" }}>
            {series.NumberOfSeriesRelatedInstances} files
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
      <GridItem key={patient.PatientID}>
        <PatientCard patient={patient} />

        { 
          (expandedPatient === patient.PatientID) &&
          <Grid hasGutter className="patient-studies">
          { patient.studies.map((study) => (
            <GridItem key={study.StudyInstanceUID}>
              <StudyCard study={study} />

              { 
                expandedStudy === study.StudyInstanceUID &&
                <Grid hasGutter className="patient-series">
                { study.series.map((series) => (
                  <GridItem key={series.SeriesInstanceUID}>
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
