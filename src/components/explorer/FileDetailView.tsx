import React, { Fragment } from "react";
import { Button, Label, Text } from "@patternfly/react-core";
import { ErrorBoundary } from "react-error-boundary";
import { ExpandIcon, FilmIcon, InfoCircleIcon } from "@patternfly/react-icons";
import {
  getFileExtension,
  IUITreeNode,
} from "../../api/models/file-explorer.model";
import { Skeleton } from "@patternfly/react-core";
import { IFileBlob } from "../../api/models/file-viewer.model";
import { fileViewerMap } from "../../api/models/file-viewer.model";
import { isEqual } from "lodash";

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
      if (!!result) {
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
          this._isMounted &&
            this.setState({
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
        return (
          <Skeleton
            shape="square"
            width="50%"
            screenreaderText="Loading File Preview"
          />
        );
      } else {
        let viewerName = "";
        const filesize = 1000000;
        if (this.state.blob && this.state.blob.size > filesize) {
          viewerName = "CatchallDisplay";
        } else if (!fileViewerMap[this.state.fileType]) {
          viewerName = "IframeDisplay";
        } else {
          viewerName = fileViewerMap[this.state.fileType];
        }

        return (
          <Fragment>
            {this.renderHeader()}
            <React.Suspense
              fallback={
                <Skeleton
                  shape="square"
                  width="50%"
                  screenreaderText="Fallback component being lodaded"
                />
              }
            >
              <ErrorBoundary
                fallback={
                  <span>
                    <Label icon={<InfoCircleIcon />} color="red" href="#filled">
                      <Text component="p">
                        Oh snap ! Looks like there was an error. Please refresh
                        the browser or try again.
                      </Text>
                    </Label>
                  </span>
                }
              >
                <div className="preview">
                  <ViewerDisplayComponent
                    tag={viewerName}
                    fileItem={this.state}
                  />
                </div>
              </ErrorBoundary>
            </React.Suspense>
          </Fragment>
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
        <h1>
          <b>{selectedFile.module}</b>
        </h1>
        {this.renderDownloadButton()}
      </div>
    );
  }

  // Description: Fetch blob and read it into state to display preview

  renderDownloadButton = () => {
    const { fullScreenMode } = this.props;

    return (
      <div className="header-panel__buttons">
        {fullScreenMode === true && (
          <Button
            variant="link"
            onClick={() => {
              this.props.toggleFileBrowser();
            }}
            icon={<ExpandIcon />}
          >
            Maximize
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
            icon={<FilmIcon />}
          >
             Open Image Viewer
          </Button>
        )}
      </div>
    );
  };

  
  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default FileDetailView;
