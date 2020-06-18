import React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { ReviewProps } from "./types";
import { unpackParametersIntoString } from "./lib/utils";

const Review: React.FunctionComponent<ReviewProps> = (props: ReviewProps) => {
  const { data, dropdownInput, requiredInput, runtimeChecked } = props;

  let generatedCommand = "";
  if (requiredInput) {
    generatedCommand += unpackParametersIntoString(requiredInput);
  }

  if (dropdownInput) {
    generatedCommand += unpackParametersIntoString(dropdownInput);
  }

  if (runtimeChecked === true) {
    generatedCommand += ` --runtime nvidia`;
  }

  return (
    <div className="review">
      <h1 className="pf-c-title pf-m-2xl">Review</h1>
      <p>Review the information below and click 'Add' to add a node</p>
      <br />
      <br />

      <Grid gutter="sm">
        <GridItem span={2}>Parent Node:</GridItem>
        <GridItem span={10}>{data.parent && data.parent.data.plugin_name}</GridItem>
        <GridItem span={2}>Type of node:</GridItem>
        <GridItem span={10}>Plugin</GridItem>
        <GridItem span={2}>Selected plugin:</GridItem>
        <GridItem span={10}>{data.plugin && data.plugin.data.name}</GridItem>
        <GridItem span={2}>Plugin configuration:</GridItem>
        <GridItem span={10}>
          <span className="required-text">{generatedCommand}</span>
        </GridItem>
        <GridItem span={2}>Local GPU processing:</GridItem>
        <GridItem span={10}>
          {runtimeChecked === true ? "Enabled" : "Disabled"}
        </GridItem>
      </Grid>
    </div>
  );
};

export default Review;
