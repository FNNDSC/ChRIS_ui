import { ComputeResource } from "@fnndsc/chrisapi";
import { Avatar, Checkbox, List } from "antd";

import { stringToColour } from "../CreateFeed/utils";

type OwnProps = {
  computeResources: ComputeResource[];
  currentlyActive?: string;
  showCheckbox?: boolean;
  handleComputeChange?: (compute: string) => void;
};

function ListCompute(props: OwnProps) {
  const {
    computeResources,
    currentlyActive,
    showCheckbox,
    handleComputeChange,
  } = props;
  return (
    <>
      <List
        style={{
          marginLeft: showCheckbox ? "1rem" : "",
        }}
        itemLayout="horizontal"
        dataSource={computeResources}
        renderItem={(item: ComputeResource, index: number) => {
          return (
            <List.Item
              style={{ paddingTop: showCheckbox && index === 0 ? 0 : "" }}
            >
              <List.Item.Meta
                avatar={
                  <>
                    {showCheckbox && (
                      <Checkbox
                        style={{
                          marginRight: "0.5em",
                        }}
                        onClick={() => {
                          handleComputeChange?.(item.data.name);
                        }}
                        checked={currentlyActive === item.data.name}
                      />
                    )}

                    <Avatar
                      style={{
                        background: `${stringToColour(item.data.name)}`,
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
    </>
  );
}

export default ListCompute;
