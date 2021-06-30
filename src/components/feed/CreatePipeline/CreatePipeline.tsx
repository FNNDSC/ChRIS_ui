import { Button } from "@patternfly/react-core";
import React from "react";
import { useHistory } from "react-router-dom";

const CreatePipeline = () => {
  const history = useHistory();

  return (
    <div>
      <Button variant="primary" onClick={() => history.push("/pipelines")}>
        Create New Pipeline
      </Button>
    </div>
  );
};

export default CreatePipeline;
