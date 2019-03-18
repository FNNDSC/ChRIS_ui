import { IPluginItem } from "./pluginInstance.model";
// Description: Builds the file explorer tree
export interface IUITreeNode {
  module: string;
  children?: IUITreeNode[];
  collapsed?: boolean;
  leaf?: boolean;
}

export default class UITreeNodeModel {
  // Description: Parse Plugin file array into IUITreeNode object
  static parseUiTree(items: IPluginItem[]) {
    console.log("parseUiTree  ***** Need to parse tree here", items, tree);

    return tree;
  }
}

// TEMP WILL REMOVE AFTER PARSING FILES ARRAY for setExplorerSuccess ***** working
const tree: IUITreeNode = {
  module: "Output Dir",
  children: [
    {
      module: "Documents",
      collapsed: true,
      children: [
        {
          module: "node.js",
          leaf: true
        },
        {
          module: "react-ui-tree.css",
          leaf: true
        },
        {
          module: "react-ui-tree.js",
          leaf: true
        },
        {
          module: "tree.js",
          leaf: true
        }
      ]
    },
    {
      module: "Images",
      children: [
        {
          module: "app.js",
          leaf: true
        },
        {
          module: "app.less",
          leaf: true
        },
        {
          module: "index.html",
          leaf: true
        },
        {
          module: "inner folder",
          collapsed: true,
          children: [
            {
              module: "child1.txt",
              leaf: true
            },
            {
              module: "child2.txt",
              leaf: true
            },
            {
              module: "child3.txt",
              leaf: true
            },
            {
              module: "child4.txt",
              leaf: true
            },
            {
              module: "child5.txt",
              leaf: true
            },
            {
              module: "inner folder 2",
              collapsed: true,
              children: [
                {
                  module: "child1.txt",
                  leaf: true
                },
                {
                  module: "child2.txt",
                  leaf: true
                },
                {
                  module: "child3.txt",
                  leaf: true
                },
                {
                  module: "child4.txt",
                  leaf: true
                },
                {
                  module: "child5.txt",
                  leaf: true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      module: "Videos",
      children: [
        {
          module: "node.js",
          leaf: true
        },
        {
          module: "react-ui-tree.js",
          leaf: true
        },
        {
          module: "react-ui-tree.less",
          leaf: true
        },
        {
          module: "tree.js",
          leaf: true
        }
      ]
    },
    {
      module: "Others"
    }
  ]
};
