import React, { useContext, useState } from "react";
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
  Split,
  SplitItem,
  Title,
  Tooltip,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons";
import Moment from "react-moment";

import "./pacs-lookup.scss";
import { PACSPatient, PACSSeries, PACSStudy } from "../../../../api/pfdcm";
import { LibraryContext } from "../../Library";

interface QueryResultsProps {
  results: PACSPatient[] | PACSStudy[]
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results }: QueryResultsProps) => {
  const library = useContext(LibraryContext);

  const [expandedPatient, setExpandedPatient] = useState<string>()
  const expandPatient = (item:string) => {
    if (!expandedPatient || expandedPatient !== item)
      setExpandedPatient(item);
    else {
      setExpandedPatient(undefined);
    }
  }

  const [expandedStudy, setExpandedStudy] = useState<string>()
  const expandStudy = (item:string) => {
    if (!expandedStudy || expandedStudy !== item)
      setExpandedStudy(item);
    else
      setExpandedStudy(undefined);
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

    const LatestDate = (dates: Date[]) => {
      let latestStudy = dates[0];
      for (const date of dates) {
        if (latestStudy.getTime() < date.getTime())
          latestStudy = date;
      }
      return latestStudy
    }

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

    return results.map((patient) => (
      <GridItem key={patient.ID}>
        <Card isExpanded={(expandedPatient === patient.ID)}>
          <CardHeader onExpand={expandPatient.bind(QueryResults, patient.ID)}>
            <Grid hasGutter style={{ width: "100%" }}>
              <GridItem lg={2}>
                <div><b>{patient.name.split('^').reverse().join(" ")}</b></div>
                <div>MRN {patient.ID}</div>
              </GridItem>
              <GridItem lg={1}>
                <div><b>Sex</b></div>
                <div>({patient.sex})</div>
              </GridItem>
              <GridItem lg={6}>
                <div><b>DoB</b></div>
                <div><Moment format="MMMM Do YYYY">{patient.birthDate.getTime()}</Moment></div>
              </GridItem>

              <GridItem lg={3} style={{ textAlign: "right", color: "gray" }}>
                <div><b>{patient.studies.length} studies</b></div>
                <div>Latest on {LatestDate(patient.studies.map(s => s.studyDate)).toDateString()}</div>
              </GridItem>
            </Grid>
          </CardHeader>
        </Card>

        { (expandedPatient === patient.ID) &&
          <>
          <Grid hasGutter className="patient-studies">
            {
              patient.studies.map((study) => (
                <GridItem key={study.studyInstanceUID}>
                  <Card 
                    isSelectable 
                    isSelected={study.series.every(seriesIsSelected)}
                    isExpanded={expandedStudy === study.studyInstanceUID}
                  >
                    <CardHeader onExpand={expandStudy.bind(QueryResults, study.studyInstanceUID)}>
                      <Split>
                        <SplitItem style={{ minWidth: "50%" }}>
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
                          <div>Modalities</div>
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
                            { study.performedStationAETitle.startsWith("no value") ? '' : study.performedStationAETitle }
                          </div>
                        </SplitItem>
                        <SplitItem style={{ color: "gray", margin: "0 0 0 2em",  textAlign: "right" }}>
                          <Button variant="link" style={{ padding: "0" }} onClick={() => expandStudy(study.studyInstanceUID)}>
                            Browse
                          </Button>
                          <div>{(study.numberOfStudyRelatedInstances * 0.2).toFixed(2)} MB</div>
                        </SplitItem>
                      </Split>
                    </CardHeader>
                  </Card>

                  { expandedStudy === study.studyInstanceUID &&
                    <Grid hasGutter className="patient-series">
                      { study.series.map((series: PACSSeries) => (
                        <GridItem key={series.seriesInstanceUID}>
                          <Card 
                            isSelectable 
                            isSelected={seriesIsSelected(series)}
                            onClick={select.bind(QueryResults, series)}
                          >
                            <CardBody>
                              <Split>
                                <SplitItem style={{ minWidth: "50%" }}>
                                  <Badge style={{ margin: "0 1em 0 0" }}>{series.modality}</Badge> <span style={{ fontSize: "small" }}>
                                    { series.seriesDescription }
                                  </span>
                                </SplitItem>
                                <SplitItem>
                                  {
                                    !series.status.toLowerCase().includes("success") ? (
                                      <Badge isRead>{series.status}</Badge>
                                    ) : null
                                  }
                                </SplitItem>
                                <SplitItem isFilled/>
                                <SplitItem style={{ color: "gray", margin: "0 2em",  textAlign: "right" }}>
                                  {(series.numberOfSeriesRelatedInstances * 0.2).toFixed(2)} MB
                                  {/* {series.numberOfSeriesRelatedInstances} files */}
                                </SplitItem>
                                <SplitItem>
                                  <Button variant="link" style={{ padding: "0" }}>Pull</Button>
                                </SplitItem>
                              </Split>
                            </CardBody>
                          </Card>
                        </GridItem>
                      ))}
                    </Grid>
                  }
                </GridItem>
              ))
            }
          </Grid>
          </>
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
