import { PluginInstance } from "@fnndsc/chrisapi";

export function getPluginInstanceGraph(instances: PluginInstance[]) {
  const depthMap = new Map();
  const linkCountMap = new Map();
  const g_nodes = [];
  const g_edges = [];
  let x = 0;
  let y = 0;

  for (const node of instances) {
    const id = node.data.id;
    const pid = node.data.previous_id ? node.data.previous_id : -1;

    if (depthMap.has(pid)) depthMap.set(id, depthMap.get(pid) + 1);
    else depthMap.set(id, 0);

    if (linkCountMap.has(pid)) linkCountMap.set(pid, linkCountMap.get(pid) + 1);
    else linkCountMap.set(pid, 1);
  }

  for (const node of instances) {
    const id = node.data.id;
    const pid = node.data.previous_id ? node.data.previous_id : -1;

    const nodeStartTime = Date.parse(node.data.start_date);
    const nodeEndTime = Date.parse(node.data.end_date);

    // get nodes from https://cube.chrisproject.org/api/v1/plugins/instances/9452/parameters/

    let title = node.data.plugin_name;
    if (!title || title.length === 0) title = "unset title";

    g_nodes.push({
      id: `${id}`,
      type: "default",
      position: { x: x, y: y },
      dragHandle: ".chris-plugin-instance-node-header",
      data: {
        title: title,
        options: [],
        files: [],
        status: node.data.status,
        id: id,
        time_start_ms: nodeStartTime,
        time_end_ms: nodeEndTime - nodeStartTime,
        thumb_url: "./uv.png",
        depth: depthMap.get(id),
        parent_link_count: linkCountMap.get(pid),
        link_count: linkCountMap.get(id),
      },
    });

    x += 300;
    y += 100;

    if (pid !== undefined) {
      g_edges.push({
        id: `e${pid}-${id}`,
        source: `${pid}`,
        target: `${id}`,
      });
    }
  }
  return { g_nodes, g_edges };
}
