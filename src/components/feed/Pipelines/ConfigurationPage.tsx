import React, { useContext } from "react";
import { List, Avatar, Checkbox } from "antd";
import { CreateFeedContext } from "../CreateFeed/context";
const colorPalette: {
  [key: string]: string;
} = {
  default: "#5998C5",
  host: "#002952",
  moc: "#704478",
  titan: "#1B9D92",
  galena: "#ADF17F",
};
const ConfigurationPage = (props: { currentPipelineId: number }) => {
  const { currentPipelineId } = props;
  const { state } = useContext(CreateFeedContext);

  const { currentNode, computeEnvs } = state.pipelineData[currentPipelineId];
  const computeEnvList =
    computeEnvs && currentNode && computeEnvs[currentNode]
      ? computeEnvs[currentNode].computeEnvs
      : [];

  return (
    <>
      <div>
        <h4>Configuring compute environment for {currentNode} </h4>

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
    </>
  );
};

export default ConfigurationPage;
