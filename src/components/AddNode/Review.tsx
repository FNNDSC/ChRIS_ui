import React, { useEffect } from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import { Plugin } from "@fnndsc/chrisapi";
interface ReviewProps {
  data: {
    plugin?: Plugin;
    parent?: IPluginItem;
  };
  userInput: {
    [key: number]: {
      [key: string]: string;
    };
  };
  editorState: {
    [key: string]: string;
  };
}

const Review: React.FunctionComponent<ReviewProps> = (props: ReviewProps) => {
  const { data, userInput, editorState } = props;

  let generatedCommand = "";

  if (userInput) {
    for (let object in userInput) {
      const flag = Object.keys(userInput[object])[0];
      const value = userInput[object][flag];
      generatedCommand += ` --${flag} ${value} `;
    }
  }

  if (editorState) {
    for (let i in editorState) {
      generatedCommand += ` --${i} ${editorState[i]} `;
    }
  }

  return (
    <div className="review">
      <h1 className="pf-c-title pf-m-2xl">Review</h1>
      <p>Review the information below and click 'Add' to add a node</p>
      <br />
      <br />

      <Grid gutter="sm">
        <GridItem span={2}>Parent Node:</GridItem>
        <GridItem span={10}>{data.parent && data.parent.plugin_name}</GridItem>
        <GridItem span={2}>Type of node:</GridItem>
        <GridItem span={10}>Plugin</GridItem>
        <GridItem span={2}>Selected plugin:</GridItem>
        <GridItem span={10}>{data.plugin && data.plugin.data.name}</GridItem>
        <GridItem span={2}>Plugin configuration:</GridItem>
        <GridItem span={10}>
          <span className="required-text">{generatedCommand}</span>
        </GridItem>
      </Grid>
    </div>
  );
};

export default Review;
