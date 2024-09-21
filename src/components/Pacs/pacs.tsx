import LonkClient from "../../api/lonk";
import FpClient from "../../api/fp/chrisapi.ts";
import React from "react";
import { PACSqueryCore } from "../../api/pfdcm";
import PacsInput from "./components/input.tsx";
import PacsStudiesDisplay from "./components/PacsStudies.tsx";
import { useTypedSelector } from "../../store/hooks";
import { useSearchParams } from "react-router-dom";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";

type PacsQRProps = {
  lonkClient: LonkClient;
  fpClient: FpClient;
  services: ReadonlyNonEmptyArray<string>;
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
  const onSubmit = (service: string, query: PACSqueryCore) => {};

  return (
    <>
      <PacsInput onSubmit={onSubmit} services={services} />

      {/*<PacsStudiesDisplay />*/}
    </>
  );
};

export default PacsQR;
