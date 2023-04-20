import React from "react";
import { List, Avatar, Checkbox } from "antd";
import { stringToColour } from "../CreateFeed/utils/pipelines";

const ListCompute = ({
  computeList,
  generalCompute,
  dispatchFn,
}: {
  computeList: any[];
  generalCompute?: string;
  dispatchFn: (item: any) => void;
}) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={computeList && computeList.length > 0 ? computeList : []}
      renderItem={(item: any) => {
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
                      generalCompute && generalCompute === item.name
                        ? true
                        : false
                    }
                    onClick={() => {
                      dispatchFn(item);
                    }}
                  />

                  <Avatar
                    style={{
                      background: `${stringToColour(item.name)}`,
                    }}
                  />
                </>
              }
              title={item.name}
              description={item.description}
            />
          </List.Item>
        );
      }}
    />
  );
};

export default ListCompute;
