import Wrapper from "../Wrapper";
import { Configuration as PfdcmConfig, PfdcmClient } from "../../api/pfdcm";

import ChrisAPIClient from "../../api/chrisapiclient.ts";
import PacsQRApp from "./app.tsx";
import { InfoSection } from "../Common";

/**
 * Get a PFDCM client for the URL specified by the environment variable
 * `VITE_PFDCM_URL`.
 */
function getEnvPfdcmClient(): PfdcmClient {
  const config = new PfdcmConfig({
    basePath: import.meta.env.VITE_PFDCM_URL,
  });
  return new PfdcmClient(config);
}

const PacsTitle = () => (
  <InfoSection
    title="PACS Query and Retrieve"
    content={
      <>
        Search for data from the hospital PACS and pull DICOM into{" "}
        <em>ChRIS</em>.
      </>
    }
  />
);

const WrappedPacsQRApp = () => (
  <Wrapper titleComponent={<PacsTitle />}>
    <PacsQRApp
      getChrisClient={ChrisAPIClient.getClient}
      getPfdcmClient={getEnvPfdcmClient}
    />
  </Wrapper>
);

export default WrappedPacsQRApp;
