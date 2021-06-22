import React, { useCallback, useContext, useState } from "react";
import Wrapper from "../../../../containers/Layout/PageWrapper";
import { Text, TextVariants, Grid, GridItem } from "@patternfly/react-core";

import PFDCMClient, { PACSStudy, PFDCMFilters } from "../../../../api/pfdcm";
import { LibraryContext } from "../../Library";
import QueryBuilder from "./QueryBuilder";
import QueryResults from "./QueryResults";

export enum PFDCMQueryTypes {
  PATIENT,
  STUDY,
}

export interface PFDCMQuery {
  type: PFDCMQueryTypes
  value: any
  filters: PFDCMFilters | null
}

export const PACS = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const library = useContext(LibraryContext);
  // const Client = new PFDCMClient()

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PACSStudy[]>()

  const StartPACSQuery = useCallback(
    ({ type, value, filters }: PFDCMQuery) => {
      setLoading(true);

      let query;
      switch (type) {
        // case PFDCMQueryTypes.MRN:
        //   query = PFDCMClient.queryByMrn(value, filters as PFDCMFilters);
        //   break;

        case PFDCMQueryTypes.PATIENT:
          query = PFDCMClient.queryByPatientName(value, filters as PFDCMFilters);
          break;
          
        case PFDCMQueryTypes.STUDY:
          query = PFDCMClient.queryByStudy(value, filters as PFDCMFilters);
          break;

        default:
          throw Error()
      }

      query.then((result) => {
        setResults(result);
        setLoading(false);
      })
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

          {
            !loading && results && (
              <GridItem>
                <QueryResults results={results} />
              </GridItem>
            )
          }
        </Grid>
      </article>
    </Wrapper>
  )
}

export default PACS
