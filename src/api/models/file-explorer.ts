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
    _resetWorkingObjects();
    const pluginName = `${selected.plugin_name}_${selected.id}`;
    const root = `chris/feed_${selected.feed_id}/...`; // modules Name
    _worker.module = _previousItem = root;

    if (!!items && items.length) {
      items.forEach((item: IFeedFile) => {
        const fileArray = _convertFiletoArray(item, pluginName);
        _parseFileArray(fileArray);
        _previousItem = "root";
        _previousObj = _worker;
      });
    }
    return _worker;
  }
}

// Description: Go through array and add to _worker object
const _parseFileArray = (fileArray: string[]) => {
  fileArray.forEach((item: string, i: number) => {
    const isLeaf = i === fileArray.length - 1;
    !isLeaf ? _AddFolder(item) : _addFile(item);
  });
};

/// BUILDING THE TREE
let _worker: IUITreeNode = {
  module: "root",
  children: []
};
let _previousItem = "root";
let _previousObj = _worker;

// Add or find a folder in the tree
const _AddFolder = (item: string) => {
  const newFolder = Object.assign({}, _folderTemplate, { module: item }); // This is what we will add
  if (!!_previousObj && !!_previousObj.children) {
    const newArr = _previousObj.children.slice();
    const existinModule = _.find(newArr, { module: item });
    if (!!!existinModule) {
      newArr.push(newFolder);
      _previousObj.children = newArr;
    }
  }
  _findChildrenArr(item, _worker);
  _previousItem = item;
};
const _addFile = (item: string) => {
  const newFile = Object.assign({}, _fileTemplate, { module: item });
  _findChildrenArr(_previousItem, _worker);
  if (!!_previousObj && !!_previousObj.children) {
    const newArr = _previousObj.children.slice();
    newArr.push(newFile);
    _previousObj.children = newArr;
  }
};

// Description: Finds and returns an object with the module: "[item as name]"
const _findChildrenArr = (item: string, node: IUITreeNode) => {
  if (!!node.children) {
    const resultArr = _.find(node.children, (o: IUITreeNode) => {
      return o.module === item;
    });
    
    if (!!resultArr) {
      _previousObj = resultArr;
      return resultArr;
    } else if (!!node.children && node.children.length) {
      node.children.forEach((subobj: IUITreeNode) => {
        return _findChildrenArr(item, subobj);
      });
    }
  }
};
// Description: convert file name into an array showing the folder structure by index and filename as last string in array
const _convertFiletoArray = (item: IFeedFile, pluginName: string) => {
  const fileName = item.fname;
  // find the pluginName within the filename string then decompose the substring
  return fileName
    .substring(fileName.indexOf(pluginName), fileName.length)
    .split("/");
};

// Description: reset objects to build tree
const _resetWorkingObjects = () => {
  _worker = {
    module: "",
    children: [
    ]
  };
  _folderTemplate = {
    module: "",
    collapsed: true,
    children: []
  };
  _fileTemplate = {
    module: "",
    leaf: true
  };
  _previousItem = "root";
  _previousObj = _worker;
};

let _folderTemplate: IUITreeNode = {
  module: "",
  collapsed: true,
  children: []
};
let _fileTemplate: IUITreeNode = {
  module: "",
  leaf: true
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
