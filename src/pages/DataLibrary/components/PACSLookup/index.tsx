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
  NONE, RETRIEVE, PUSH, REGISTER, COMPLETED
}

export type PACSPull = {
  stage: PACSPullStages
  status: string
  progress: number
}

export type PACSPulls = Map<string, PACSPull>

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
    [],
  )

  const handlePACSSelect = (key: string) => {
    /**
     * Client handles validation of PACS 
     * service key internally.
     */
    client.service = key;
    setSelectedPACS(client.service)
  }

  const [pacspulls, setPACSPulls] = useState<PACSPulls>(new Map());

  const executePACSStage = useCallback(
    (query: PFDCMFilters, stage: PACSPullStages) => {
      console.log("##  Advance")
  
      try {
        console.log("##  Advance Trying", "STAGE", stage)
        switch (stage) {
          case PACSPullStages.RETRIEVE:
            return client.findRetrieve(query);
  
          case PACSPullStages.PUSH:
            return client.findPush(query);
  
          case PACSPullStages.REGISTER:
            return client.findRegister(query);
          
          // case PACSPullStages.REGISTER:
          case PACSPullStages.COMPLETED:
            return;
        }
      } catch (error) {
        console.error(error);
      }
    },
    [],
  )
  
  const handlePACSStatus = useCallback(
    async (query?: PFDCMFilters) => {
      /**
       * Find then status of query
       * if status ~= nothing done, do nothing
       * if status ~= images recieved, add query to pacspulls
       *              advance push stage, start polling
       * if status ~= images pushed, add query to pacspulls
       *              advance register stage, start polling
       */

      const pulls = pacspulls;
      console.log(pulls)

      const addPACSPull = (query: string, pull: PACSPull) => {
        pulls.set(JSON.stringify(query), pull);
      }

      const removePACSPull = (query: string) => {
        pulls.delete(JSON.stringify(query));
      }
  
      if (query) {  
        const pull = await client.status(query);
        console.log(pull)

        if (
          pull.stage !== PACSPullStages.NONE && 
          pull.stage !== PACSPullStages.COMPLETED &&
          !pulls.has(JSON.stringify(query))
        ) 
          addPACSPull(JSON.stringify(query), pull);
      }
  
      pulls.forEach(async (_pull, _query) => {
        console.log("##  Poll Trying")
        const pull = await client.status(Object(JSON.parse(_query)));
  
        if (pull.stage === PACSPullStages.COMPLETED)
          return removePACSPull(_query);
  
        if (pull != _pull)
          addPACSPull(_query, pull);

        if (pull.progress === 1)
          executePACSStage(Object(JSON.parse(_query)), pull.stage + 1);
      })
  
      if (pulls.size)
        setTimeout(handlePACSStatus.bind(PACS), 5000);

      setPACSPulls(pulls);
    },
    [executePACSStage, pacspulls],
  )

  const handlePACSPull = useCallback(
    (query: PFDCMFilters) => {
      console.log("##  Handler")
      const pulls = pacspulls;
      pulls.set(JSON.stringify(query), {
        progress: 0,
        stage: 1,
        status: "Requesting"
      });
  
      setPACSPulls(pulls);
      executePACSStage(query, 1);
      handlePACSStatus();
    },
    [executePACSStage, handlePACSStatus, pacspulls],
  )
  
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
