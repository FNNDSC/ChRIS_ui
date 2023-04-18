import React from "react";
import ReactFlow, {
  Controls,
  ControlButton,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import { useTypedSelector } from "../../../store/hooks";
import { getPluginInstanceGraph } from "./utils";

const ReactFlowContainer = () => {
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances
  );
  const { data: instances } = pluginInstances;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  React.useEffect(() => {
    if (instances) {
      const { g_nodes, g_edges } = getPluginInstanceGraph(instances);
      setNodes(g_nodes);
      setEdges(g_edges);
    }
  }, [instances, setEdges, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    >
      <CustomControls />
      <Background color="#333" variant="dots" />
    </ReactFlow>
  );
};

export default ReactFlowContainer;

function CustomControls() {
  return (
    <Controls position="top-left">
      <ControlButton
        onClick={() => console.log("another action")}
        title="action"
      >
        <div>S</div>
      </ControlButton>
      <ControlButton
        onClick={() => console.log("another action")}
        title="another action"
      >
        <div>ID</div>
      </ControlButton>
      <ControlButton
        onClick={() => console.log("another action")}
        title="another action"
        area
        shape="rect"
        coords="0,0,82,126"
        href="sun.htm"
        alt="Sun"
      >
        <div>Map</div>
      </ControlButton>
      <script></script>
    </Controls>
  );
}
