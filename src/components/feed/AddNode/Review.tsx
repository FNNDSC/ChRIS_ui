import React from "react";
import { Grid, GridItem, Alert } from "@patternfly/react-core";
import { ReviewProps } from "./types";
import { unpackParametersIntoString } from "./lib/utils";
import { PluginDetails } from "./helperComponents/ReviewGrid";

const Review: React.FunctionComponent<ReviewProps> = (props: ReviewProps) => {
  const {
    data,
    dropdownInput,
    requiredInput,
    computeEnvironment,
    errors,
  } = props;

  let generatedCommand = "";
  let command = "";

  if (errors) {
    for (let error in errors) {
      command = `${error}: ${errors[error]}`;
    }
  }

  if (requiredInput) {
    generatedCommand += unpackParametersIntoString(requiredInput);
  }

  if (dropdownInput) {
    generatedCommand += unpackParametersIntoString(dropdownInput);
  }

  return (
    <div className="review">
      <h1 className="pf-c-title pf-m-2xl">Review</h1>
      <p>Review the information below and click 'Add' to add a node</p>
      <br />
      <br />

      <Grid hasGutter={true}>
        <GridItem span={2}>
          <span className="review__title">Parent Node:</span>
        </GridItem>
        <GridItem span={10}>
          <span className="review__value">
            {data.parent && data.parent.data.plugin_name}
          </span>
        </GridItem>
        <PluginDetails
          generatedCommand={generatedCommand}
          selectedPlugin={data.plugin}
          computeEnvironment={computeEnvironment}
        />
        <GridItem span={2}>
          <span className="review__title">Gpu Toggle</span>
        </GridItem>
        {command.length > 0 && (
          <Alert variant="danger" isInline title={command} />
        )}
      </Grid>
    </div>
  );
};

export default Review;
