import React from "react";
import { useTypedSelector } from "../../../store/hooks";
import { getPluginInstanceGraph } from "./utils";
import Tree from 'react-d3-tree';

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

const myTreeData: TreeNode[] = [
  {
    name: 'Element 1',
    children: [
      {
        name: 'Element 2',
        children: [
          {
            name: 'Element 3',
            children: [
              {
                name: 'Element 4',
              },
            ],
          },
        ],
      },
    ],
  },
];

const ReactFlowContainer: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Tree 
        data={myTreeData} 
        separation={{ 
          siblings: 1, 
          nonSiblings: 2 
        }}
        transitionDuration={0}
      />
    </div>
  );
};

export default ReactFlowContainer;