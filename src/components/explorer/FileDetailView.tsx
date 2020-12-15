import * as React from "react";
import { Button } from "@patternfly/react-core";
import { ExpandIcon, FilmIcon } from "@patternfly/react-icons";
import {
  getFileExtension,
  IUITreeNode,
} from "../../api/models/file-explorer.model";
import { Skeleton } from "@patternfly/react-core";
import { IFileBlob } from "../../api/models/file-viewer.model";
import { fileViewerMap } from "../../api/models/file-viewer.model";
import { isEqual } from "lodash";
import "./file-detail.scss";

const ViewerDisplayComponent=React.lazy(()=>import('./displays/ViewerDisplay'))

type AllProps = {
  selectedFile: IUITreeNode;
  fullScreenMode?: boolean;
  toggleFileBrowser: () => void;
  toggleFileViewer: () => void;
  isDicom?: boolean;
};

class FileDetailView extends React.Component<AllProps, IFileBlob> {
  _isMounted = false;
  constructor(props: AllProps) {
    super(props);
    this.state = {
      blob: undefined,
      fileType: "",
      file: undefined,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchData();
  }

  fetchData() {
    const { selectedFile } = this.props;

    const fileName = selectedFile.module,
      fileType = getFileExtension(fileName);
    selectedFile.file.getFileBlob().then((result: any) => {
      const _self = this;
      if (!!result) {
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          _self._isMounted &&
            _self.setState({
              blob: result,
              fileType,
              file: Object.assign({}, selectedFile.file.data),
            });
        });
        reader.readAsText(result);
      }
    });
  }

  render() {
    const { selectedFile } = this.props;

    const fileTypeViewer = () => {
      if (!isEqual(selectedFile.file.data, this.state.file)) {
        this.fetchData();
        return <div className="viewer-display">
          <Skeleton shape='square'  width="50%" screenreaderText="Loading File Preview"/>
        </div>
      } else {
        let viewerName: string = "";
        let filesize: number = 1000000;
        if (this.state.blob && this.state.blob.size > filesize) {
          viewerName = "CatchallDisplay";
        } else if (!fileViewerMap[this.state.fileType]) {
          viewerName = "IframeDisplay";
        } else {
          viewerName = fileViewerMap[this.state.fileType];
        }

        return (
          <>
            {this.renderHeader()}
            <div className="viewer-display">
              <React.Suspense fallback={<Skeleton shape="square" width="50%" screenreaderText="Fallback component being lodaded"/>}>
              <ViewerDisplayComponent tag={viewerName} fileItem={this.state} />
             </React.Suspense>
            </div>
          </>
        );
      }
    };
    return fileTypeViewer();
  }

  // Decription: Render the Header
  renderHeader() {
    const { selectedFile } = this.props;
    return (
      <div className="header-panel">
        {this.renderDownloadButton()}
        <h1>
          File Preview: <b>{selectedFile.module}</b>
        </h1>
      </div>
    );
  }

  // Description: Fetch blob and read it into state to display preview

  renderDownloadButton = () => {
    const { fullScreenMode } = this.props;

    return (
      <>
        {fullScreenMode === true && (
          <Button
            variant="link"
            onClick={() => {
              this.props.toggleFileBrowser();
            }}
          >
            <ExpandIcon />
            <span> Maximize</span>
          </Button>
        )}

        {(this.state.fileType === "dcm" ||
          this.state.fileType === "png" ||
          this.state.fileType === "jpg" ||
          this.state.fileType === "jpeg") && (
          <Button
            variant="link"
            onClick={() => {
              this.props.toggleFileViewer();
            }}
          >
            <FilmIcon />
            <span> Open Image Viewer</span>
          </Button>
        )}   
      </>
    );
  };

  
  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default FileDetailView;
