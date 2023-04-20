import React from "react";
import { InputType, NodeState } from "./ParentContainer";
import { Grid, GridItem } from "@patternfly/react-core";
import { useTypedSelector } from "../../../store/hooks";
import { getJoinInput } from "./utils";

const Review = ({ nodeState }: { nodeState: NodeState }) => {
  const tsNodes = useTypedSelector((state) => state.tsPlugins.tsNodes);
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const { joinInput, splitInput, selectedConfig } = nodeState;
  let generatedString = "";

  const getInput = (input: InputType) => {
    let string = "";
    for (const parameter in input) {
      string += `  --${parameter} ${input[parameter]}`;
    }
    return string;
  };

  if (selectedConfig === "join-node") {
    const input = getJoinInput(joinInput, tsNodes);
    generatedString = getInput(input);
  } else if (selectedConfig === "split-node") {
    generatedString = getInput(splitInput);
  }

  return (
    <div className="list-container">
      <Grid hasGutter={true}>
        <GridItem span={2}>
          <span className="title">Operation Mode:</span>
        </GridItem>

        <GridItem span={10}>
          <span className="computedValue">
            {selectedConfig === "join-node" ? "Join Node" : "Split Node"}
          </span>
        </GridItem>
        <GridItem span={2}>
          <span className="title">ParentNode:</span>
        </GridItem>

        <GridItem span={10}>
          <span className="computedValue">
            {selectedPlugin?.data.title || selectedPlugin?.data.plugin_name}
          </span>
        </GridItem>
        <GridItem span={2}>
          <span className="title">Plugin Configuration</span>
        </GridItem>

        <GridItem span={10}>
          <span className="computedValue">{generatedString}</span>
        </GridItem>
      </Grid>
    </div>
  );
};

export default Review;
