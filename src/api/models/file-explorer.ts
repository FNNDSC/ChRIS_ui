import { IPluginItem } from "./pluginInstance.model";
import { IFeedFile } from "./feed-file.model";
import _ from "lodash";

// Description: Builds the file explorer tree
export interface IUITreeNode {
  module: string;
  children?: IUITreeNode[];
  collapsed?: boolean;
  leaf?: boolean;
}

export default class UITreeNodeModel {
  // Description: Parse Plugin file array into IUITreeNode object
  static parseUiTree(items: IFeedFile[], selected: IPluginItem) {
    // const feedName = `feed_${selected.feed_id}`;
    const pluginName = `${selected.plugin_name}_${selected.id}`;
    const root = `chris/feed_${selected.feed_id}/...`; // modules Name
    // tslint:disable-next-line:prefer-const
    let worker = {
      module: root,
      children: []
    };

    ///// ***************************************************************** Working
    if (!!items && items.length) {
      // let currentModule = worker.module;
      //   console.log("parseUiTree  *****", items, selected, root);
      items.forEach((item: IFeedFile) => {
        const fileName = item.fname;
        // find the pluginName within the filename string then decompose the substring
        const subFileName = fileName.substring(
          fileName.indexOf(pluginName),
          fileName.length
        );
        const fileArray = subFileName.split("/");
        fileArray.forEach((item: string, i: number) => {
          const isLeaf = i === fileArray.length - 1;
          if (isLeaf) {
            const leaf = { module: item, isLeaf };
            (worker.children as any).push(leaf);
          } else {
            // this is a folder
            const folder = {
              module: item,
              collapsed: true,
              children: []
            };
            (worker.children as any).push(folder);
          }
        });
        // worker = _.mergeWith(worker, newFileObj, customizer);
      });

     // console.log(" ***** worker ***** : ", worker);
      // Description: add file to worker
    }
    return tree;
  }
}


// function customizer(objValue: any, srcValue: any) {
//   if (_.isArray(objValue)) {
//     return  _.merge(objValue, srcValue);
//   }
// }

// Add a file to object
const _addFile = (fileArray: string[]) => {
  let obj = {
    module: undefined,
    children: []
  };
  let currentChildren = obj.children;
  fileArray.forEach((item: string, i: number) => {
    const isLeaf = i === fileArray.length - 1;
    if (isLeaf) {
      const leaf = { module: item, isLeaf };
      (currentChildren as any).push(leaf);
    } else {
      // this is a folder
      const folder = {
        module: item,
        collapsed: true,
        children: []
      };
      if (obj.module !== undefined) {
        // console.log("obj.module is not undefined");
        (currentChildren as any).push(folder);
      } else {
        obj = Object.assign(obj, folder);
        // console.log("obj.module is Undefined", obj);
      }
      currentChildren = folder.children;
    }
  });

  return obj;
};

// TEMP WILL REMOVE AFTER PARSING FILES ARRAY for setExplorerSuccess ***** working
const tree: IUITreeNode = {
  module: "chris",
  children: [
    {
      module: "feed_7",
      collapsed: true,
      children: [
        {
          module: "dircopy_21",
          collapsed: true,
          children: [
            {
              module: "data",
              collapsed: true,
              children: [
                {
                  module:
                    "0001-1.3.12.2.1107.5.2.19.45152.2013030808110258929186035.dcm",
                  leaf: true
                },
                {
                  module:
                    "0002-1.3.12.2.1107.5.2.19.45152.2013030808110261698786039.dcm",
                  leaf: true
                },
                {
                  module:
                    "0003-1.3.12.2.1107.5.2.19.45152.2013030808110259940386037.dcm",
                  leaf: true
                },
                {
                  module:
                    "0004-1.3.12.2.1107.5.2.19.45152.2013030808110256555586033.dcm",
                  leaf: true
                },
                {
                  module:
                    "0005-1.3.12.2.1107.5.2.19.45152.2013030808110251492986029.dcm",
                  leaf: true
                },
                {
                  module:
                    "0006-1.3.12.2.1107.5.2.19.45152.2013030808110255864486031.dcm",
                  leaf: true
                },
                {
                  module:
                    "0007-1.3.12.2.1107.5.2.19.45152.2013030808110245643686025.dcm",
                  leaf: true
                },
                {
                  module:
                    "0008-1.3.12.2.1107.5.2.19.45152.2013030808110250837286027.dcm",
                  leaf: true
                },
                {
                  module:
                    "0009-1.3.12.2.1107.5.2.19.45152.2013030808110245009586023.dcm",
                  leaf: true
                },
                {
                  module:
                    "0010-1.3.12.2.1107.5.2.19.45152.2013030808110244209386021.dcm",
                  leaf: true
                }
              ]
            },
            {
              module: "freesurfer_pp_22",
              collapsed: true,
              children: [
                {
                  module: "data",
                  collapsed: true,
                  children: [
                    {
                      module: "input.meta.json",
                      leaf: true
                    },
                    {
                      module: "jobStatus.json",
                      leaf: true
                    },
                    {
                      module: "jobStatusSummary.json",
                      leaf: true
                    },
                    {
                      module: "output.meta.json",
                      leaf: true
                    },
                    {
                      module: "stats",
                      collapsed: true,
                      children: [
                        {
                          module: "aseg.stats",
                          leaf: true
                        },
                        {
                          module: "lh.aparc.a2009s.stats",
                          leaf: true
                        },
                        {
                          module: "lh.aparc.DKTatlas40",
                          leaf: true
                        },
                        {
                          module: "lh.aparc.stats",
                          leaf: true
                        },
                        {
                          module: "lh.BA.stats",
                          leaf: true
                        },
                        {
                          module: "lh.BA.thresh.stats",
                          leaf: true
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// {
//   module: "Output Dir",
//   children: [
//     {
//       module: "Documents",
//       collapsed: true,
//       children: [
//         {
//           module: "node.js",
//           leaf: true
//         },
//         {
//           module: "react-ui-tree.css",
//           leaf: true
//         },
//         {
//           module: "react-ui-tree.js",
//           leaf: true
//         },
//         {
//           module: "tree.js",
//           leaf: true
//         }
//       ]
//     },
//     {
//       module: "Images",
//       children: [
//         {
//           module: "app.js",
//           leaf: true
//         },
//         {
//           module: "app.less",
//           leaf: true
//         },
//         {
//           module: "index.html",
//           leaf: true
//         },
//         {
//           module: "inner folder",
//           collapsed: true,
//           children: [
//             {
//               module: "child1.txt",
//               leaf: true
//             },
//             {
//               module: "child2.txt",
//               leaf: true
//             },
//             {
//               module: "child3.txt",
//               leaf: true
//             },
//             {
//               module: "child4.txt",
//               leaf: true
//             },
//             {
//               module: "child5.txt",
//               leaf: true
//             },
//             {
//               module: "inner folder 2",
//               collapsed: true,
//               children: [
//                 {
//                   module: "child1.txt",
//                   leaf: true
//                 },
//                 {
//                   module: "child2.txt",
//                   leaf: true
//                 },
//                 {
//                   module: "child3.txt",
//                   leaf: true
//                 },
//                 {
//                   module: "child4.txt",
//                   leaf: true
//                 },
//                 {
//                   module: "child5.txt",
//                   leaf: true
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     },
//     {
//       module: "Videos",
//       children: [
//         {
//           module: "node.js",
//           leaf: true
//         },
//         {
//           module: "react-ui-tree.js",
//           leaf: true
//         },
//         {
//           module: "react-ui-tree.less",
//           leaf: true
//         },
//         {
//           module: "tree.js",
//           leaf: true
//         }
//       ]
//     },
//     {
//       module: "Others"
//     }
//   ]
// };
