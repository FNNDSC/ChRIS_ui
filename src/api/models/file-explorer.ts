// Description: Builds the file explorer tree
export interface IUITreeNode {
    module: string;
    children?: IUITreeNode[];
    collapsed?: boolean;
    leaf?: boolean;
}
