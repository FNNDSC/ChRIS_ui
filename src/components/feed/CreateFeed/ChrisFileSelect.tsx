import React from 'react';

import Client, { UploadedFile } from '@fnndsc/chrisapi';
import { FolderCloseIcon, FolderOpenIcon, FileIcon, CloseIcon } from '@patternfly/react-icons';
import { Checkbox, Split, SplitItem, TextInput } from '@patternfly/react-core';

import Tree from 'react-ui-tree';

import LoadingComponent from '../../common/loading/Loading';
import { ChrisFile } from './CreateFeed';

function getDataValue(data: Array<{ name: string, value: string }>, name: string) {
  const dataItem =  data.find((dataItem: { name: string, value: string }) => dataItem.name === name);
  if (dataItem) {
    return dataItem.value;
  }
  return '';
}

function getEmptyTree() {
  return {
    name: 'ChRIS Files',
    path: '/',
    children: [],
  }
}


interface ChrisFileSelectProps {
  files: ChrisFile[],
  handleFileAdd: (file: ChrisFile) => void,
  handleFileRemove: (file: ChrisFile) => void,
}

interface ChrisFileSelectState {
  filter: string,
  initialTreeLoaded: boolean,
  initialTree: ChrisFile,
  visibleTree: ChrisFile,
}

class ChrisFileSelect extends React.Component<ChrisFileSelectProps, ChrisFileSelectState> {

  constructor(props: ChrisFileSelectProps) {
    super(props);
    this.state = {
      filter: '',
      initialTreeLoaded: false,
      initialTree: getEmptyTree(),
      visibleTree: getEmptyTree(),
    }
  }

  componentDidMount() {
    this.disableTreeDraggables();
    this.fetchChrisFiles().then((files: string[]) => {
      const tree = this.buildInitialFileTree(files);
      this.setState({
        initialTreeLoaded: true,
        initialTree: tree,
        visibleTree: tree,
      });
    })

  }

  componentDidUpdate() {
    this.disableTreeDraggables();
  }

  // finds all nodes and disables the draggable function that comes with the react-ui-tree
  // from FileExplorer.tsx
  disableTreeDraggables() {
    const arr = Array.from(document.getElementsByClassName('m-node'));
    for (const el of arr) {
      el.addEventListener('mousedown', (e: Event) => { e.stopPropagation() }, { passive: false });
    }
  }

  /* DATA FETCHING */

  /**
   * 
   * @param fileNames list of files, e.g. ['/data1.txt', 'data2.txt', /project/data2.txt']
   * @returns ChrisFile tree
   */
  buildInitialFileTree(fileNames: string[]) {
    const root = getEmptyTree();
    for (const path of fileNames) {

      const parts = path.split('/').slice(1); // remove initial '/'
      const name = parts[parts.length - 1];
      const dirs = parts.slice(0, parts.length - 1);

      let currentDir: ChrisFile[] = root.children;
      for (const dirName of dirs) {
        const existingDir = currentDir.find((pathObj: ChrisFile) => pathObj.name === dirName);

        if (existingDir && existingDir.children) {
          currentDir = existingDir.children;
          continue;
        }

        const newDir = {
          name: dirName,
          children: [],
          path: `${dirName.split(dirName)[0]}${dirName}`,
          collapsed: true,
        }
        currentDir.push(newDir);
        currentDir = newDir.children;
      }
      currentDir.push({ name: name, path: path });
    }
    return this.sortTree(root);
  }

  sortTree(root: ChrisFile) {
    let children: ChrisFile[] = [];
    if (root.children) {

      children = root.children.sort((a: ChrisFile, b: ChrisFile) => {
        if (a.children && !b.children) {
          return -1;
        } else if (!a.children && b.children) {
          return 1;
        } else { // both folders or both files
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

  async fetchChrisFiles(): Promise<string[]> {
    if (!process.env.REACT_APP_CHRIS_UI_AUTH_URL || !process.env.REACT_APP_CHRIS_UI_URL) return new Promise(res => res([])); // TEMPORARY!
    const authToken = await Client.getAuthToken(process.env.REACT_APP_CHRIS_UI_AUTH_URL, 'chris', 'chris1234');
    const client = new Client(process.env.REACT_APP_CHRIS_UI_URL, { token: authToken });
    const feeds = await client.getFeeds({ limit: 0, offset: 0 });
    const uploadedFileList = await feeds.getUploadedFiles({ limit: 10, offset: 0 });
    const files = uploadedFileList.getItems();
    if (!files) {
      return [];
    }

    const fileNames = files.map(file => {
      const fileData = (file as UploadedFile).item.data;
      return getDataValue(fileData, 'upload_path');
    })
    return fileNames;
  }

  /* EVENT HANDLERS */

  handleCheckboxChange = (isChecked: boolean, file: ChrisFile) => {
    if (isChecked) {
      this.props.handleFileAdd(file);
    } else {
      this.props.handleFileRemove(file);
    }
  }

  /* SEARCH */

  handleFilterChange = (value: string) => {
    this.setState({ filter: value }, () => {
      if (value) {
        this.recomputeVisibleTree();
      } else {
        this.resetVisibleTree();
      }
    });
  }

  recomputeVisibleTree() {
    if (this.state.initialTree.children) {
      const visibleTopLevelChildren = this.computeVisibleChildren(this.state.initialTree.children);
      this.setState({
        visibleTree: {
          name: 'ChRIS Files',
          path: '/',
          children: visibleTopLevelChildren,
        }
      })
    }
  }

  computeVisibleChildren(children: ChrisFile[]): ChrisFile[] {
    const shownChildren = [];
    for (const child of children) {
      if (!child.children && this.matchesFilter(child.name)) { // is file and matches
        shownChildren.push(child);
      } else if (child.children) { // if it's a folder
        const folderShownChildren = this.computeVisibleChildren(child.children); // get its shown children
        if (folderShownChildren.length) {
          const folder = {
            name: child.name,
            path: child.path,
            children: folderShownChildren,
          }
          shownChildren.push(folder);
        }
      }
    }
    return shownChildren;
  }

  resetVisibleTree() {
    this.setState({ visibleTree: this.state.initialTree })
  }

  normalizeString(str: string) {
    return str.toLowerCase().trim();
  }

  matchesFilter(name: string) {
    return this.normalizeString(name).includes(this.normalizeString(this.state.filter));
  }

  // generates file name, with match highlighted, for file explorer
  generateFileName(node: ChrisFile) {
    const name = node.name;
    if (!this.state.filter || !this.matchesFilter(name) || node.children) { // REMOVE THE LAST CLAUSE IF FOLDERS ARE SEARCHABLE
      return name;
    }
    const matchIndex = this.normalizeString(name).indexOf(this.normalizeString(this.state.filter));
    const before = name.substring(0, matchIndex);
    const match = name.substring(matchIndex, matchIndex + this.state.filter.length);
    const after = name.substring(matchIndex + this.state.filter.length);
    return (
      <React.Fragment>
        {before}
        <span className="match-highlight">{match}</span>
        {after}
      </React.Fragment>
    );
  }

  renderTreeNode = (node: ChrisFile) => {
    const isSelected = !!this.props.files.find(f => f.path === node.path);
    const isFolder = node.children;
    const icon = isFolder
      ? (node.collapsed ? <FolderCloseIcon /> : <FolderOpenIcon></FolderOpenIcon>)
      : <FileIcon />
    return (
      <span className="name">
        <Checkbox
          checked={isSelected}
          id={`check-${node.path}`}
          aria-label=""
          onChange={isChecked => this.handleCheckboxChange(isChecked, node)}
        />
        {icon}
        {this.generateFileName(node)}
      </span>
    )
  }

  render() {

    const fileList = this.props.files.map(file => (
      <div className="file-preview" key={file.path}>
        {
          file.children ? <FolderCloseIcon /> : <FileIcon />
        }
        <span className="file-name">{file.name}</span>
        <CloseIcon className="file-remove" onClick={() => this.props.handleFileRemove(file)} />
      </div>
    ))

    return (
      <div className="chris-file-select">
        <h1 className="pf-c-title pf-m-2xl">Data Configuration: ChRIS File Select</h1>
        <p>Please choose the data files you'd like to add to your feed.</p>
        <br />
        <Split gutter="lg">
          <SplitItem isMain>
            <TextInput
              type="text"
              id="file-filter"
              value={this.state.filter}
              placeholder="Filter by filename..."
              onChange={this.handleFilterChange}
            />
            {
              this.state.initialTreeLoaded ?
                <Tree
                  tree={this.state.visibleTree}
                  renderNode={this.renderTreeNode}
                  paddingLeft={20}
                /> :
                <LoadingComponent />
            }
          </SplitItem>
          <SplitItem isMain className="file-list">
            <p className="section-header">Files to add to new feed:</p>
            {fileList}
          </SplitItem>
        </Split>
      </div>
    );
  }
}

export default ChrisFileSelect;