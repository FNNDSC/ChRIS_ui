import React from "react";
import classNames from "classnames";
import FileDetailView from "../../explorer/FileDetailView";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  GridItem,
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
import { FileBrowserProps, FileBrowserState } from "./types";

function getInitialState(root: IUITreeNode) {
  return {
    directory: root,
    breadcrumbs: [root],
    previewingFile: undefined,
  };
}

const FileBrowser = (props: FileBrowserProps) => {
  const {
    root,
    selectedFiles,
    downloadAllClick,
    handleFileBrowserToggle,
    handleFileViewerToggle,
  } = props;
  const [
    fileBrowserState,
    setfileBrowserState,
  ] = React.useState<FileBrowserState>(getInitialState(root));
  const { breadcrumbs, directory, previewingFile } = fileBrowserState;
  console.log("FileBrowserState", fileBrowserState);

  const generateBreadcrumb = () => {
    return <h1>Test</h1>;;
  };

  return (
    <Grid hasGutter className="file-browser">
      <GridItem
        xl2={4}
        xl2RowSpan={12}
        xl={4}
        xlRowSpan={12}
        lg={4}
        lgRowSpan={12}
        md={4}
        mdRowSpan={12}
        sm={12}
        smRowSpan={12}
        className="file-browser__firstGrid"
      >
        <div className="file-browser__header">
          <Breadcrumb>{breadcrumbs.map(generateBreadcrumb)}</Breadcrumb>
          <div className="file-browser__header__info">
            <span className="files-browser__header--fileCount">
              {selectedFiles
                ? `(${selectedFiles.length} files)`
                : "Empty Directory"}
            </span>
            <Button
              className="file-browser__header--downloadButton"
              onClick={() => downloadAllClick()}
              variant="secondary"
            >
              Download All
            </Button>
          </div>
        </div>
      </GridItem>
    </Grid>
  );
};

export default FileBrowser;

/**
 *
 * @param type string
 * @returns JSX Element
 */

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
