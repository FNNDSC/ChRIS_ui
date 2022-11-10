import React, { useContext } from "react";
import { List, Checkbox, Avatar } from "antd";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { PipelineContext } from "../CreateFeed/context";
import { PipelineTypes } from "../CreateFeed/types/pipeline";
import { hasCode, intToRGB } from "../CreateFeed/utils/pipelines";

const GeneralCompute = ({
  currentPipelineId,
}: {
  currentPipelineId: number;
  handleSetGeneralCompute: (
    currentPipelineId: number,
    computeEnv: string
  ) => void;
}) => {
  const { state, dispatch } = useContext(PipelineContext);
  const [computes, setComputes] = React.useState<any[]>([]);

  const generalCompute =
    state.pipelineData[currentPipelineId].generalCompute;

  React.useEffect(() => {
    async function fetchCompute() {
      const client = ChrisAPIClient.getClient();
      const computeResourceList = await client.getComputeResources({
        limit: 100,
        offset: 0,
      });
      const computes = computeResourceList.getItems();
      computes && setComputes(computes);
    }

    fetchCompute();
  }, []);

  return (
    <div
      style={{
        width: "25%",
        background: "black",
      }}
      className="general-compute"
    >
      <List
        itemLayout="horizontal"
        dataSource={computes ? computes : []}
        renderItem={(item) => {
          return (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <>
                    <Checkbox
                      style={{
                        marginRight: "0.5em",
                      }}
                      checked={
                        generalCompute && generalCompute === item.data.name
                          ? true
                          : false
                      }
                      onClick={() => {
                        dispatch({
                          type: PipelineTypes.SetGeneralCompute,
                          payload: {
                            currentPipelineId,
                            computeEnv: item.data.name,
                          },
                        });
                      }}
                    />

                    <Avatar
                      style={{
                        background: `#${intToRGB(hasCode(item.data.name))}`,
                      }}
                    />
                  </>
                }
                title={item.data.name}
                description={item.data.description}
              />
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default GeneralCompute;
