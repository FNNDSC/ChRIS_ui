import { PluginInstance } from "@fnndsc/chrisapi";
import NodeData, { NodeFileRef, NodeTree } from "./NodeData";

// Return a list of plugin information in the format that d3-tree wants
//
//	{ id: 0, data: {...}, children: {...} }
//
export async function getPluginInstanceGraph(instances: PluginInstance[]) {
  // Put each instance into a map

  const nodeMap = new Map<number, NodeData[]>();

  for (const node of instances) {
    const id = node.data.id;
    const pid = node.data.previous_id ? node.data.previous_id : -1;

    const nodeStartTime = Date.parse(node.data.start_date);
    const nodeEndTime = Date.parse(node.data.end_date);

    let title = node.data.plugin_name;
    if (!title || title.length === 0) title = "unset title";

    const filesData = (await node.getFiles()).data;
    const files = new Array<NodeFileRef>();

    for (const file of filesData) {
      const f: NodeFileRef = new NodeFileRef();
      f.fullname = file.fname;
      f.name = file.fname.substr(file.fname.lastIndexOf("/") + 1); // todo: check if there is any '/'

      files.push(f);
    }

    const data: NodeData = {
      title: title,
      files: files,
      status: node.data.status,
      id: id,
      pid: pid,
      time_start_ms: nodeStartTime,
      time_end_ms: nodeEndTime - nodeStartTime,
      thumb_url: "./uv.png",
    };

    if (nodeMap.has(pid)) nodeMap.get(pid)?.push(data);
    else nodeMap.set(pid, [data]);
  }

  // convert the map into a json tree

  function recurseTree(node: NodeData): NodeTree {
    const out = new NodeTree();
    out.data = node;
    out.children = [];

    if (!nodeMap.has(node.id)) return out;

    const children = nodeMap.get(node.id); // get nodes with this as parent
    const nodes = [];

    if (children && children.length > 0) {
      for (const c of children) {
        const r = recurseTree(c);
        nodes.push(r);
      }
    }

    out.children = nodes;

    return out;
  }

  const rootNodeArray = nodeMap.get(-1);
  if (rootNodeArray !== undefined && rootNodeArray.length > 0) {
    const nodeRoot = rootNodeArray[0];
    const nodeTree: NodeTree = recurseTree(nodeRoot);
    return nodeTree;
  } else return undefined;
}
