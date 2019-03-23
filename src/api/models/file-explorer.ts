import { IPluginItem } from "./pluginInstance.model";
import { IFeedFile } from "./feed-file.model";
import _ from "lodash";

// Description: Builds the file explorer tree
export interface IUITreeNode {
  module: string;
  children?: IUITreeNode[];
  collapsed?: boolean;
  leaf?: boolean;
  file?: any;
}

// Description: get file type by file extention
export function getFileExtension(item: IUITreeNode) {
  const isfile = !!item.leaf && item.leaf;
  return item.module.substring(item.module.lastIndexOf(".") + 1);
}


// Description: takes an array of files and build the file explorer tree
export default class UITreeNodeModel {
  private _items: IFeedFile[];
  private _worker: IUITreeNode = {
    module: "root",
    children: []
  };
  private _previousItem = "root";
  private _previousObj = this._worker;
  private _folderTemplate: IUITreeNode = {
    module: "",
    collapsed: false,
    leaf: false,
    children: []
  };
  private _fileTemplate: IUITreeNode = {
    module: "",
    leaf: true,
    file: {}
  };
  tree: IUITreeNode = this._worker;

  constructor(items: IFeedFile[], selected: IPluginItem) {
    this._items = items;
    this.parseUiTree(items, selected);
  }
  getTree = () => {
    return this.tree;
  }

  // Description: Parse Plugin file array into IUITreeNode object - build the tree
  parseUiTree(items: IFeedFile[], selected: IPluginItem) {
    const pluginName = `${selected.plugin_name}_${selected.id}`;
    const root = `chris/feed_${selected.feed_id}/...`; // modules Name
    this._worker.module = this._previousItem = root;

    if (!!items && items.length) {
      items.forEach((item: IFeedFile) => {
        const fileArray = this._convertFiletoArray(item, pluginName);
        this._parseFileArray(fileArray);
        this._resetholders();
      });
    }
    this.tree = this._worker;
  }

  // Description: Go through array and add to _worker object
  private _parseFileArray = (fileArray: string[]) => {
    fileArray.forEach((item: string, i: number) => {
      const isLeaf = i === fileArray.length - 1;
      !isLeaf ? this._AddFolder(item) : this._addFile(item);
    });
  }

  // Description: Add or find a folder in the tree
  private _AddFolder = (item: string) => {
    const newFolder = Object.assign({}, this._folderTemplate, { module: item }); // This is what we will add
    if (!!this._previousObj && !!this._previousObj.children) {
      const newArr = this._previousObj.children.slice();
      const existinModule = _.find(newArr, { module: item });
      if (!!!existinModule) {
        newArr.push(newFolder);
        this._previousObj.children = newArr;
      }
    }
    this._findChildrenArr(item, this._worker);
    this._previousItem = item;
  }

  // Description: Add a File
  private _addFile = (item: string) => {
    const newFile = Object.assign({}, this._fileTemplate, { module: item, file: this._fetchItem(item) });
    this._findChildrenArr(this._previousItem, this._worker);
    if (!!this._previousObj && !!this._previousObj.children) {
      const newArr = this._previousObj.children.slice();
      newArr.push(newFile);
      this._previousObj.children = newArr;
    }
  }

  // Description: Fetch the item from array
  private _fetchItem = (item: string) => {
    return _.find(this._items, (o: IFeedFile) => {
      return (o.fname.indexOf(`/${item}`) > 0);
    });
  }
  // Description: Finds and returns an object with the module: "[item as name]"
  private _findChildrenArr = (item: string, node: IUITreeNode) => {
    if (!!node.children) {
      const resultArr = _.find(node.children, (o: IUITreeNode) => {
        return o.module === item;
      });

      if (!!resultArr) {
        this._previousObj = resultArr;
        return resultArr;
      } else if (!!node.children && node.children.length) {
        node.children.forEach((subobj: IUITreeNode) => {
          return this._findChildrenArr(item, subobj);
        });
      }
    }
  }

  // Description: covert file string to an array
  private _convertFiletoArray = (item: IFeedFile, pluginName: string) => {
    const fileName = item.fname;
    // find the pluginName within the filename string then decompose the substring
    return fileName
      .substring(fileName.indexOf(pluginName), fileName.length)
      .split("/");
  }

  // Description: reset placeholder props
  private _resetholders = () => {
    this._previousItem = "root";
    this._previousObj = this._worker;
  }
}
