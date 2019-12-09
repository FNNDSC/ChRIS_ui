import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import JSZip from "jszip";
import _ from "lodash";

import { Title, Split, SplitItem, Button } from "@patternfly/react-core";
import {
  FolderOpenIcon,
  FolderCloseIcon,
  DownloadIcon
} from "@patternfly/react-icons";
import { FeedFile } from "@fnndsc/chrisapi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { IPluginItem } from "../../api/models/pluginInstance.model";
import UITreeNodeModel, {
  IUITreeNode
} from "../../api/models/file-explorer.model";

import FileViewerModel from "../../api/models/file-viewer.model";

import PluginViewerModal from "../plugin/PluginViewerModal";
import { setSelectedFile } from "../../store/explorer/actions";

import FileBrowser from "./FileBrowser";

// INTERFACES

interface FeedOutputBrowserProps {
  selected?: IPluginItem;
  plugins?: IPluginItem[];
  token: string;

  handlePluginSelect: Function;
  setSelectedFile: Function;
  files?: FeedFile[];
}

interface FeedOutputBrowserState {
  fileCache?: { [pluginId: number]: FeedFile[] };
  pluginModalOpen: boolean;
}

class FeedOutputBrowser extends React.Component<
  FeedOutputBrowserProps,
  FeedOutputBrowserState
> {
  constructor(props: FeedOutputBrowserProps) {
    super(props);
    this.state = {
      fileCache: [],
      pluginModalOpen: false
    };

    this.handleDownloadAllClick = this.handleDownloadAllClick.bind(this);
    this.handlePluginModalOpen = this.handlePluginModalOpen.bind(this);
    this.handlePluginModalClose = this.handlePluginModalClose.bind(this);
    this.generateSidebarItem = this.generateSidebarItem.bind(this);
  }

  /* DATA FETCHING & MANIPULATION */
  componentDidMount() {
    if (this.props.files && this.props.selected) {
      const id = this.props.selected.id as number;
      this.setState({
        fileCache: {
          ...this.state.fileCache,
          [id]: this.props.files
        }
      });
    }
  }

  componentDidUpdate(prevProps: FeedOutputBrowserProps) {
    const { files } = this.props;
    if (!files) {
      return;
    }
    if (prevProps.files !== files && prevProps.selected) {
      const id = prevProps.selected.id as number;
      this.setState({
        fileCache: {
          ...this.state.fileCache,
          [id]: files
        }
      });
    }
  }

  createTreeFromFiles(files: FeedFile[], selected: IPluginItem) {
    if (!files || !files.length) {
      return null;
    }

    const model = new UITreeNodeModel(files, selected);
    const tree = model.getTree();
    tree.module = this.getPluginName(selected);
    return this.sortTree(tree);
  }

  sortTree(root: IUITreeNode) {
    let children: IUITreeNode[] = [];
    if (root.children) {
      children = root.children.sort((a: IUITreeNode, b: IUITreeNode) => {
        if (a.children && !b.children) {
          return -1;
        } else if (!a.children && b.children) {
          return 1;
        }
        return 0;
      });

      for (const child of root.children) {
        if (child.children) {
          child.children = this.sortTree(child).children;
        }
      }
    }
    return { ...root, children };
  }

  /* EVENT LISTENERS */

  async handleDownloadAllClick() {
    const { selected } = this.props;
    const { fileCache } = this.state;
    if (!selected) {
      return;
    }

    const files = fileCache && fileCache[selected.id as number];

    const zip = new JSZip();
    if (files) {
      for (const file of files) {
        const fileBlob = await file.getFileBlob();
        zip.file(file.data.fname, fileBlob);
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const filename = `${this.getPluginName(selected)}.zip`;
    FileViewerModel.downloadFile(blob, filename);
  }

  handlePluginModalOpen(file: IUITreeNode, folder: IUITreeNode) {
    this.setState({ pluginModalOpen: true });
    this.props.setSelectedFile(file, folder);
  }

  handlePluginModalClose() {
    this.setState({ pluginModalOpen: false });
  }

  handleSidebarItemClick(plugin: IPluginItem) {
    this.props.handlePluginSelect(plugin);
  }

  /* GENERATE UI ELEMENTS */

  // Description: Generate plugin item for sidebar
  generateSidebarItem(plugin: IPluginItem) {
    const { id } = plugin;
    const { selected } = this.props;
    const name = this.getPluginName(plugin);
    const isSelected = selected && selected.id === id;
    const icon = isSelected ? <FolderOpenIcon /> : <FolderCloseIcon />;
    const className = isSelected ? "selected" : "";

    return (
      <li
        className={className}
        key={id}
        onClick={() => this.handleSidebarItemClick(plugin)}
      >
        {icon}
        {name}
      </li>
    );
  }

  // Format plugin name to "Name_vVersion_ID"
  getPluginName(plugin: IPluginItem) {
    const title = plugin.plugin_name;
    const formattedTitle = title.replace(/\s+/, "_");
    const { plugin_version, id } = plugin;
    return `${formattedTitle}_v${plugin_version}_${id}`;
  }

  // Format plugin name to "Name v. Version"
  getPluginDisplayName(plugin: IPluginItem) {
    return `${plugin.plugin_name} v. ${plugin.plugin_version}`;
  }

  render() {
    console.log(this.state.fileCache);
    const { plugins, selected } = this.props;
    const { fileCache, pluginModalOpen } = this.state;

    if (!selected || !plugins) {
      return (
        <div className="feed-output-browser">
          <header className="header-top">Output Browser</header>
          <FontAwesomeIcon icon="spinner" pulse size="3x" />
        </div>
      );
    }

    const pluginName = this.getPluginName(selected);
    const pluginDisplayName = this.getPluginDisplayName(selected);

    const selectedFiles = fileCache && fileCache[selected.id as number];

    let tree;
    if (selectedFiles) {
      tree = this.createTreeFromFiles(selectedFiles, selected);
    }

    return (
      <div className="feed-output-browser">
        <header className="header-top">Output Browser</header>

        <Split>
          <SplitItem>
            <ul className="sidebar">{plugins.map(this.generateSidebarItem)}</ul>
          </SplitItem>

          <SplitItem isFilled>
            <div className="file-browser-header">
              <div>
                <Title headingLevel="h1" size="2xl" className="plugin-name">
                  {pluginDisplayName}
                </Title>
                <span className="plugin-id">ID: {selected.id}</span>
              </div>
              {selectedFiles && (
                <div className="files-info">
                  {selectedFiles.length} files
                  <Button
                    className="download-all-button"
                    variant="secondary"
                    onClick={this.handleDownloadAllClick}
                  >
                    <DownloadIcon />
                    Download All
                  </Button>
                </div>
              )}
            </div>
            {tree ? (
              <FileBrowser
                pluginName={pluginName}
                root={tree}
                key={selected.id}
                handleViewerModeToggle={this.handlePluginModalOpen}
              />
            ) : (
              <FontAwesomeIcon
                title="This may take a while...."
                icon="spinner"
                pulse
                size="6x"
                color="black"
              />
            )}
          </SplitItem>
        </Split>

        <PluginViewerModal
          isModalOpen={pluginModalOpen}
          handleModalToggle={this.handlePluginModalClose}
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSelectedFile: (file: IUITreeNode, folder: IUITreeNode) =>
    dispatch(setSelectedFile(file, folder))
});

export default connect(null, mapDispatchToProps)(FeedOutputBrowser);
