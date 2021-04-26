import React from "react";
import { NodeState } from "./ParentContainer";
import { Grid, GridItem } from "@patternfly/react-core";
import { useTypedSelector } from "../../../store/hooks";
import { getInput } from "./utils";

const Review = ({ nodeState }: { nodeState: NodeState }) => {
  const tsNodes = useTypedSelector((state) => state.feed.tsNodes);
  const selectedPlugin = useTypedSelector((state) => state.feed.selectedPlugin);
  const { joinInput, selectedConfig } = nodeState;

  if (selectedConfig === "join-node") {
    let string = "";
    const input = getInput(joinInput, tsNodes, selectedPlugin);

    for (const parameter in input) {
      string += `  ${parameter} ${input[parameter]}`;
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
            <span className="computedValue">{string}</span>
          </GridItem>
        </Grid>
      </div>
    );
  } else return <div className="list-container">Split Code</div>;
};

export default Review;
