import * as React from "react";
import { Spinner } from "@patternfly/react-core";



const LoadingSpinner: React.FunctionComponent<any> = () => {
  return (
    <div
      style={{
        margin: "0, auto",
        textAlign: "center",
      }}
    >
      <Spinner size="xl" />
    </div>
  );
};

export default LoadingSpinner;
