import React, { useContext } from "react";
import { Types } from "../CreateFeed/types";
import { List, Avatar, Checkbox } from "antd";
import { TextInput } from "@patternfly/react-core";
import { CreateFeedContext } from "../CreateFeed/context";
const colorPalette: {
  [key: string]: string;
} = {
  default: "#2B9AF3 ",
  host: "#002952",
  moc: "#704478",
  titan: "#1B9D92",
  galena: "#ADF17F",
};
const ConfigurationPage = (props: { currentPipelineId: number }) => {
  const { currentPipelineId } = props;
  const { state, dispatch } = useContext(CreateFeedContext);
  const { currentNode, computeEnvs, title } =
    state.pipelineData[currentPipelineId];
  const computeEnvList =
    computeEnvs && currentNode && computeEnvs[currentNode]
      ? computeEnvs[currentNode].computeEnvs
      : [];

  return (
    <>
      <div>
        <h4>Configuring compute environment for node id: {currentNode} </h4>
        <List
          itemLayout="horizontal"
          dataSource={computeEnvList ? computeEnvList : []}
          renderItem={(item: { name: string; description: string }) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <>
                    <Checkbox
                      style={{
                        marginRight: "0.5em",
                      }}
                      checked={
                        currentNode &&
                        computeEnvs &&
                        computeEnvs[currentNode] &&
                        computeEnvs[currentNode].currentlySelected === item.name
                          ? true
                          : false
                      }
                      onClick={() => {
                        dispatch({
                          type: Types.SetCurrentComputeEnvironment,
                          payload: {
                            computeEnv: {
                              item,
                              currentNode,
                              currentPipelineId,
                              computeEnvList,
                            },
                          },
                        });
                      }}
                    />

                    <Avatar
                      style={{
                        background: `${
                          colorPalette[item.name]
                            ? colorPalette[item.name]
                            : colorPalette["default"]
                        }`,
                      }}
                    />
                  </>
                }
                title={item.name}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </div>
      <div>
        <h4>Configuring Title for node id: {currentNode}</h4>
        <TextInput
          arial-label="Change the plugin instance title in a node"
          value={title && currentNode && title[currentNode]}
          onChange={(value) => {
            dispatch({
              type: Types.SetCurrentNodeTitle,
              payload: {
                currentPipelineId,
                currentNode,
                title: value,
              },
            });
          }}
        />
      </div>
    </>
  );
};

export default ConfigurationPage;
