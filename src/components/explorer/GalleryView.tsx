import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { initializeGallery, destroyGallery, resetGalleryItems, setGalleryItemsBlobs, setGalleryActiveItem } from "../../store/gallery/actions";
import { getFileExtension, IUITreeNode } from "../../api/models/file-explorer.model";
import { IFileBlob } from "../../api/models/file-viewer.model";
import FeedFileModel from "../../api/models/feed-file.model";
import FileViewerModel, { fileViewerMap } from "../../api/models/file-viewer.model";
import GalleryWrapper from "../gallery/GalleryWrapper";
import ViewerDisplay from "./displays/ViewerDisplay";
import { LoadingComponent } from "..";
import GalleryModel, { IGalleryItem } from "../../api/models/gallery.model";
import _ from "lodash";
import "./file-detail.scss";
import { IGalleryState } from "../../store/gallery/types";

interface IPropsFromDispatch {
  initializeGallery: typeof initializeGallery;
  setGalleryItemsBlobs: typeof setGalleryItemsBlobs;
  setGalleryActiveItem: typeof setGalleryActiveItem;
  destroyGallery: typeof destroyGallery;
}
type AllProps = {
  selectedFile: IUITreeNode;
  selectedFolder: IUITreeNode;
  // explorer: IUITreeNode;
  // selectedIndex: number;
} & IGalleryState & IPropsFromDispatch;

class GalleryView extends React.Component<AllProps> {
  _isMounted = false;
  constructor(props: AllProps) {
    super(props);
    console.log(props);
    const { selectedFile, selectedFolder, initializeGallery } = this.props;
    initializeGallery({ selectedFile, selectedFolder }); // SETS THE INITIAL GALLERY ITEMS AND ACTIVE ITEM
    // setGalleryItemsBlobs(); //TBD ***** NEEDS TO BE COMPLETED
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
  handleOnchange(action: string) {
    const { galleryItem, galleryItems, setGalleryActiveItem } = this.props;
    console.log(action);
    setGalleryActiveItem(galleryItems[0]); // TBD ***** NEEDS TO BE COMPLETED *****
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.props.destroyGallery();
  }
}


const mapDispatchToProps = (dispatch: Dispatch) => ({
  initializeGallery: (data: { selectedFile: IUITreeNode; selectedFolder: IUITreeNode; }) => dispatch(initializeGallery(data)),
  setGalleryActiveItem: (galleryItem: IGalleryItem) => dispatch(setGalleryActiveItem(galleryItem)),
  setGalleryItemsBlobs: (galleryItems: IGalleryItem[]) => dispatch(setGalleryItemsBlobs(galleryItems)),
  destroyGallery: () => dispatch(destroyGallery()),
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
