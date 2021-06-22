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
import { PACSStudy } from "../../../../api/pfdcm";
import { LibraryContext } from "../../Library";

interface QueryResultsProps {
  results: PACSStudy[]
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results }: QueryResultsProps) => {
  const patients: string[] = [];
  const accumulator = [];
  for (const res of results) {
    if (patients.includes(res.patientID)) 
      accumulator[patients.indexOf(res.patientID)].studies.push(res)
    else {
      patients.push(res.patientID);
      accumulator.push({
        ...res,
        studies: [ res ],
        detailsRef: React.createRef<HTMLElement>(),
        studiesRef: React.createRef<HTMLElement>(),
      });
    }
  }

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

  const select = (item: PACSStudy) => {
    if (library.state.selectData.includes(item))
      library.actions.clear(item.studyInstanceUID)
    else
      library.actions.select(item)
  }

  return (
    <Grid hasGutter id="pacs-query-results">
      <GridItem>
        <h2><b>Results</b></h2>
        <p>{accumulator.length} patients matched your query.</p><br />
      </GridItem>

      {
        accumulator.map(({ patientID, patientName, studies, ...patient }) => (
          <GridItem key={patientID}>
            <Card 
              isExpanded={(expanded === patientID)} 
              onClick={expand.bind(QueryResults, patientID)}
            >
              <CardHeader onExpand={expand.bind(QueryResults, patientID)}>
                <Split>
                  <SplitItem><b>{patientName}</b>, MRN {patientID}</SplitItem>
                  <SplitItem isFilled />
                  <SplitItem><p>{studies.length} studies</p></SplitItem>
                </Split>
              </CardHeader>
            </Card>

            { (expanded === patientID) &&
              <Split className="result-expanded">
                <SplitItem className="expanded-tabs">
                  <Tabs 
                    isVertical 
                    isSecondary
                    unmountOnExit
                    activeKey={patientTab} 
                    onSelect={(_, tab) => setPatientTab(tab as PatientTabs)}
                  >
                    <Tab eventKey="details" title="Details" tabContentRef={patient.detailsRef} />
                    <Tab eventKey="studies" title="Studies" tabContentRef={patient.studiesRef} />
                  </Tabs>
                </SplitItem>

                <SplitItem isFilled className="expanded-content">
                  <TabContent 
                    eventKey="details" 
                    id={`${patientID}-details`} 
                    ref={patient.detailsRef} 
                    className="patient-details"
                  >
                    <PatientDetailsTab patient={{patientID, patientName, ...patient}} />
                  </TabContent>

                  <TabContent hidden 
                    eventKey="studies" 
                    id={`${patientID}-studies`} 
                    ref={patient.studiesRef} 
                    className="no-scrollbar patient-studies"
                  >
                    <Grid hasGutter>
                      {
                        studies.map(({ studyDate, studyDescription, ...study }, studyindex) => (
                          <GridItem key={study.studyInstanceUID}>
                            <Card 
                              isSelectable 
                              isSelected={library.state.selectData.includes(studies[studyindex])}
                              onClick={select.bind(QueryResults, studies[studyindex])}
                            >
                              <CardBody>
                                <Split>
                                  <SplitItem style={{ minWidth: "50%" }}>
                                    <p><b>{study.modalitiesInStudy}</b>, {studyDescription}</p>
                                    <p style={{ color: "gray" }}>
                                      On {studyDate.toDateString()}, at {study.performedStationAETitle}
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
    </Grid>
  )
}

const PatientDetailsTab = (props:{ patient: PACSStudy }) => {
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
            <p>{ patient.patientSex }</p>
            <p>{ patient.patientBirthDate.toDateString() }</p>
          </SplitItem>
        </Split>
      </CardBody>
    </Card>
  )
}

export default QueryResults
