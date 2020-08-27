import * as React from "react";
import { LoadingSpinner } from "..";

const DcmLoader: React.FunctionComponent = () => {
  return (
    <div className="loader">
      <LoadingSpinner color="#fff" isLocal />
    </div>
  );
};

export default DcmLoader;
