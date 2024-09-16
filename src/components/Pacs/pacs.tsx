import LonkClient from "../../api/lonk";
import FpClient from "../../api/fp/chrisapi.ts";
import React from "react";
import { PACSqueryCore } from "../../api/pfdcm";
import PacsInput from "./components/input.tsx";

type PacsQRProps = {
  lonkClient: LonkClient;
  fpClient: FpClient;
  services: ReadonlyArray<string>;
  service: string;
  setService: (service: string) => void;
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
const PacsQR: React.FC<PacsQRProps> = ({
  lonkClient,
  fpClient,
  services,
  service,
  setService,
}) => {
  const [query, setQuery] = React.useState<PACSqueryCore>({});

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
    </>
  );
};

export default PacsQR;
