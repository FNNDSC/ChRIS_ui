import React from "react";
import { Steps, Spin } from "antd";
import usePluginInstanceResource from "./usePluginInstanceResource";

const Status = () => {
  const pluginInstanceResource = usePluginInstanceResource();
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginStatus;

  if (pluginStatus && pluginStatus.length > 0) {
    const items = pluginStatus.map((label: any, index: number) => {
      return {
        key: index,
        icon: label.process && <Spin />,
        status:
          label.wait === true
            ? "wait"
            : label.error === true
            ? "error"
            : label.finish === true
            ? "finish"
            : "process",
      };
    });

    const descriptionItems = pluginStatus.map((label: any, index: number) => {
      return {
        key: index,
        description: label.description,
        status:
          label.status === true
            ? "finish"
            : label.error === true
            ? "error"
            : undefined,
      };
    });

    return (
      <>
        <Steps
          className="node-details__status"
          direction="horizontal"
          size="small"
          items={items}
        />

        <Steps
          direction="horizontal"
          size="small"
          className="node-details__status-descriptions"
          items={descriptionItems}
        />
      </>
    );
  } else return null;
};

export default React.memo(Status);
