import React, { useContext, useState } from "react";
import {
  Badge,
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
import { PACSPatient, PACSSeries, PACSStudy } from "../../../../api/pfdcm";
import { LibraryContext } from "../../Library";

interface QueryResultsProps {
  results: PACSPatient[] | PACSStudy[]
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results }: QueryResultsProps) => {
  const library = useContext(LibraryContext);

  type PatientTabs = "studies" | string;
  const [patientTab, setPatientTab] = useState<PatientTabs>("studies");
  const [browserTabs, setBrowsableTabs] = useState<Array<{
    ref: React.RefObject<HTMLElement>
    study: PACSStudy
  }>>([]);

  const browseStudy = (study: PACSStudy) => {
    setPatientTab(study.studyInstanceUID);
    if (!browserTabs.map((t) => t.study).includes(study))
      setBrowsableTabs([ ...browserTabs,
        {
          ref: React.createRef<HTMLElement>(),
          study,
        }
      ]);
  }

  const [expanded, setExpanded] = useState<string>()
  const expand = (item:string) => {
    setPatientTab("studies")
    if (!expanded || expanded !== item) {
      setBrowsableTabs([])
      setExpanded(item)
    }
    else {
      setExpanded(undefined)
    }
  }

  const seriesIsSelected = (s: PACSSeries) => library.state.selectData.includes(s)

  const select = (item: PACSSeries | PACSSeries[]) => {
    if (Array.isArray(item)) {
      if (item.every((s) => !seriesIsSelected(s)))
        library.actions.select(item)
      else {
        library.actions.clear(item.map(s => s.seriesInstanceUID))
      }
    }
    else {
      if (library.state.selectData.includes(item))
        library.actions.clear(item.seriesInstanceUID)
      else
        library.actions.select(item)
    }
  }

  const PatientLayout = () => {
    results = results as PACSPatient[];
    const tabrefs: Array<React.RefObject<HTMLElement>> = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of results) {
      tabrefs.push(React.createRef<HTMLElement>())
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
        <Card isExpanded={(expanded === patient.ID)}>
          <CardHeader onExpand={expand.bind(QueryResults, patient.ID)}>
            <Grid hasGutter style={{ width: "100%" }}>
              <GridItem lg={9}>
                <p><b>{patient.name.split('^').reverse().join(" ")}</b> <Badge isRead>{patient.sex}</Badge></p>
                <p style={{ color: "gray" }}><b>MRN</b> {patient.ID}</p>
              </GridItem>

              <GridItem lg={3} style={{ textAlign: "right", color: "gray" }}>
                <p><b>{patient.studies.length} studies</b></p>
                <p>Latest on {LatestDate(patient.studies.map(s => s.studyDate)).toDateString()}</p>
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
                <Tab eventKey="studies" title="Studies" tabContentRef={tabrefs[index]} />

                {
                  browserTabs.map(({ ref, study }) => (
                    <Tab key={study.studyInstanceUID} 
                      eventKey={study.studyInstanceUID} 
                      title={study.studyDescription} 
                      tabContentRef={ref} 
                    />
                  ))
                }
              </Tabs>
            </SplitItem>

            <SplitItem isFilled className="expanded-content">
              <TabContent hidden={patientTab !== "studies"} 
                eventKey="studies" 
                id={`${patient.ID}-studies`} 
                ref={tabrefs[index]}
              >
                <p className="no-scrollbar patient-studies">
                  Studies performed on the patient are listed here. This does not include manually uploaded studies, 
                  only those in your PACS server. <b>Click <em>Browse</em> to view the series under a study.</b>
                </p>
                <Grid hasGutter className="no-scrollbar patient-studies">
                  {
                    patient.studies.map((study) => (
                      <GridItem key={study.studyInstanceUID}>
                        <Card 
                          isSelectable 
                          isSelected={study.series.every(seriesIsSelected)}
                        >
                          <CardBody>
                            <Split>
                              <SplitItem style={{ minWidth: "50%" }}>
                                <p><b>{study.studyDescription}</b> {study.modalitiesInStudy.split('\\').map(m => (
                                  <Badge style={{ margin: "auto 0.125em" }} key={m}>{m}</Badge>
                                ))}</p>
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
                                <Button variant="link" style={{ padding: "0" }} onClick={() => browseStudy(study)}>
                                  Browse
                                </Button>
                              </SplitItem>
                            </Split>
                          </CardBody>
                        </Card>
                      </GridItem>
                    ))
                  }
                </Grid>
              </TabContent>

              {
                browserTabs.map(({ ref, study }) => (
                  <TabContent key={study.studyInstanceUID} hidden={study.studyInstanceUID !== patientTab}
                    eventKey={study.studyInstanceUID} 
                    id={study.studyInstanceUID} 
                    ref={ref}
                  >
                    <p className="no-scrollbar patient-series">
                      Series in the selected study are listed here. The series which exist in your ChRIS Storage will be immediately viewable.  <b>
                        Select a series or click Pull to download them to your ChRIS Storage.</b>
                    </p>
                    <Grid hasGutter className="no-scrollbar patient-series">
                      {
                        study.series.map((series: PACSSeries) => (
                          <GridItem key={series.seriesInstanceUID}>
                            <Card 
                              isSelectable 
                              isSelected={seriesIsSelected(series)}
                              onClick={select.bind(QueryResults, series)}
                            >
                              <CardBody>
                                <Split>
                                  <SplitItem style={{ minWidth: "50%" }}>
                                    <Badge>{series.modality}</Badge> <span style={{ fontSize: "small" }}>
                                      { series.seriesDescription }
                                    </span>
                                  </SplitItem>
                                  <SplitItem>
                                    <Badge isRead>{series.status}</Badge>
                                  </SplitItem>
                                  <SplitItem isFilled/>
                                  <SplitItem style={{ color: "gray", margin: "0 2em",  textAlign: "right" }}>
                                    {series.numberOfSeriesRelatedInstances} files
                                  </SplitItem>
                                  <SplitItem>
                                    <Button variant="link" style={{ padding: "0" }}>Pull</Button>
                                  </SplitItem>
                                </Split>
                              </CardBody>
                            </Card>
                          </GridItem>
                        ))
                      }
                    </Grid>
                  </TabContent>
                ))
              }
            </SplitItem>
          </Split>
        }
      </GridItem>
    ))
  }

  return (
    <Grid hasGutter id="pacs-query-results">
      { PatientLayout() }
    </Grid>
  );
}

export default QueryResults
