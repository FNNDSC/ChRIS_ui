export interface TreeNode {
  children: TreeNode[];
  id: number;
  name: string;
  parentId: number | null;
}

export interface TreeType {
  id: number;
  name: string;
  previous_id: number | null;
}
