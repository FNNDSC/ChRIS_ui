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
    for (const error in errors) {
      command = `${error}: ${errors[error]}`;
    }
  }

  if (requiredInput) {
    generatedCommand += unpackParametersIntoString(requiredInput);
  }

  if (dropdownInput) {
    generatedCommand += unpackParametersIntoString(dropdownInput);
  }

  const title =
    data.parent && (data.parent.data.title || data.parent.data.plugin_name);

  return (
    <div className="review">
      <h1 className="pf-c-title pf-m-2xl">Review</h1>
      <p>
        Review the information below and click &apos;Add&apos; to add a node
      </p>
      <br />
      <br />

      <Grid hasGutter={true}>
        <GridItem span={2}>
          <span className="review__title">Parent Node:</span>
        </GridItem>
        <GridItem span={10}>
          <span className="review__value">
            {`${title} v.${data.parent?.data.plugin_version}`}
          </span>
        </GridItem>
        <PluginDetails
          generatedCommand={generatedCommand}
          selectedPlugin={data.plugin}
          computeEnvironment={computeEnvironment}
        />
        {command.length > 0 && (
          <Alert variant="danger" isInline title={command} />
        )}
      </Grid>
    </div>
  );
};

export default Review;
