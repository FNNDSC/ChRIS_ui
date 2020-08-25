import * as React from "react";
import { Button } from "@patternfly/react-core";
import { CloseIcon } from "@patternfly/react-icons";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import GalleryModel from "../../api/models/gallery.model";
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
  urlArray: Blob[];
  sliceIndex: number;
  sliceMax: number;
  listOpenFilesScrolling: boolean;
}

class GalleryDicomView extends React.Component<AllProps, IState> {
  _isMounted = false;
  runTool: (toolName: string, opt?: any) => void;
  timerScrolling: any;

  constructor(props: AllProps) {
    super(props);
    this.state = {
      viewInfoPanel: true,
      urlArray: [],
      sliceIndex: 0,
      sliceMax: 1,
      listOpenFilesScrolling: false,
    };
    this.runTool = () => {};
    this.timerScrolling = null;
  }

  async componentDidMount() {
    this._isMounted = true;

    const urlArray = await this._getUrlArray(
      this.props.selectedFolder.children
    );

    if (urlArray.length > 0 && this._isMounted) {
      this.setState({
        urlArray,
        sliceMax: urlArray.length,
      });
    }
  }

  render() {
    return <React.Fragment>{this.renderContent()}</React.Fragment>;
  }

  // Description: Render the individual viewers by filetype
  renderContent() {
    const { selectedFolder } = this.props;
    const { listOpenFilesScrolling } = this.state;
    return (
      !!selectedFolder.children && (
        <GalleryWrapper
          index={this.state.sliceIndex}
          total={this.state.sliceIndex}
          hideDownload
          handleOnToolbarAction={(action: string) => {
            (this.handleGalleryActions as any)[action].call();
          }}
          listOpenFilesScrolling={listOpenFilesScrolling}
        >
          <Button
            className="close-btn"
            variant="link"
            onClick={() => this.props.toggleViewerMode(true)}
          >
            <CloseIcon size="md" />{" "}
          </Button>

          <DcmImageSeries
            runTool={(ref: any) => {
              return (this.runTool = ref.runTool);
            }}
            imageArray={this.state.urlArray}
            handleOnToolbarAction={(action: string) => {
              (this.handleGalleryActions as any)[action].call();
            }}
          />
        </GalleryWrapper>
      )
    );
  }

  // Only user dcm file - can add on to this
  async _getUrlArray(selectedFolder: IUITreeNode[] = []) {
    const files = selectedFolder.filter((item: IUITreeNode) => {
      return GalleryModel.isDicomFile(item.module);
    });
    const filesMap = await Promise.all(
      files.map(async (item: IUITreeNode) => await item.file.getFileBlob())
    );

    return filesMap;
    //
  }

  handleOpenImage = (index: number) => {
    this.runTool("openImage", index);
  };

  // Description: change the gallery item state

  handleGalleryActions = {
    next: () => {
      let index = this.state.sliceIndex;
      index = index === this.state.sliceMax - 1 ? 0 : index + 1;
      this.setState(
        {
          sliceIndex: index,
        },
        () => {
          this.handleOpenImage(index);
        }
      );
    },
    previous: () => {
      let index = this.state.sliceIndex;
      index = index === 0 ? this.state.sliceMax - 1 : index - 1;
      this.setState(
        {
          sliceIndex: index,
        },
        () => {
          this.handleOpenImage(index);
        }
      );
    },
    listOpenFilesScrolling: () => {
      const scrolling = this.state.listOpenFilesScrolling;
      this.setState(
        {
          listOpenFilesScrolling: !scrolling,
        },
        () => {
          if (scrolling) {
            if (this.timerScrolling) clearInterval(this.timerScrolling);
          } else {
            this.timerScrolling = setInterval(() => {
              this.handleGalleryActions["next"]();
            }, 100);
          }
        }
      );
    },

    first: () => {
      const index = 0;
      this.setState(
        {
          sliceIndex: index,
        },
        () => {
          this.handleOpenImage(index);
        }
      );
    },
    last: () => {
      let index = this.state.sliceMax - 1;
      this.setState({ sliceIndex: index }, () => {
        this.handleOpenImage(index);
      });
    },
    information: () => {
      this._isMounted &&
        this.setState({
          viewInfoPanel: !this.state.viewInfoPanel,
        });
    },
  };

  componentWillUnmount() {
    clearInterval(this.timerScrolling);
    this._isMounted = false;
  }
}
export default GalleryDicomView;
