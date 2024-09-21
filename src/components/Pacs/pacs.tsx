import LonkClient from "../../api/lonk";
import FpClient from "../../api/fp/chrisapi.ts";
import React from "react";
import { PACSqueryCore } from "../../api/pfdcm";
import PacsInput from "./components/input.tsx";
import PacsStudiesDisplay from "./components/PacsStudies.tsx";
import { useTypedSelector } from "../../store/hooks";

type PacsQRProps = {
  lonkClient: LonkClient;
  fpClient: FpClient;
  services: ReadonlyArray<string>;
  pushError: (title: string) => (e: Error) => void;
};

/**
 * PACS Query and Retrieve component.
 *
 * This component has a text input field for specifying a PACS query,
 * and provides functionality for:
 *
 * - searching for DICOM studies and series
 * - pulling DICOM series data into *ChRIS*
 */
const PacsQR: React.FC<PacsQRProps> = ({ lonkClient, fpClient, services }) => {
  const defaultService = React.useMemo(() => {
    const service = getDefaultPacsService(services);
    if (service === null) {
      throw new Error("No services configured with pfdcm");
    }
    return service;
  }, [services]);

  const [query, setQuery] = React.useState<PACSqueryCore>({});
  const [service, setService] = React.useState(defaultService);

  return (
    <>
      <PacsInput
        query={query}
        setQuery={setQuery}
        services={services}
        service={service}
        setService={setService}
        id="pacsqr-input"
      />

      {/*<PacsStudiesDisplay />*/}
    </>
  );
};

/**
 * Selects the default PACS service (which is usually not the PACS service literally called "default").
 *
 * 1. Selects the hard-coded "PACSDCM"
 * 2. Attempts to select the first value which is not "default" (a useless, legacy pfdcm behavior)
 * 3. Selects the first value
 */
function getDefaultPacsService(services: ReadonlyArray<string>): string | null {
  if (services.includes("PACSDCM")) {
    return "PACSDCM";
  }
  for (const service of services) {
    if (service !== "default") {
      return service;
    }
  }
  if (services) {
    return services[0];
  }
  return null;
}

export default PacsQR;
