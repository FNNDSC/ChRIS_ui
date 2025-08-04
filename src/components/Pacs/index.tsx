import ChrisAPIClient from "../../api/chrisapiclient.ts";
import { PfdcmClient, Configuration as PfdcmConfig } from "../../api/pfdcm";
import type { State } from "../../reducers/pacs";
import { InfoSection } from "../Common";
import Wrapper from "../Wrapper";
import PacsApp from "./PacsApp.tsx";

/**
 * Get a PFDCM client for the URL specified by the environment variable
 * `VITE_PFDCM_URL`.
 */
const getEnvPfdcmClient = (): PfdcmClient => {
  const config = new PfdcmConfig({
    basePath: import.meta.env.VITE_PFDCM_URL,
  });
  return new PfdcmClient(config);
};

const PacsTitle = () => (
  <InfoSection
    title="Query and Retrieve PACS"
    content={
      <>
        Search for data from the hospital PACS and pull DICOM into{" "}
        <em>ChRIS</em>.
      </>
    }
  />
);

type Props = {
  pacs: State;
};
export default (props: Props) => {
  const { pacs } = props;
  return (
    <Wrapper titleComponent={<PacsTitle />}>
      <PacsApp
        getChrisClient={ChrisAPIClient.getClient}
        getPfdcmClient={getEnvPfdcmClient}
        pacs={pacs}
      />
    </Wrapper>
  );
};
