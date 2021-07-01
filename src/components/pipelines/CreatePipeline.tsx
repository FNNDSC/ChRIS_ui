import { Button } from "@patternfly/react-core";
import React from "react";
import { useHistory } from "react-router-dom";

const CreatePipeline = () => {
  const history = useHistory();

  return (
    <div>
      <Button isLarge style={{ borderRadius: "4px"}} variant="primary" onClick={() => history.push("/pipelines")}>
        Create New Pipeline
      </Button>
    </div>
  );
};

export default CreatePipeline;
