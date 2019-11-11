import React from "react";

import { UploadedFile } from "@fnndsc/chrisapi";
import {
  FolderCloseIcon,
  FolderOpenIcon,
  FileIcon,
  CloseIcon
} from "@patternfly/react-icons";
import { Checkbox, Split, SplitItem } from "@patternfly/react-core";

import Tree from "react-ui-tree";

import LoadingSpinner from "../../common/loading/LoadingSpinner";
import { ChrisFile, fetchAllChrisFiles } from "./CreateFeed";
import { DataTableToolbar } from "../..";

function getEmptyTree() {
  return {
    name: "ChRIS Files",
    path: "/",
    children: []
  };
}

// used between fetching the files and building the tree
interface ChrisFilePath {
  path: string;
  id: number;
}

interface ChrisFileSelectProps {
  files: ChrisFile[];
  handleFileAdd: (file: ChrisFile) => void;
  handleFileRemove: (file: ChrisFile) => void;
}

interface ChrisFileSelectState {
  filter: string;
  initialTreeLoaded: boolean;
  initialTree: ChrisFile;
  visibleTree: ChrisFile;
}

class ChrisFileSelect extends React.Component<
  ChrisFileSelectProps,
  ChrisFileSelectState
> {
  constructor(props: ChrisFileSelectProps) {
    super(props);
    this.state = {
      filter: "",
      initialTreeLoaded: false,
      initialTree: getEmptyTree(),
      visibleTree: getEmptyTree()
    };
  }

  componentDidMount() {
    this.disableTreeDraggables();
    this.fetchChrisFiles().then((files: ChrisFilePath[]) => {
      const tree = this.buildInitialFileTree(files);
      this.setState({
        initialTreeLoaded: true,
        initialTree: tree,
        visibleTree: tree
      });
    });

    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  componentDidUpdate() {
    this.disableTreeDraggables();
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

  /* DATA FETCHING */

  // Transforms list of ChrisFilePaths into a ChrisFile tree
  buildInitialFileTree(filePaths: ChrisFilePath[]) {
    const root = getEmptyTree();
    for (const pathObj of filePaths) {
      const { path, id } = pathObj;
      const parts = path.split("/").slice(1); // remove initial '/'
      const name = parts[parts.length - 1];
      const dirs = parts.slice(0, parts.length - 1);

      let currentDir: ChrisFile[] = root.children;
      for (const dirName of dirs) {
        const existingDir = currentDir.find(
          (pathObj: ChrisFile) => pathObj.name === dirName
        );

        if (existingDir && existingDir.children) {
          currentDir = existingDir.children;
          continue;
        }

        const newDir = {
          name: dirName,
          children: [],
          path: `${dirName.split(dirName)[0]}${dirName}`,
          collapsed: true
        };
        currentDir.push(newDir);
        currentDir = newDir.children;
      }
      currentDir.push({ name, path, id });
    }

    return this.sortTree(root);
  }

  // Moves folders to top and orders alphabetically
  sortTree(root: ChrisFile) {
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

  async fetchChrisFiles(): Promise<ChrisFilePath[]> {
    const files = await fetchAllChrisFiles();

    return Promise.all(
      files.map(async file => {
        const fileData = (file as UploadedFile).data;
        return {
          path: fileData.upload_path,
          id: Number(fileData.id)
        };
      })
    );
  }

  /* EVENT HANDLERS */

  handleCheckboxChange(isChecked: boolean, file: ChrisFile) {
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
      isSelected = !!files.find(f => f.path === node.path);
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

    const fileList = files.map(file => (
      <div className="file-preview" key={file.path}>
        {file.children ? <FolderCloseIcon /> : <FileIcon />}
        <span className="file-name">{file.name}</span>
        <CloseIcon
          className="file-remove"
          onClick={() => handleFileRemove(file)}
        />
      </div>
    ));

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

export default ChrisFileSelect;
