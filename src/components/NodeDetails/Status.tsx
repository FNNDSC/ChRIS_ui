import { Steps, Spin } from "../Antd";
import usePluginInstanceResource from "./usePluginInstanceResource";

const Status = () => {
  const pluginInstanceResource = usePluginInstanceResource();

  const pluginStatus = pluginInstanceResource?.pluginStatus;

  if (pluginStatus && pluginStatus.length > 0) {
    const items = pluginStatus.map((label: any, index: number) => {
      return {
        key: index,
        description: label.description,
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

    return (
      <Steps
        className="node-details__status"
        labelPlacement="vertical"
        items={items}
      />
    );
  }

  return null;
};

export default Status;
