import { PageSection, Grid, GridItem } from "@patternfly/react-core";
import WrapperConnect from "../Wrapper";
import Results from "./Results";
import QueryBuilder from "./QueryBuilder";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";
import { PFDCMClient, PFDCMPull } from "./pfdcm";
import {
  PFDCMQuery,
  PACSPatient,
  PFDCMQueryTypes,
  PFDCMFilters,
  PACSPullStages,
} from "./types";

const client = new PFDCMClient();

const Pacs = () => {
  const dispatch = useDispatch();
  const [pacsServices, setPACSServices] = useState<string[]>();
  const [selectedPacs, setSelectedPacs] = useState<string>();
  const [progress, setProgress] = useState<[number, number]>([0, 0]);
  const [results, setResults] = useState<PACSPatient[]>();

  console.log("Progress", progress);

  useEffect(() => {
    client.getPacsServices().then((list) => {
      if (!client.service) {
        client.service =
          list.length > 1
            ? list[1]
            : (list.slice(list.length - 1).shift() as string);

        setSelectedPacs(client.service);
      }

      setPACSServices(list);
    });
  }, []);

  useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "pacs",
      })
    );
  });

  const handlePacsSelect = (key: string) => {
    console.log("Handled:");

    /**
     * Client handles validation of PACS
     * service key internally.
     */

    client.service = key;
    setSelectedPacs(client.service);
  };

  const startPacsQuery = async (queries: PFDCMQuery[]) => {
    console.log("Started:", queries);

    const response: PACSPatient[] = [];
    setProgress([0, queries.length]);

    for (let q = 0; q < queries.length; q++) {
      const { type, value, filters } = queries[q];
      switch (type) {
        case PFDCMQueryTypes.pmrn:
          response.push(
            ...(await client.find({ PatientID: value, ...filters }))
          );
          break;

        case PFDCMQueryTypes.name:
          response.push(
            ...(await client.find({ PatientName: value, ...filters }))
          );
          break;

        case PFDCMQueryTypes.accession_number:
          response.push(
            ...(await client.find({ AccessionNumber: value, ...filters }))
          );
          break;

        default:
          throw TypeError("Unsupported PFDCM Query Type");
      }
      setProgress([q + 1, queries.length]);
    }
    console.log("Response", response);
    setResults(response);
  };

  const handlePacsStatus = async (query: PFDCMFilters) => {
    console.log("Handle Pacs Status");
    return client.status(query) as Promise<PFDCMPull>;

    //return client.status(query);
  };

  const executePacsState = (query: PFDCMFilters, stage: PACSPullStages) => {
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
  };

  return (
    <WrapperConnect>
      <PageSection>
        <Grid>
          <GridItem>
            <QueryBuilder
              selectedPacs={selectedPacs}
              pacsServices={pacsServices}
              onSelectPacs={handlePacsSelect}
              onFinalize={startPacsQuery}
            />
          </GridItem>
          <GridItem>
            {!results ? (
              <div>Looking for Results</div>
            ) : (
              <Results
                results={results}
                onRequestStatus={handlePacsStatus}
                onExecutePACSStage={executePacsState}
              />
            )}
          </GridItem>
        </Grid>
      </PageSection>
    </WrapperConnect>
  );
};

export default Pacs;
