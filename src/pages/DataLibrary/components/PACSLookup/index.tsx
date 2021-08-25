import React, { useCallback, useEffect, useState } from "react";
import Wrapper from "../../../../containers/Layout/PageWrapper";
import {
  Grid,
  GridItem,
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Title,
  Button,
  EmptyStateBody,
  EmptyStatePrimary,
} from "@patternfly/react-core";

import PFDCMClient, { PACSPatient, PFDCMFilters } from "../../../../api/pfdcm";
import QueryBuilder from "./QueryBuilder";
import QueryResults from "./QueryResults";
import { CubesIcon } from "@patternfly/react-icons";
import pluralize from "pluralize";

export enum PFDCMQueryTypes {
  PATIENT,
  DATE,
  MRN,
}

export interface PFDCMQuery {
  type: PFDCMQueryTypes
  value: any
  filters: PFDCMFilters
}

export enum PACSPullStages {
  ERROR, RETRIEVE, PUSH, REGISTER, COMPLETED
}

export type PACSPulls = Map<
  PFDCMFilters, {
    query: PFDCMFilters
    stage: PACSPullStages
    status: string
    progress: number
  }
>

export const __stageText = (stage:PACSPullStages) => {
  switch (stage) {
    case PACSPullStages.ERROR:     return "Error";
    case PACSPullStages.RETRIEVE:  return "Retrieving";
    case PACSPullStages.PUSH:      return "Pushing";
    case PACSPullStages.REGISTER:  return "Registering";
    case PACSPullStages.COMPLETED: return "Completed";
  }
}

const client = new PFDCMClient;

export const PACS = () => {
	document.title = 'PACS Lookup';

  const [loading, setLoading] = useState<boolean>();
  const [progress, setProgress] = useState<[number, number]>([0,0]);

  const [results, setResults] = useState<PACSPatient[]>();
  const [selectedPACS, setSelectedPACS] = useState<string>();
  const [PACSservices, setPACSservices] = useState<string[]>();

  useEffect(() => {
    client.getPACSservices().then((list) => {
      setPACSservices(list);

      if (!client.service) {
        if (list.length === 1)
          client.service = list.shift() as string
        else if (list.length > 1)
          client.service = list[1];
      }

      setSelectedPACS(client.service)
    })
  }, [])

  const StartPACSQuery = useCallback(
    async (queries: PFDCMQuery[]) => {
      setLoading(true);
      const response: PACSPatient[] = [];
      setProgress([0, queries.length]);

      for (let q = 0; q < queries.length; q++) {
        const { type, value, filters } = queries[q];

        switch (type) {
          case PFDCMQueryTypes.PATIENT:
            response.push(...(await client.queryByPatientName(value, filters)));
            break;

          case PFDCMQueryTypes.DATE:
            response.push(...(await client.queryByStudyDate(value, filters)));
            break;

          case PFDCMQueryTypes.MRN:
            response.push(...(await client.queryByPatientID(value, filters)));
            break;

          default:
            throw TypeError('Unsupported PFDCM Query Type');
        }

        setProgress([q + 1, queries.length]);
      }

      setResults(response);
      setLoading(false);
    },
  [])

  const handlePACSSelect = (key: string) => {
    client.service = key;
    setSelectedPACS(client.service)
  }

  const [pacspulls, setPACSPulls] = useState<PACSPulls>(new Map());
  const [pacsPullStage, setPacsPullStage] = useState(PACSPullStages.RETRIEVE);

  const handlePACSStatus = async (query: PFDCMFilters) => {
    /**
     * Find then status of query
     * if status ~= nothing done, do nothing
     * if status ~= images recieved, add query to pacspulls
     *              advance push stage, start polling
     * if status ~= images pushed, add query to pacspulls
     *              advance register stage, start polling
     */

    // const status = await client.find(query);
    // setTimeout(onPACSStatus.bind(PACS, query), 5000);
  }

  const handlePACSPull = useCallback(
    async (query: PFDCMFilters) => {
      let then;
      let condition = true;

      // while (pacsPullStage !== PACSPullStages.COMPLETED && condition)
      try {
        switch (pacsPullStage) {
          case PACSPullStages.RETRIEVE:
            ({ then } = (await client.findRetrieve(query)));
            condition = !then.status;
            break;

          case PACSPullStages.PUSH:
            ({ then } = (await client.findPushSwift(query)));
            condition = then["00-push"].study.every((study:any) => {
              for (const studyUID in study) {
                if (Object.prototype.hasOwnProperty.call(study, studyUID)) {
                  return study[studyUID].every((series:any) => series.status)               
                }
              }
            })
            break;

          case PACSPullStages.REGISTER:
            ({ then } = (await client.findRegisterCube(query)));
            condition = then["00-register"].study.every((study:any) => {
              for (const studyUID in study) {
                if (Object.prototype.hasOwnProperty.call(study, studyUID)) {
                  return study[studyUID].every((series:any) => series.status)               
                }
              }
            })
            break;
        }

        if (condition)
          setPacsPullStage(pacsPullStage + 1);
      } catch (error) {
        console.error(error);
        condition = false;
        return;
      }
    },
    [pacsPullStage]
  )

  // const onPACSPull = useCallback(
  //   async (query: PFDCMFilters) => {
  //     let then;
  //     let condition = true;

  //     try {
  //       ({ then } = (await client.findRetrieve(query)));
  //       condition = !then.status;
  //       // for (let i = 1000000; i < 0; i--) {}
  //       if (condition) setPacsPullStage(pacsPullStage + 1);

  //       ({ then } = (await client.findPushSwift(query)));
  //       condition = then["00-push"].study.every((study:any) => {
  //         for (const studyUID in study) {
  //           if (Object.prototype.hasOwnProperty.call(study, studyUID)) {
  //             return study[studyUID].every((series:any) => series.status)               
  //           }
  //         }
  //       })
  //       // for (let i = 1000000; i < 0; i--) {}
  //       if (condition) setPacsPullStage(pacsPullStage + 1);

  //       ({ then } = (await client.findRegisterCube(query)));
  //       condition = then["00-register"].study.every((study:any) => {
  //         for (const studyUID in study) {
  //           if (Object.prototype.hasOwnProperty.call(study, studyUID)) {
  //             return study[studyUID].every((series:any) => series.status)               
  //           }
  //         }
  //       })
  //       // for (let i = 1000000; i < 0; i--) {}
  //       if (condition) setPacsPullStage(pacsPullStage + 1);
  //     } catch (error) {
  //       console.error(error);
  //       condition = false;
  //       setPacsPullStage(PACSPullStages.ERROR);
  //       return;
  //     }
  //   },
  //   [pacsPullStage]
  // )

  // const onPACSPull = useCallback(
  //   (query: PFDCMFilters) => {
  //     let condition = true;

  //     client.findRetrieve(query).then(
  //       ({ then }) => setTimeout(() => {
  //         condition = !then.status;
  //         if (condition) setPacsPullStage(pacsPullStage + 1);

  //         client.findPushSwift(query).then(
  //           ({ then }) => setTimeout(() => {
  //             condition = then["00-push"].study.every((study:any) => {
  //               for (const studyUID in study) {
  //                 if (Object.prototype.hasOwnProperty.call(study, studyUID)) {
  //                   return study[studyUID].every((series:any) => series.status)               
  //                 }
  //               }
  //             })
  //             if (condition) setPacsPullStage(pacsPullStage + 1);

  //             client.findRegisterCube(query).then(
  //               ({ then }) => setTimeout(() => {
  //                 condition = then["00-register"].study.every((study:any) => {
  //                   for (const studyUID in study) {
  //                     if (Object.prototype.hasOwnProperty.call(study, studyUID)) {
  //                       return study[studyUID].every((series:any) => series.status)               
  //                     }
  //                   }
  //                 })
  //                 if (condition) setPacsPullStage(pacsPullStage + 1);
  //               }, 2000)
  //             ).catch((error)=>{
  //               console.error(error);
  //               setPacsPullStage(PACSPullStages.ERROR);
  //             })
  //           }, 2000)
  //         ).catch((error)=>{
  //           console.error(error);
  //           setPacsPullStage(PACSPullStages.ERROR);
  //         })
  //       }, 2000)
  //     ).catch((error)=>{
  //       console.error(error);
  //       setPacsPullStage(PACSPullStages.ERROR);
  //     })
  //   },
  //   [pacsPullStage]
  // )

  return (
    <Wrapper>
      <article>
        <Grid hasGutter>
          <GridItem>
            <h1>PACS Lookup System</h1>
            <p></p>
          </GridItem>

          <GridItem>
            <QueryBuilder 
              PACS={selectedPACS} 
              PACSservices={PACSservices} 
              onSelectPACS={handlePACSSelect} 
              onFinalize={StartPACSQuery} 
            />
          </GridItem>
          
          <GridItem/>

          { loading !== undefined ? (
              !loading ? (
                results ? (
                  <>
                    <GridItem>
                      <h2><b>Results</b></h2>
                      <div>{results.length} {pluralize('patient', results.length)} matched your search.</div>
                    </GridItem>

                    <GridItem>
                      <QueryResults 
                        results={results} 
                        pulls={pacspulls}
                        onRequestPull={handlePACSPull}
                        onRequestStatus={handlePACSStatus}
                      />
                    </GridItem>
                  </>
                ) : (
                  <EmptyState>
                    <EmptyStateIcon variant="container" component={CubesIcon} />
                    <Title size="lg" headingLevel="h4">
                      No results found
                    </Title>
                    <EmptyStateBody>
                      No results match the filter criteria. Clear all filters to show results.
                    </EmptyStateBody>
                    <EmptyStatePrimary>
                      <Button variant="link">Clear all filters</Button>
                    </EmptyStatePrimary>
                  </EmptyState>
                )
              ) : (
                <EmptyState>
                  <EmptyStateIcon variant="container" component={Spinner} />
                  <Title size="lg" headingLevel="h4">
                    Searching
                  </Title>
                  <EmptyStateBody>
                    Completed { progress[0] } of { progress[1] } searches.
                  </EmptyStateBody>
                </EmptyState>
              )
            ) : null
          }
        </Grid>
      </article>
    </Wrapper>
  )
}

export default PACS
