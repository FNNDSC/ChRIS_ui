import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import JSZip from "jszip";

import { Title, Split, SplitItem, Button } from "@patternfly/react-core";
import {
  FolderOpenIcon,
  FolderCloseIcon,
  DownloadIcon
} from "@patternfly/react-icons";
import { FeedFile, Collection } from "@fnndsc/chrisapi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { IPluginItem } from "../../api/models/pluginInstance.model";
import UITreeNodeModel, {
  IUITreeNode
} from "../../api/models/file-explorer.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import FileViewerModel from "../../api/models/file-viewer.model";
import { IFeedFile } from "../../api/models/feed-file.model";
import PluginViewerModal from "../plugin/PluginViewerModal";
import { setSelectedFile } from "../../store/explorer/actions";

import FileBrowser from "./FileBrowser";

// UTILITIES

// Temporary utility for transitioning between internal types and chrisapi types
function convertFiles(files: FeedFile[], selected: IPluginItem): IFeedFile[] {
  return files.map(file => {
    const getRelation = (name: string) => {
      return Collection.getLinkRelationUrls(file.collection.items[0], name)[0];
    };

    return {
      url: file.url,
      file_resource: getRelation("file_resource"),
      plugin_instances: getRelation("plugin_instances"),
      id: file.data.id,
      feed_id: file.data.feed_id,
      plugin_inst_id: file.data.plugin_inst_id,
      fname: file.data.fname
        .split(`${selected.plugin_name}_${selected.id}`)[1]
        .slice(1)
    };
  });
}

// INTERFACES

interface FeedOutputBrowserProps {
  selected?: IPluginItem;
  plugins?: IPluginItem[];
  token: string;

  handlePluginSelect: Function;
  setSelectedFile: Function;
}

interface FeedOutputBrowserState {
  files: { [pluginId: number]: FeedFile[] };
  pluginModalOpen: boolean;
}

class FeedOutputBrowser extends React.Component<
  FeedOutputBrowserProps,
  FeedOutputBrowserState
> {
  constructor(props: FeedOutputBrowserProps) {
    super(props);
    this.state = {
      files: [],
      pluginModalOpen: false
    };

    this.handleDownloadAllClick = this.handleDownloadAllClick.bind(this);
    this.handlePluginModalOpen = this.handlePluginModalOpen.bind(this);
    this.handlePluginModalClose = this.handlePluginModalClose.bind(this);
    this.generateSidebarItem = this.generateSidebarItem.bind(this);
  }

  componentDidMount() {
    if (this.props.selected) {
      this.fetchPluginFiles(this.props.selected);
    }
  }

  componentDidUpdate(prevProps: FeedOutputBrowserProps) {
    const { selected } = this.props;
    if (!selected) {
      return;
    }
    const id = selected.id as number;
    const files = this.state.files[id];
    if (
      !prevProps.selected ||
      (prevProps.selected.id !== selected.id && !files)
    ) {
      this.fetchPluginFiles(selected);
    }
  }

  /* DATA FETCHING & MANIPULATION */

  async fetchPluginFiles(plugin: IPluginItem) {
    const id = plugin.id as number;
    if (this.state.files[id]) {
      return;
    }

    // get all files
    const client = ChrisAPIClient.getClient();
    const params = { limit: 100, offset: 0 };
    const pluginInstance = await client.getPluginInstance(id);
    let fileList = await pluginInstance.getFiles(params);
    const files = fileList.getItems();

    while (fileList.hasNextPage) {
      try {
        params.offset += params.limit;
        fileList = await pluginInstance.getFiles(params);
        files.push(...fileList.getItems());
      } catch (e) {
        console.error(e);
      }
    }

    this.setState({
      files: {
        ...this.state.files,
        [id]: files
      }
    });
  }

  createTreeFromFiles(files: FeedFile[], selected: IPluginItem) {
    if (!files) {
      return null;
    }
    const model = new UITreeNodeModel(convertFiles(files, selected), selected);
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
    if (!selected) {
      return;
    }

    const files = this.state.files[selected.id as number];
    const zip = new JSZip();
    for (const file of files) {
      const fileBlob = await file.getFileBlob();
      zip.file(file.data.fname, fileBlob);
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
    this.fetchPluginFiles(plugin);
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
    const { plugins, selected } = this.props;
    const { files, pluginModalOpen } = this.state;

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

    const selectedFiles = files[selected.id as number];
    const tree = this.createTreeFromFiles(selectedFiles, selected);

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
              <FontAwesomeIcon icon="spinner" pulse size="2x" />
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

export default connect(
  null,
  mapDispatchToProps
)(FeedOutputBrowser);
