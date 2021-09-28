export interface TreeNode {
  children: TreeType[];
  id: number;
  plugin_id: number;
  pipeline_id: number;
  previous_id: number | null;
}

export interface TreeType {
  id: number;
  plugin_id: number;
  pipeline_id: number;
  previous_id: number | null;
}
