import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { initializeGallery, destroyGallery, setGalleryActiveItemSuccess } from "../../store/gallery/actions";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import { IFileBlob } from "../../api/models/file-viewer.model";
import FeedFileModel from "../../api/models/feed-file.model";
import FileViewerModel, { fileViewerMap } from "../../api/models/file-viewer.model";
import GalleryWrapper from "../gallery/GalleryWrapper";
import ViewerDisplay from "./displays/ViewerDisplay";
import { LoadingComponent } from "..";
import GalleryModel, { IGalleryItem, galleryActions } from "../../api/models/gallery.model";
import _ from "lodash";
import "./file-detail.scss";
import { IGalleryState } from "../../store/gallery/types";

interface IPropsFromDispatch {
  initializeGallery: typeof initializeGallery;
  setGalleryActiveItemSuccess: typeof setGalleryActiveItemSuccess;
  destroyGallery: typeof destroyGallery;
}
type AllProps = {
  selectedFile: IUITreeNode;
  selectedFolder: IUITreeNode;
} & IGalleryState & IPropsFromDispatch;

class GalleryView extends React.Component<AllProps> {
  _isMounted = false;
  constructor(props: AllProps) {
    super(props);
    const { selectedFile, selectedFolder, initializeGallery } = this.props;
    initializeGallery({ selectedFile, selectedFolder });
    this.handleOnchange = this.handleOnchange.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  render() {
    const { galleryItem, galleryItems } = this.props;
    // IF DIFFERENT FILE UPDATE GALLERY ITEM
    return (
      (!!galleryItem && !!galleryItem.blob) ? this.renderContent(galleryItem, galleryItems) : <LoadingComponent />
    )
  }

  // Decription: Render the individual viewers by filetype
  renderContent(galleryItem: IGalleryItem, galleryItems: IGalleryItem[]) {
    const viewerName = !!galleryItem.fileType ? fileViewerMap[galleryItem.fileType] : "";
    return (
     <GalleryWrapper
        index={galleryItem.index}
        total={galleryItems.length}
        onChange={this.handleOnchange}>
        <ViewerDisplay tag={viewerName} file={galleryItem} />
      </GalleryWrapper>)
  }

  // Description: change the gallery item state
  // WORKING NEED TO HANDLE LIMITS ***** tbd
  handleOnchange(action: string) {
    const {galleryItem, galleryItems, setGalleryActiveItemSuccess } = this.props;
    if (!!galleryItem) {
      const i = galleryItem.index;
      const newIndex = (action === galleryActions.next && (i + 1 < galleryItems.length)) ? (i + 1) :
      (action === galleryActions.previous && i > 0) ? (i - 1) : 0;
      setGalleryActiveItemSuccess(galleryItems[newIndex]); // TBD ***** NEEDS TO BE COMPLETED *****
    }
  }

  componentWillUnmount() {
    console.log("componentWillUnmount");
    this._isMounted = false;
    this.props.destroyGallery();
  }
}


const mapDispatchToProps = (dispatch: Dispatch) => ({
  initializeGallery: (data: { selectedFile: IUITreeNode; selectedFolder: IUITreeNode; }) => dispatch(initializeGallery(data)),
  setGalleryActiveItemSuccess: (galleryItem: IGalleryItem) => dispatch(setGalleryActiveItemSuccess(galleryItem)),
  destroyGallery: () => dispatch(destroyGallery())
});

const mapStateToProps = ({ gallery }: ApplicationState) => ({
  galleryItem: gallery.galleryItem,
  galleryItems: gallery.galleryItems
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GalleryView);
// export default GalleryView;
