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
import { CubesIcon } from "@patternfly/react-icons";
import pluralize from "pluralize";

import PFDCMClient, { PACSPatient, PACSPullStages, PFDCMFilters, PFDCMPull } from "../../../../api/pfdcm";
import QueryBuilder from "./QueryBuilder";
import QueryResults from "./QueryResults";

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

/**
 * @note This type had to be made `Map<string, PACSPull>`
 * instead of the preferrable `Map<PFDCMFilters, PACSPull>`
 * because Map.has() works with object references and 
 * not values so it always returned `false`.
 */
export class PACSPulls extends Map<string, PFDCMPull> {
  hasPull(key: PFDCMFilters): boolean {
    let _has = false;
    this.forEach((_, _key) => {
      if (_key === JSON.stringify(key))
        _has = true;
    })

    return _has;
  }

  getPull(key: PFDCMFilters): PFDCMPull | undefined {
    return this.get(JSON.stringify(key));
  }

  setPull(key: PFDCMFilters, value: PFDCMPull) {
    this.set(JSON.stringify(key), value)
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

  const [pacspulls, setPACSPulls] = useState<PACSPulls>(new PACSPulls);

  const executePACSStage = useCallback(
    (query: PFDCMFilters, stage: PACSPullStages) => {  
      try {
        console.log("##  Advance Trying", "STAGE", stage)
        switch (stage) {
          case PACSPullStages.RETRIEVE:
            return client.findRetrieve(query);
  
          case PACSPullStages.PUSH:
            return client.findPush(query);
  
          case PACSPullStages.REGISTER:
            return client.findRegister(query);
          
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
  
      if (query && !pulls.hasPull(query)) {  
        const pull = await client.status(query);
        console.log(pull)

        if (
          pull.stage !== PACSPullStages.NONE && 
          pull.stage !== PACSPullStages.COMPLETED
        ) 
          pulls.setPull(query, pull);
      }
  
      pulls.forEach(async (_pull, _query) => {
        console.log("##  Poll Trying")
        const pull = await client.status(_pull.query);
  
        if (pull.isPullCompleted)
          return pulls.delete(_query);
  
        pull.attempts = _pull.attempts;
        pull.errors = _pull.errors;

        /** If no change, this attempt failed */
        if (pull.equals(_pull))
          pull.attempts--;

        /** If we're out of attempts, show error */
        if (!pull.attempts)
          pull.errors.push(`Error while ${pull.statusText}`)

        pulls.set(_query, pull);

        if (pull.isStageCompleted)
          executePACSStage(_pull.query, pull.nextStage);
      })
  
      setPACSPulls(pulls);
      if (pulls.size)
        setTimeout(handlePACSStatus.bind(PACS), 5000);
    },
    [executePACSStage, pacspulls],
  )

  const handlePACSPull = useCallback(
    (query: PFDCMFilters, stage = PACSPullStages.RETRIEVE) => {
      const pulls = pacspulls;
      pulls.setPull(query, new PFDCMPull(stage, query));
  
      setPACSPulls(pulls);
      executePACSStage(query, stage);
      handlePACSStatus();
    },
    [executePACSStage, handlePACSStatus, pacspulls],
  )

  const Results = () => {
    if (loading === undefined)
      return null

    if (loading)
      return <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
        <Title size="lg" headingLevel="h4">
          Searching
        </Title>
        <EmptyStateBody>
          Completed { progress[0] } of { progress[1] } searches.
        </EmptyStateBody>
      </EmptyState>

    if (results)
      return <>
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
    else
      return <EmptyState>
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
  }
  
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
          
          <GridItem />
          <Results />
        </Grid>
      </article>
    </Wrapper>
  )
}

export default PACS
