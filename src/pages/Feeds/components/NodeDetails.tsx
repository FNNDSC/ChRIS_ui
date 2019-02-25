import React from "react";

interface INodeProps {
    selected: any;
}

class NodeDetails extends React.Component<INodeProps> {
  render() {
    const { selected } = this.props;
    return (
        <div>Node Details:  {selected.id}</div>
    );
  }
}

export default NodeDetails;
