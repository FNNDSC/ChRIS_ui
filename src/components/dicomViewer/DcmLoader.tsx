import * as React from "react";
import { Spinner } from "@patternfly/react-core";

interface DcmLoaderProps {
  totalFiles: number;
  filesParsed: number;
}

const DicomLoader: React.FunctionComponent<DcmLoaderProps> = ({
  totalFiles,
  filesParsed,
}: DcmLoaderProps) => (
    <div className="loader">
      <Spinner size="xl" />
      <span>{`${filesParsed} of ${totalFiles} loaded`}</span>
    </div>
  );

export default DicomLoader;
