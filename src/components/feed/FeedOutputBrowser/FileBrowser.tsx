import React from "react";
import classNames from "classnames";

import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  GridItem,
  Alert,
  Button,
} from "@patternfly/react-core";
import {
  DownloadIcon,
  FileImageIcon,
  FileCodeIcon,
  FileAltIcon,
  FileIcon,
  FolderCloseIcon,
} from "@patternfly/react-icons";
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
} from "@patternfly/react-table";

import FileViewerModel from "../../../api/models/file-viewer.model";
import { IUITreeNode } from "../../../api/models/file-explorer.model";

import FileDetailView from "../../explorer/FileDetailView";
import { FileBrowserProps, FileBrowerState } from "./types";

class FileBrowser extends React.Component<FileBrowserProps, FileBrowerState> {
  constructor(props: FileBrowserProps) {
    super(props);
    this.state = {
      directory: props.root,
      breadcrumbs: [props.root],
    };

    this.generateTableRow = this.generateTableRow.bind(this);
    this.generateBreadcrumb = this.generateBreadcrumb.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
    this.handleBreadcrumbClick = this.handleBreadcrumbClick.bind(this);
    
  }

  /* EVENT LISTENERS */

  handleFileClick(e: React.MouseEvent, rows: any[], rowData: any) {
    const target = e.nativeEvent.target as HTMLElement;
    if (e.button !== 0 || target.closest(".download-file")) {
      // not alt-click or download click
     return;
    }

    const rowIndex: number = rowData.rowIndex;
    const { directory} = this.state;
    if (!directory.children) {
      return;
    }
    const file = directory.children[rowIndex];

    if (file.children) {
      this.setState({
        directory: file,
        breadcrumbs: [...this.state.breadcrumbs, file],
        previewingFile: undefined,
      });
    } else {
      this.setState({
        previewingFile: file,
      });
    }
  }

  handleBreadcrumbClick(
    e: React.MouseEvent,
    folder: IUITreeNode,
    prevBreadcrumbs: IUITreeNode[]
  ) {
    e.preventDefault();
    this.setState({
      directory: folder,
      breadcrumbs: [...prevBreadcrumbs, folder],
      previewingFile: undefined,
    });
  }

  async handleDownloadClick(e: React.MouseEvent, node: IUITreeNode) {
    e.stopPropagation();
    const blob = await node.file.getFileBlob();
    FileViewerModel.downloadFile(blob, node.module);
  }

 

  /* GENERATE UI ELEMENTS */

 

  generateTableRow(node: IUITreeNode) {
    let type = "File";
    if (node.children) {
      type = "Dir";
    } else if (node.file) {
      const name = node.module;
      if (name.indexOf(".") > -1) {
        type = name.split(".").splice(-1)[0].toUpperCase();
      }
    }
    const icon = getIcon(type);
    const isPathSelected =
      !!this.state.pathViewingFile &&
      this.state.pathViewingFile.uiId === node.uiId;
    const isPreviewing =
      !!this.state.previewingFile &&
      this.state.previewingFile.uiId === node.uiId;

    const fileName = (
      <div
        className={classNames(
          "file-name",
          isPathSelected && "path-selected",
          isPreviewing && "previewing"
        )}
      >
        {icon}
        {node.module}
      </div>
    );

    const name = {
      title: fileName
    };

    const download = {
      title: node.children ? (
        ""
      ) : (
        <DownloadIcon
          className="download-file-icon"
          onClick={(e) => this.handleDownloadClick(e, node)}
        />
      ),
    };

    return {
      cells: [name, type, download],
    };
  }

  generateBreadcrumb(
    folder: IUITreeNode,
    i: number,
    breadcrumbs: IUITreeNode[]
  ) {
    const prevBreadcrumbs = breadcrumbs.slice(0, i);
    const onClick = (e: React.MouseEvent) =>
      this.handleBreadcrumbClick(e, folder, prevBreadcrumbs);
    return (
      <BreadcrumbItem className="breadcrumb" onClick={onClick} key={i}>
        {folder.module}
      </BreadcrumbItem>
    );
  }

  // Gets the file path for a node. Temporary, until IUITreeNode is replaced
  getNodePath(node: IUITreeNode) {
    if (node.file) {
      return `/${node.file.fname}`;
    }

    const { breadcrumbs } = this.state;

    // currently on top-level directory
    if (breadcrumbs.length === 1) {
      return `/${node.module}`;
    }

    // IUITreeNode.file is not set if the the node is a folder
    const path = breadcrumbs
      .slice(1) // exclude the plugin directory
      .map((breadcrumb: IUITreeNode) => breadcrumb.module)
      .join("/");

    return `/${path}/${node.module}`;
  }

  render() {
    const {
      handleFileBrowserToggle,
      handleFileViewerToggle,
      selectedFiles,
    } = this.props;
    const { directory, breadcrumbs, previewingFile } = this.state;

    if (!directory.children || !directory.children.length) {
      return <div>No files in this directory.</div>;
    }

    const cols = ["Name", "Type", ""]; // final col is download
    const rows = directory.children.map(this.generateTableRow);

    return (
      <Grid hasGutter className="file-browser">
        <GridItem className="file-browser__table" span={6} rowSpan={12}>
          <Breadcrumb>{breadcrumbs.map(this.generateBreadcrumb)}</Breadcrumb>
          <span className="files-info">
            {selectedFiles ? `${selectedFiles.length} files` : "Empty Directory"}
          </span>
          <Button
            className="download-all-button"
            variant="secondary"
            onClick={() => this.props.downloadAllClick()}
          >
            <DownloadIcon />
            Download All 
          </Button>
          <Table
            aria-label="feed-browser-table"
            variant={TableVariant.compact}
            caption="files"
            cells={cols}
            rows={rows}
            className="file-list"
          >
            <TableHeader />
            <TableBody onRowClick={this.handleFileClick} />
          </Table>
        </GridItem>

        {previewingFile ? (
          <GridItem className="file-browser__detail" span={6} rowSpan={12}>
            <FileDetailView
              fullScreenMode={true}
              selectedFile={previewingFile}
              toggleFileBrowser={() => {
                handleFileBrowserToggle(previewingFile, directory);
              }}
              toggleFileViewer={() => {
                handleFileViewerToggle(previewingFile, directory);
              }}
            />
          </GridItem>
        ) : (
          <GridItem className="file-browser__previewTab" span={6} rowSpan={12}>
            <Alert
              style={{
                width: "80%",
              }}
              title="Click on the file to preview"
              variant="info"
            />
          </GridItem>
        )}
      </Grid>
    );
  }
}

export default FileBrowser;

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "dir":
      return <FolderCloseIcon />;
    case "dcm":
    case "jpg":
    case "png":
      return <FileImageIcon />;
    case "html":
    case "json":
      return <FileCodeIcon />;
    case "txt":
      return <FileAltIcon />;
    default:
      return <FileIcon />;
  }
};
