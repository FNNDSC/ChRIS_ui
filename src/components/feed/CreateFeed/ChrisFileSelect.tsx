import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { UploadedFile, PluginInstance } from "@fnndsc/chrisapi";
import { IFeedState } from "../../../store/feed/types";
import { uuid } from "uuidv4";

import {
  FolderCloseIcon,
  FolderOpenIcon,
  FileIcon,
  CloseIcon
} from "@patternfly/react-icons";
import { Checkbox, Split, SplitItem } from "@patternfly/react-core";

import Tree from "react-ui-tree";

import LoadingSpinner from "../../common/loading/LoadingSpinner";
import { ChrisFile } from "./CreateFeed";
import { DataTableToolbar } from "../..";
import { ApplicationState } from "../../../store/root/applicationState";

import _ from "lodash";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { getUploadedFiles } from "../../../store/feed/actions";
import { flattenMyTree, findWhere, filterArray } from "./utils/utils";

function getEmptyTree() {
  return {
    name: "ChRIS Files",
    path: "/",
    children: []
  };
}

interface Tree {
  id: number;
  name: string;
  parentId?: number;
  children?: Tree[];
}

interface ChrisFileSelectProps {
  files: ChrisFile[];
  handleFileAdd: (file: ChrisFile) => void;
  handleFileRemove: (file: ChrisFile) => void;
  getUploadedFiles: () => void;
}

type AllProps = IFeedState & ChrisFileSelectProps;

interface ChrisFileSelectState {
  filter: string;
  initialTreeLoaded: boolean;
  initialTree: ChrisFile;
  visibleTree: ChrisFile;
}

class ChrisFileSelect extends React.Component<AllProps, ChrisFileSelectState> {
  _isMounted = false;
  constructor(props: AllProps) {
    super(props);
    this.state = {
      filter: "",
      initialTreeLoaded: false,
      initialTree: getEmptyTree(),
      visibleTree: getEmptyTree()
    };

    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  /* Lifecycle methods */

  async componentDidMount() {
    this._isMounted = true;
    this.disableTreeDraggables();

    const { getUploadedFiles } = this.props;
    getUploadedFiles();

    /* Create tree after mounting */
    const feeds = _.flattenDepth(await this.fetchChrisFeeds());
    const files = await this.fetchChrisFiles();

    const treeFiles = [...files, ...feeds];
    this.buildTree(treeFiles);
  }

  async componentDidUpdate(prevProps: AllProps) {
    this._isMounted = true;
    if (!_.isEqual(prevProps.uploadedFiles, this.props.uploadedFiles)) {
      const feeds = _.flattenDepth(await this.fetchChrisFeeds());
      const files = await this.fetchChrisFiles();
      const treeFiles = [...files, ...feeds];
      this.buildTree(treeFiles);
    }
    this.disableTreeDraggables();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /* Fetching files for creating a Tree */

  async fetchChrisFiles() {
    const { uploadedFiles } = this.props;

    if (!uploadedFiles) {
      return [];
    }

    const testFiles = await Promise.all(
      uploadedFiles.map(file => {
        const fileData = (file as UploadedFile).data;

        const path = fileData.fname
          .split("/")
          .slice(0, -1)
          .join("/");

        return {
          path,
          id: uuid()
        };
      })
    );

    const filteredArray = filterArray(testFiles);
    return filteredArray;
  }

  fetchChrisFeeds() {
    const { feeds } = this.props;

    if (!feeds) {
      return;
    }

    return Promise.all(
      feeds.map(async feed => {
        const pluginInstances = await (
          await ChrisAPIClient.getClient().getFeed(feed.id as number)
        ).getPluginInstances();

        const pluginInstanceList = pluginInstances.getItems();

        let root: Tree = {
          id: feed.id as number,
          name: `${feed.creator_username}/feed_${feed.id}`,
          children: []
        };

        const test: Tree[] = this.createRecursiveTree(pluginInstanceList);
        root.children = test;

        const tree = [root];
        const flattenedTree = flattenMyTree(tree); // js utility

        const feedFiles = flattenedTree.map(tree => {
          return {
            path: tree.pathname
          };
        });

        return feedFiles;
      })
    );
  }

  createRecursiveTree(arr: PluginInstance[]) {
    let hashTable = Object.create(null);

    let pluginInstances = arr
      .map(pluginInstance => ({
        id: pluginInstance.data.id,
        parentId: pluginInstance.data.previous_id,
        name: `${pluginInstance.data.plugin_name}_${pluginInstance.data.id}`
      }))
      .sort((a, b) => a.id - b.id);

    pluginInstances.forEach(instance => {
      hashTable[instance.id] = { ...instance, children: [] };
    });

    let dataTree: Tree[] = [];

    pluginInstances.forEach(instance => {
      if (instance.parentId)
        hashTable[instance.parentId].children.push(hashTable[instance.id]);
      else dataTree.push(hashTable[instance.id]);
    });
    return dataTree;
  }

  buildTree(files: any) {
    const tree = this.buildInitialFileTree(files);
    if (this._isMounted) {
      this.setState({
        initialTreeLoaded: true,
        initialTree: tree,
        visibleTree: tree
      });
    }
  }

  // finds all nodes and disables the draggable function that comes with the react-ui-tree
  // from FileExplorer.tsx
  disableTreeDraggables() {
    const arr = Array.from(document.getElementsByClassName("m-node"));
    for (const el of arr) {
      el.addEventListener(
        "mousedown",
        (e: Event) => {
          e.stopPropagation();
        },
        { passive: false }
      );
    }
  }

  // Transforms list of ChrisFilePaths into a ChrisFile tree

  buildInitialFileTree(filePaths: any) {
    const paths = filePaths.map((filepath: any) => {
      const parts = filepath.path.split("/");
      return parts;
    });

    const tree = getEmptyTree();

    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      var currentLevel: { name: any; children: never[] }[] = tree.children;

      for (var j = 0; j < path.length; j++) {
        var part = path[j];

        var existingPath = findWhere(currentLevel, "name", part);
        if (existingPath) {
          currentLevel = existingPath.children;
        } else {
          let upload_path = "";
          if (!path.includes("uploads")) {
            upload_path = path.join("/") + "/data";
          } else {
            const index = path.indexOf(part);
            upload_path = path.slice(0, index + 1).join("/");
          }

          var newPart = {
            name: part,
            path: upload_path,
            children: [],
            id: uuid(),
            collapsed: true
          };
          currentLevel.push(newPart);
          currentLevel = newPart.children;
        }
      }
    }

    return this.sortTree(tree);
  }

  // Moves folders to top and orders alphabetically
  sortTree(root: any) {
    let children: ChrisFile[] = [];
    if (root.children) {
      children = root.children.sort((a: ChrisFile, b: ChrisFile) => {
        if (a.children && !b.children) {
          return -1;
        } else if (!a.children && b.children) {
          return 1;
        } else {
          // both folders or both files
          return a.name.localeCompare(b.name);
        }
      });

      for (const child of root.children) {
        if (child.children) {
          child.children = this.sortTree(child).children;
        }
      }
    }
    return { ...root, children };
  }

  /* EVENT HANDLERS */

  async handleCheckboxChange(isChecked: boolean, file: ChrisFile) {
    if (isChecked) {
      this.props.handleFileAdd(file);
    } else {
      this.props.handleFileRemove(file);
    }
  }

  /* SEARCH */

  handleFilterChange(value: string) {
    this.setState({ filter: value }, () => {
      if (value) {
        this.recomputeVisibleTree();
      } else {
        this.resetVisibleTree();
      }
    });
  }

  recomputeVisibleTree() {
    const { initialTree } = this.state;
    if (initialTree.children) {
      const visibleTopLevelChildren = this.computeVisibleChildren(
        initialTree.children
      );
      this.setState({
        visibleTree: {
          name: "ChRIS Files",
          path: "/",
          children: visibleTopLevelChildren
        }
      });
    }
  }

  // Computes which files/folders are visible, based on the filter
  computeVisibleChildren(children: ChrisFile[]): ChrisFile[] {
    const shownChildren = [];
    for (const child of children) {
      // if it's a folder with matching children, show the folder
      if (child.children) {
        const folderShownChildren = this.computeVisibleChildren(child.children); // get its shown children
        if (folderShownChildren.length) {
          // if it  has shown children
          const folder = {
            name: child.name,
            path: child.path,
            children: folderShownChildren
          };
          shownChildren.push(folder);
          continue; // do not re-evaluate folder once it's shown
        }
      }
      if (this.matchesFilter(child.name)) {
        // is file or folder and matches
        shownChildren.push(child);
      }
    }
    return shownChildren;
  }

  resetVisibleTree() {
    this.setState({ visibleTree: this.state.initialTree });
  }

  normalizeString(str: string) {
    return str.toLowerCase().trim();
  }

  matchesFilter(name: string) {
    return this.normalizeString(name).includes(
      this.normalizeString(this.state.filter)
    );
  }

  // generates file name, with match highlighted, for file explorer
  generateFileName(node: ChrisFile) {
    const { name } = node;
    const { filter } = this.state;
    if (!filter || !this.matchesFilter(name)) {
      return name;
    }
    const matchIndex = this.normalizeString(name).indexOf(
      this.normalizeString(filter)
    );
    const before = name.substring(0, matchIndex);

    const match = name.substring(matchIndex, matchIndex + filter.length);
    const after = name.substring(matchIndex + filter.length);

    return (
      <React.Fragment>
        {before}
        <span className="match-highlight">{match}</span>
        {after}
      </React.Fragment>
    );
  }

  renderTreeNode = (node: ChrisFile) => {
    const { files } = this.props;
    const isFolder = !!node.children;

    let isSelected;
    if (isFolder) {
      // there can never be multiple folders with the same path, and folders don't have ids
      isSelected = !!files.find(f => {
        return f.name === node.name;
      });
    } else {
      // but there can be multiple files with the same path
      isSelected = !!files.find(f => f.id === node.id);
    }
    const icon = isFolder ? (
      node.collapsed ? (
        <FolderCloseIcon />
      ) : (
        <FolderOpenIcon></FolderOpenIcon>
      )
    ) : (
      <FileIcon />
    );
    return (
      <span className="name">
        <Checkbox
          isChecked={isSelected}
          id={`check-${node.path}`}
          aria-label=""
          onChange={isChecked => this.handleCheckboxChange(isChecked, node)}
        />
        {icon}
        {this.generateFileName(node)}
      </span>
    );
  };

  render() {
    const { files, handleFileRemove } = this.props;
    const { initialTreeLoaded, visibleTree } = this.state;

    const fileList = files.map(file => {
      return (
        <div className="file-preview" key={file.id}>
          {file.children ? <FolderCloseIcon /> : <FileIcon />}
          <span className="file-name">{file.name}</span>
          <CloseIcon
            className="file-remove"
            onClick={() => handleFileRemove(file)}
          />
        </div>
      );
    });

    return (
      <div className="chris-file-select">
        <h1 className="pf-c-title pf-m-2xl">
          Data Configuration: ChRIS File Select
        </h1>
        <p>Please choose the data files you'd like to add to your feed.</p>
        <br />
        <Split gutter="lg">
          <SplitItem isFilled>
            <DataTableToolbar
              label="filename"
              onSearch={this.handleFilterChange}
            />
            {initialTreeLoaded ? (
              <Tree
                className="tree"
                tree={visibleTree}
                renderNode={this.renderTreeNode}
                paddingLeft={20}
              />
            ) : (
              <LoadingSpinner />
            )}
          </SplitItem>

          <SplitItem isFilled className="file-list-wrap">
            <p className="section-header">Files to add to new feed:</p>
            <div className="file-list">{fileList}</div>
          </SplitItem>
        </Split>
      </div>
    );
  }
}

const mapStateToProps = ({ feed }: ApplicationState) => ({
  feeds: feed.feeds,
  uploadedFiles: feed.uploadedFiles
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getUploadedFiles: () => dispatch(getUploadedFiles())
});

export default connect(mapStateToProps, mapDispatchToProps)(ChrisFileSelect);
