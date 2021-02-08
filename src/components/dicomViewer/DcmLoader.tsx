import * as React from "react";
import { Spinner } from "@patternfly/react-core";

interface DicomLoaderProps {
  totalFiles: number;
  filesParsed: number;
}

const DcmLoader: React.FunctionComponent<DicomLoaderProps> = ({
  totalFiles,
  filesParsed,
}) => {
  
  return (
    <div className="loader">
      <Spinner size="xl" />
      <span>{`${filesParsed} of ${totalFiles} loaded`}</span>
    </div>
  );
};

export default DcmLoader;
