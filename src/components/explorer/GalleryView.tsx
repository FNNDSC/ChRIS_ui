import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { Alert, Button } from "@patternfly/react-core";
import { CloseIcon } from "@patternfly/react-icons";
import {
  initializeGallery,
  destroyGallery,
  setGalleryActiveItemSuccess,
} from "../../store/gallery/actions";
import { IGalleryState } from "../../store/gallery/types";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import FileViewerModel, {
  fileViewerMap,
} from "../../api/models/file-viewer.model";
import GalleryModel, {
  IGalleryItem,
  galleryActions,
} from "../../api/models/gallery.model";
import { LoadingSpinner } from "..";
import GalleryWrapper from "../gallery/GalleryWrapper";
import ViewerDisplay from "./displays/ViewerDisplay";
import GalleryInfoPanel from "../gallery/GalleryInfoPanel/GalleryInfoPanel";
import GalleryDicomView from "../explorer/GalleryDicomView";
import _ from "lodash";
import "./file-detail.scss";

interface IPropsFromDispatch {
  initializeGallery: typeof initializeGallery;
  setGalleryActiveItemSuccess: typeof setGalleryActiveItemSuccess;
  destroyGallery: typeof destroyGallery;
  toggleViewerMode: (isViewerMode: boolean) => void;
}
type AllProps = {
  selectedFile: IUITreeNode;
  selectedFolder: IUITreeNode;
} & IGalleryState &
  IPropsFromDispatch;

class GalleryView extends React.Component<
  AllProps,
  { viewInfoPanel: boolean }
> {
  constructor(props: AllProps) {
    super(props);
    this._initGallery();
  }
  state = {
    viewInfoPanel: true,
  };
  // Description: Initialize galleryitems call only if folder is different and gallery was not init before; else use preloaded data
  _initGallery() {
    const {
      selectedFile,
      selectedFolder,
      initializeGallery,
      galleryItem,
      galleryItems,
      destroyGallery,
      setGalleryActiveItemSuccess,
    } = this.props;

    const index = GalleryModel.getGalleryItemIndex(
      selectedFile.uiId,
      galleryItems
    );
    if (index < 0 || !!!galleryItem) {
      galleryItems.length > 0 && destroyGallery();
      initializeGallery({ selectedFile, selectedFolder });
    } else if (selectedFile.uiId !== galleryItem.uiId) {
      setGalleryActiveItemSuccess(galleryItems[index]);
    }
  }

  render() {
    return this.renderContent();
  }

  // Decription: Render the individual viewers by filetype
  renderContent() {
    const { galleryItem, galleryItems } = this.props;

    const viewerName =
      !!galleryItem && !!galleryItem.fileType
        ? fileViewerMap[galleryItem.fileType]
        : "";
    return viewerName.length && viewerName === "DcmDisplay" ? (
      <GalleryDicomView
        selectedFile={this.props.selectedFile}
        selectedFolder={this.props.selectedFolder}
        toggleViewerMode={this.props.toggleViewerMode}
      />
    ) : (
      <GalleryWrapper
        index={!!galleryItem ? galleryItem.index : 0}
        total={galleryItems.length || 0}
        handleOnToolbarAction={(action: string) => {
          (this.handleGalleryActions as any)[action].call();
        }}
      >
        <Button
          className="close-btn"
          variant="link"
          onClick={() => this.props.toggleViewerMode(true)}
        >
          <CloseIcon size="md" />
        </Button>
        {this.state.viewInfoPanel && (
          <GalleryInfoPanel galleryItem={galleryItem} />
        )}
        {!!galleryItem && !!galleryItem.blob ? (
          <ViewerDisplay
            tag={viewerName}
            galleryItem={galleryItem}
            galleryItems={galleryItems}
          />
        ) : !!galleryItem && !!galleryItem.error ? (
          <Alert
            variant="danger"
            title="There was an error loading this file"
            className="empty"
          />
        ) : (
          <LoadingSpinner color="#fff" />
        )}
      </GalleryWrapper>
    );
  }

  // Description: change the gallery item state
  // WORKING NEED TO HANDLE LIMITS ***** tbd
  _playInterval: any = undefined;
  handleGalleryActions = {
    next: () => {
      const {
        galleryItem,
        galleryItems,
        setGalleryActiveItemSuccess,
      } = this.props;
      if (!!galleryItem) {
        const i = galleryItem.index,
          newIndex = i + 1 < galleryItems.length ? i + 1 : 0;
        !_.isEqual(galleryItem, galleryItems[newIndex]) &&
          setGalleryActiveItemSuccess(galleryItems[newIndex]);
      }
    },
    previous: () => {
      const {
        galleryItem,
        galleryItems,
        setGalleryActiveItemSuccess,
      } = this.props;
      if (!!galleryItem) {
        const i = galleryItem.index,
          newIndex = i > 0 ? i - 1 : 0;
        !_.isEqual(galleryItem, galleryItems[newIndex]) &&
          setGalleryActiveItemSuccess(galleryItems[newIndex]);
      }
    },
    play: () => {
      this._playInterval = setInterval(() => {
        (this.handleGalleryActions as any)[galleryActions.next].call();
      }, 200);
    },
    pause: () => {
      clearInterval(this._playInterval);
    },
    download: () => {
      const { galleryItem } = this.props;
      !!galleryItem &&
        FileViewerModel.downloadFile(galleryItem.blob, galleryItem.fileName);
    },
    information: () => {
      //const visible = this.state.viewInfoPanel;
      this.setState({
        viewInfoPanel: !this.state.viewInfoPanel,
      });
    },
  };

  componentWillUnmount() {
    clearInterval(this._playInterval);
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  initializeGallery: (data: {
    selectedFile: IUITreeNode;
    selectedFolder: IUITreeNode;
  }) => dispatch(initializeGallery(data)),
  setGalleryActiveItemSuccess: (galleryItem: IGalleryItem) =>
    dispatch(setGalleryActiveItemSuccess(galleryItem)),
  destroyGallery: () => dispatch(destroyGallery()),
});

const mapStateToProps = ({ gallery }: ApplicationState) => ({
  galleryItem: gallery.galleryItem,
  galleryItems: gallery.galleryItems,
});

export default connect(mapStateToProps, mapDispatchToProps)(GalleryView);
