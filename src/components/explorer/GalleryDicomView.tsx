import * as React from "react";
import { Button } from "@patternfly/react-core";
import { CloseIcon } from "@patternfly/react-icons";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import GalleryModel, { galleryActions } from "../../api/models/gallery.model";
import GalleryWrapper from "../gallery/GalleryWrapper";
import DcmImageSeries from "../dicomViewer/DcmImageSeries";
import "./file-detail.scss";

type AllProps = {
  selectedFile: IUITreeNode;
  selectedFolder: IUITreeNode;
  toggleViewerMode: (isViewerMode: boolean) => void;
};
interface IState {
  viewInfoPanel: boolean;
  urlArray: string[];
  totalFiles: number;
  totalParsed: number;
  currentIndex: number;
}

class GalleryDicomView extends React.Component<AllProps, IState> {
  _isMounted = false;
  constructor(props: AllProps) {
    super(props);
    const urlArray = this._getUrlArray(this.props.selectedFolder.children),
      currentIndex = GalleryModel.getArrayItemIndex(
        props.selectedFile.file.file_resource,
        urlArray
      );
    this.state = {
      viewInfoPanel: true,
      urlArray,
      currentIndex,
      totalFiles: urlArray.length,
      totalParsed: 0
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  render() {
    return <React.Fragment>{this.renderContent()}</React.Fragment>;
  }

  // Decription: Render the individual viewers by filetype
  renderContent() {
    const { selectedFolder } = this.props;
    return (
      !!selectedFolder.children && (
        <GalleryWrapper
          index={this.state.currentIndex}
          total={this.state.totalFiles}
          hideDownload
          handleOnToolbarAction={(action: string) => {
            (this.handleGalleryActions as any)[action].call();
          }}
        >
          <Button
            className="close-btn"
            variant="link"
            onClick={() => this.props.toggleViewerMode(true)}
          >
            <CloseIcon size="md" />{" "}
          </Button>
          <DcmImageSeries
            imageArray={this.state.urlArray}
            currentIndex={this.state.currentIndex}
            viewInfoPanel={this.state.viewInfoPanel}
          />
        </GalleryWrapper>
      )
    );
  }

  // Only user dcm file - can add on to this
  _getUrlArray(selectedFolder: IUITreeNode[] = []): string[] {
    return selectedFolder
      .filter((item: IUITreeNode) => {
        return GalleryModel.isDicomFile(item.module);
      })
      .map((item: IUITreeNode) => {
        const file_resource = `${item.file.url}/${item.module}`; //Temporary hack
        return file_resource;
      });
  }

  // Description: change the gallery item state
  _playInterval: any = undefined;
  handleGalleryActions = {
    next: () => {
      const i = this.state.currentIndex;
      this._isMounted &&
        this.setState({
          currentIndex: i + 1 < this.state.urlArray.length ? i + 1 : 0
        });
    },
    previous: () => {
      const i = this.state.currentIndex;
      this._isMounted &&
        this.setState({
          currentIndex: i > 0 ? i - 1 : 0
        });
    },
    play: () => {
      this._playInterval = setInterval(() => {
        (this.handleGalleryActions as any)[galleryActions.next].call();
      }, 200);
    },
    pause: () => {
      clearInterval(this._playInterval);
    },
    information: () => {
      this._isMounted &&
        this.setState({
          viewInfoPanel: !this.state.viewInfoPanel
        });
    }
  };

  componentWillUnmount() {
    clearInterval(this._playInterval);
    this._isMounted = false;
  }
}
export default GalleryDicomView;
