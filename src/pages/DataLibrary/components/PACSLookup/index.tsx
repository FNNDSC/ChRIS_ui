import React, { useCallback, useState } from "react";
import Wrapper from "../../../../containers/Layout/PageWrapper";
import {
  Text,
  TextVariants,
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

export enum PFDCMQueryTypes {
  PATIENT,
  DATE,
  MRN,
}

export interface PFDCMQuery {
  type: PFDCMQueryTypes
  value: any
  filters: PFDCMFilters | null
}

export const PACS = () => {
	document.title = 'PACS Lookup';

  const [loading, setLoading] = useState<boolean>();
  const [results, setResults] = useState<PACSPatient[]>();

  const StartPACSQuery = useCallback(
    async ({ type, value, filters }: PFDCMQuery) => {
      setLoading(true);

      let response: PACSPatient[];
      switch (type) {
        case PFDCMQueryTypes.PATIENT:
          response = await PFDCMClient.queryByPatientName(value, filters as PFDCMFilters);
          break;

        case PFDCMQueryTypes.DATE:
          // response = await PFDCMClient.queryByPatientName(value, filters as PFDCMFilters);
          break;

        case PFDCMQueryTypes.MRN:
          response = await PFDCMClient.queryByMrn(value, filters as PFDCMFilters);
          break;

        default:
          throw Error()
      }

      setTimeout(() => {
        setResults(response);
        setLoading(false);
      }, 2000)
    },
  [])

  return (
    <Wrapper>
      <article>
        <Grid hasGutter>
          <GridItem><Text component={TextVariants.h1}>PACS Lookup System</Text></GridItem>

          <GridItem>
            <QueryBuilder onFinalize={StartPACSQuery} />
          </GridItem>
          
          <GridItem/>

          { loading !== undefined ?(
              !loading ? (
                results ? (
                  <>
                    <GridItem>
                      <h2><b>Results</b></h2>
                      <p>{results.length} patients matched your search.</p>
                    </GridItem>

                    <GridItem>
                      <QueryResults results={results} />
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
                    Loading
                  </Title>
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
