import * as React from "react";
import { LoadingSpinner } from "..";

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
      <LoadingSpinner color="#fff" isLocal />
      {`${filesParsed} of ${totalFiles} loaded`}
    </div>
  );
};

export default DcmLoader;
