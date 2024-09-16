import Wrapper from "../Wrapper";
import { Configuration as PfdcmConfig, PfdcmClient } from "../../api/pfdcm";

import ChrisAPIClient from "../../api/chrisapiclient.ts";
import PacsQRApp from "./app.tsx";

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

const WrappedPacsQRApp = () => (
  <Wrapper>
    <PacsQRApp
      getChrisClient={ChrisAPIClient.getClient}
      getPfdcmClient={getEnvPfdcmClient}
    />
  </Wrapper>
);

export default WrappedPacsQRApp;
