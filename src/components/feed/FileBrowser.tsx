import React from "react";
import classNames from "classnames";

import {
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
  PopoverPosition,
} from "@patternfly/react-core";
import {
  FileImageIcon,
  FileCodeIcon,
  FileAltIcon,
  FileIcon,
  FolderCloseIcon,
  DownloadIcon,
} from "@patternfly/react-icons";
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
} from "@patternfly/react-table";

import FileViewerModel from "../../api/models/file-viewer.model";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import TextCopyPopover from "../common/textcopypopover/TextCopyPopover";
import FileDetailView from "../explorer/FileDetailView";

function getIcon(type: string) {
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
}

interface FileBrowserProps {
  root: IUITreeNode;
  pluginName?: string;
  handleViewerModeToggle: (file: IUITreeNode, directory: IUITreeNode) => void;
}

interface FileBrowerState {
  directory: IUITreeNode;
  breadcrumbs: IUITreeNode[];
  previewingFile?: IUITreeNode; // file selected for preview
  pathViewingFile?: IUITreeNode; // file selected via shift-click for viewing full path
}

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
    this.handlePathPopoverClose = this.handlePathPopoverClose.bind(this);
    this.handlePathPopoverBlur = this.handlePathPopoverBlur.bind(this);
  }

  /* EVENT LISTENERS */

  handleFileClick(e: React.MouseEvent, rows: any[], rowData: any) {
    const target = e.nativeEvent.target as HTMLElement;
    if (e.button !== 0 || target.closest(".download-file")) {
      // not alt-click or download click
      return;
    }

    const rowIndex: number = rowData.rowIndex;
    const { directory, pathViewingFile: pathSelectedFile } = this.state;
    if (!directory.children) {
      return;
    }
    const file = directory.children[rowIndex];

    if (e.nativeEvent.altKey) {
      if (pathSelectedFile && pathSelectedFile.uiId === file.uiId) {
        return;
      }
      return this.handlePathPopoverOpen(file);
    }

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

  // PATH POPOVER LISTENERS

  handlePathPopoverOpen(file: IUITreeNode) {
    this.setState({ pathViewingFile: file });
  }

  handlePathPopoverClose() {
    this.setState({ pathViewingFile: undefined });
  }

  // Prevent the click from propagating to file, which would open filepreview
  handlePathPopoverClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }

  // Close the path popover if click is outside, otherwise do nothing
  handlePathPopoverBlur(e: React.FocusEvent) {
    const relatedTarget = e.nativeEvent.relatedTarget as Element;
    if (!relatedTarget || !relatedTarget.closest(".path-popover-wrap")) {
      this.handlePathPopoverClose();
    }
  }

  /* GENERATE UI ELEMENTS */

  generatePopover(path: string, children: JSX.Element, isVisible: boolean) {
    const header = <span>Full file path</span>;
    return (
      <TextCopyPopover
        headerContent={header}
        text={path}
        children={children}
        isVisible={isVisible}
        className="path-popover-wrap"
        tabIndex={0}
        position={PopoverPosition.bottom}
        onMouseDown={this.handlePathPopoverClick}
        onBlur={this.handlePathPopoverBlur}
        shouldClose={this.handlePathPopoverClose}
      />
    );
  }

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
      title: this.generatePopover(
        this.getNodePath(node),
        fileName,
        isPathSelected
      ),
    };
    const size = ""; // Getting sizes would require loading each file. Deferred until server implements a `size` field.
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
      cells: [name, type, size, download],
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
    const { handleViewerModeToggle } = this.props;
    const { directory, breadcrumbs, previewingFile } = this.state;

    if (!directory.children || !directory.children.length) {
      return <div>No files in this directory.</div>;
    }

    const cols = ["Name", "Type", "Size", ""]; // final col is download
    const rows = directory.children.map(this.generateTableRow);

    return (
      <div className="file-browser">
        <Breadcrumb>{breadcrumbs.map(this.generateBreadcrumb)}</Breadcrumb>

        <Split gutter="md" className="file-browser__flex">
          <SplitItem className="file-browser__flex__item1">
            <Table
              caption="files"
              variant={TableVariant.compact}
              cells={cols}
              rows={rows}
              className="file-list"
            >
              <TableHeader />
              <TableBody onRowClick={this.handleFileClick} />
            </Table>
          </SplitItem>

          {previewingFile && (
            <SplitItem className="file-browser__flex__item2">
              <FileDetailView
                selectedFile={previewingFile}
                toggleViewerMode={() =>
                  handleViewerModeToggle(previewingFile, directory)
                }
              />
            </SplitItem>
          )}
        </Split>
      </div>
    );
  }
}

export default FileBrowser;
