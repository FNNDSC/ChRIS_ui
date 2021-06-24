import React, { useCallback, useState } from "react";
import Wrapper from "../../../../containers/Layout/PageWrapper";
import { Text, TextVariants, Grid, GridItem } from "@patternfly/react-core";

import PFDCMClient, { PACSPatient, PACSStudy, PFDCMFilters } from "../../../../api/pfdcm";
import QueryBuilder from "./QueryBuilder";
import QueryResults, { QueryResultLayouts } from "./QueryResults";

export enum PFDCMQueryTypes {
  PATIENT,
  STUDY,
  MRN,
}

export interface PFDCMQuery {
  type: PFDCMQueryTypes
  value: any
  filters: PFDCMFilters | null
}

export const PACS = () => {
  // const Client = new PFDCMClient()

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PACSPatient[] | PACSStudy[]>();
  const [layout, setLayout] = useState(QueryResultLayouts.PATIENT);

  const StartPACSQuery = useCallback(
    async ({ type, value, filters }: PFDCMQuery) => {
      setLoading(true);

      let response;
      switch (type) {
        case PFDCMQueryTypes.MRN:
          response = await PFDCMClient.queryByMrn(value, filters as PFDCMFilters);
          setLayout(QueryResultLayouts.PATIENT);
          break;
          
        case PFDCMQueryTypes.PATIENT:
          response = await PFDCMClient.queryByPatientName(value, filters as PFDCMFilters);
          setLayout(QueryResultLayouts.PATIENT);
          break;
          
        case PFDCMQueryTypes.STUDY:
          response = await PFDCMClient.queryByStudy(value, filters as PFDCMFilters);
          setLayout(QueryResultLayouts.STUDY);
          break;

        default:
          throw Error()
      }

      setResults(response);
      setLoading(false);
    },
  [])

  function resultsCountText() {
    let str = `${results?.length} `;
    switch (layout) {
      case QueryResultLayouts.PATIENT:
        str += "patients"; break;
      case QueryResultLayouts.STUDY:
        str += "studies"; break;
    }
    str += ' matched your query';
    return str
  }

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
              <>
              <GridItem>
                <h2><b>Results</b></h2>
                <p>{resultsCountText()}</p>
              </GridItem>

              <GridItem>
                <QueryResults layout={layout} results={results} />
              </GridItem>
              </>
            )
          }
        </Grid>
      </article>
    </Wrapper>
  )
}

export default PACS
