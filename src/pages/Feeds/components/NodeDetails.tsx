import React from "react";
import { IPluginItem } from "../../../store/feed/types";

interface INodeProps {
    selected: IPluginItem;
}

class NodeDetails extends React.Component<INodeProps> {
  render() {
    const { selected } = this.props;
    return (
        <div>Selected Node:  {selected.plugin_name}</div>
    );
  }
}

export default NodeDetails;
