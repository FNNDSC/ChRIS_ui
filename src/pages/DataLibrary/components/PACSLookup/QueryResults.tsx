import React, { useContext, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Split,
  SplitItem,
  Tab,
  TabContent,
  Tabs,
} from "@patternfly/react-core";

import "./pacs-lookup.scss";
import { PACSPatient, PACSStudy } from "../../../../api/pfdcm";
import { LibraryContext } from "../../Library";

export enum QueryResultLayouts {
  PATIENT,
  STUDY
}

interface QueryResultsProps {
  results: PACSPatient[] | PACSStudy[]
  layout: QueryResultLayouts
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results, layout }: QueryResultsProps) => {
  const library = useContext(LibraryContext);

  type PatientTabs = "details" | "studies";
  const [patientTab, setPatientTab] = useState<PatientTabs>("details");

  const [expanded, setExpanded] = useState<string>()
  const expand = (item:string) => {
    setPatientTab("details")
    if (!expanded || expanded !== item) 
      setExpanded(item)
    else
      setExpanded(undefined)
  }

  const studyIsSelected = (s: PACSStudy) => library.state.selectData.includes(s)

  const select = (item: PACSStudy | PACSStudy[]) => {
    if (Array.isArray(item)) {
      if (item.every((s) => !studyIsSelected(s)))
        library.actions.select(item)
      else {
        library.actions.clear(item.map(s => s.studyInstanceUID))
      }
    }
    else {
      if (library.state.selectData.includes(item))
        library.actions.clear(item.studyInstanceUID)
      else
        library.actions.select(item)
    }
  }

  const PatientLayout = () => {
    results = results as PACSPatient[];
    const tabrefs: any = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of results) {
      tabrefs.push({
        detailsRef: React.createRef<HTMLElement>(),
        studiesRef: React.createRef<HTMLElement>(),
      })
    }

    const LatestDate = (dates: Date[]) => {
      let latestStudy = dates[0];
      for (const date of dates) {
        if (latestStudy.getTime() < date.getTime())
          latestStudy = date;
      }
      return latestStudy
    }

    return results.map((patient, index) => (
      <GridItem key={patient.ID}>
        <Card 
          isSelectable
          isSelected={patient.studies.every(studyIsSelected)}
          isExpanded={(expanded === patient.ID)} 
          onClick={expand.bind(QueryResults, patient.ID)}
        >
          <CardHeader onExpand={expand.bind(QueryResults, patient.ID)}>
            <Grid hasGutter style={{ width: "100%" }}>
              <GridItem lg={6}>
                <p><b>{patient.name}</b></p>
                <p>Patient MRN #{patient.ID}</p>
              </GridItem>
              
              <GridItem lg={3} style={{ color: "gray" }}>
                <p><b>Latest Study</b></p>
                <p>On {LatestDate(patient.studies.map(s => s.studyDate)).toDateString()}</p>
              </GridItem>

              <GridItem lg={3} style={{ textAlign: "right" }}>
                <Split>
                  <SplitItem isFilled style={{ marginRight: "1em" }}>
                    <p>{patient.studies.length} studies</p>
                  </SplitItem>
                  <SplitItem>
                    <Button variant="secondary" onClick={select.bind(QueryResults, patient.studies)}>
                      { patient.studies.every((s) => !studyIsSelected(s)) ? "Select" : "Deselect" } All
                    </Button>
                  </SplitItem>
                </Split>
              </GridItem>
            </Grid>
          </CardHeader>
        </Card>

        { (expanded === patient.ID) &&
          <Split className="result-expanded">
            <SplitItem className="expanded-tabs">
              <Tabs 
                isVertical 
                isSecondary
                unmountOnExit
                activeKey={patientTab} 
                onSelect={(_, tab) => setPatientTab(tab as PatientTabs)}
              >
                <Tab eventKey="details" title="Details" tabContentRef={tabrefs[index].detailsRef} />
                <Tab eventKey="studies" title="Studies" tabContentRef={tabrefs[index].studiesRef} />
              </Tabs>
            </SplitItem>

            <SplitItem isFilled className="expanded-content">
              <TabContent 
                eventKey="details" 
                id={`${patient.ID}-details`} 
                ref={tabrefs[index].detailsRef} 
                className="patient-details"
              >
                <PatientDetailsTab patient={patient} />
              </TabContent>

              <TabContent hidden 
                eventKey="studies" 
                id={`${patient.ID}-studies`} 
                ref={tabrefs[index].studiesRef} 
                className="no-scrollbar patient-studies"
              >
                <Grid hasGutter>
                  {
                    patient.studies.map((study) => (
                      <GridItem key={study.studyInstanceUID}>
                        <Card 
                          isSelectable 
                          isSelected={studyIsSelected(study)}
                          onClick={select.bind(QueryResults, study)}
                        >
                          <CardBody>
                            <Split>
                              <SplitItem style={{ minWidth: "50%" }}>
                                <p><b>{study.modalitiesInStudy}</b>, {study.studyDescription}</p>
                                <p style={{ color: "gray" }}>
                                  On {study.studyDate.toDateString()}, at {study.performedStationAETitle}
                                </p>
                              </SplitItem>
                              <SplitItem>
                                <p>Accession Number</p>
                                <p>{study.accessionNumber}</p>
                              </SplitItem>
                              <SplitItem isFilled/>
                              <SplitItem style={{ color: "gray", margin: "0 2em",  textAlign: "right" }}>
                                <p>{study.numberOfStudyRelatedSeries} series</p>
                                <p>{study.numberOfStudyRelatedInstances} files</p>
                              </SplitItem>
                              <SplitItem>
                                <Button variant="link" style={{ padding: "0" }}>Browse</Button>
                              </SplitItem>
                            </Split>
                          </CardBody>
                        </Card>
                      </GridItem>
                    ))
                  }
                </Grid>
              </TabContent>
            </SplitItem>
          </Split>
        }
      </GridItem>
    ))
  }
  
  const StudyLayout = () => {
    results = results as PACSStudy[];
    return results.map((study) => (
      <GridItem key={study.studyInstanceUID}>
        <Card 
          isSelectable 
          isSelected={studyIsSelected(study)}
          onClick={select.bind(QueryResults, study)}
        >
          <CardBody>
            <Grid>
              <GridItem lg={6}>
                <p><b>{study.modalitiesInStudy}</b>, {study.studyDescription}</p>
                <p style={{ color: "gray" }}>
                  On {study.studyDate.toDateString()}, at {study.performedStationAETitle}
                </p>
              </GridItem>

              <GridItem lg={2}>
                <p><b>{study.patientName}</b></p>
                <p>{study.patientID}</p>
              </GridItem>

              <GridItem lg={2}>
                <p>Accession Number</p>
                <p>{study.accessionNumber}</p>
              </GridItem>

              <GridItem lg={2} style={{ color: "gray", textAlign: "right" }}>
                <Split>
                  <SplitItem isFilled style={{ marginRight: "1em" }}>
                    <p>{study.numberOfStudyRelatedSeries} series</p>
                    <p>{study.numberOfStudyRelatedInstances} files</p>
                  </SplitItem>
                  <SplitItem>
                    <Button variant="secondary">Browse</Button>
                  </SplitItem>
                </Split>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      </GridItem>
    ))
  }

  switch (layout) {
    case QueryResultLayouts.PATIENT:
      return (
        <Grid hasGutter id="pacs-query-results">
          { PatientLayout() }
        </Grid>
      );

    case QueryResultLayouts.STUDY:
      return (
        <Grid hasGutter id="pacs-query-results">
          { StudyLayout() }
        </Grid>
      )
  }
}

const PatientDetailsTab = (props: { patient:PACSPatient }) => {
  const { patient } = props;
  return (
    <Card>
      <CardHeader>
        <b>Patient Details</b>
      </CardHeader>
      <CardBody>
        <Split>
          <SplitItem className="details-name-col">
            <p>Sex</p>
            <p>DOB</p>
          </SplitItem>
          <SplitItem isFilled>
            <p>{ patient.sex }</p>
            <p>{ patient.birthDate.toDateString() }</p>
          </SplitItem>
        </Split>
      </CardBody>
    </Card>
  )
}

export default QueryResults
