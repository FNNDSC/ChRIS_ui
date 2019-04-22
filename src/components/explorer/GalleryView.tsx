import * as React from "react";
import { getFileExtension, IUITreeNode } from "../../api/models/file-explorer.model";
import { IFileBlob } from "../../api/models/file-viewer.model";
import FeedFileModel from "../../api/models/feed-file.model";
import { downloadFile, fileViewerMap } from "../../api/models/file-viewer.model";
import GalleryWrapper from "../gallery/GalleryWrapper";
import ViewerDisplay from "./displays/ViewerDisplay";
import { LoadingComponent } from "..";
import GalleryModel, { IGalleryItem } from "../../api/models/gallery.model";
import _ from "lodash";
import "./file-detail.scss";

type AllProps = {
  selectedFile: IUITreeNode;
  explorer: IUITreeNode;
};
interface IState {
  galleryItem: IGalleryItem;
  galleryItems: IGalleryItem[];
  
}
class GalleryView extends React.Component<AllProps, IState> {
  _isMounted = false;
  constructor(props: AllProps) {
    super(props);
    const { selectedFile, explorer } = this.props;
    const gallery = new GalleryModel(selectedFile, explorer);
    console.log(gallery);
    this.state = {
      galleryItem: gallery.galleryItem,
      galleryItems: gallery.galleryItems
    }
    console.log("constructor", this.state);
    // 1. Onload => build gallery item and galleryItems[]
    //      - What should it have
    // 2. begin loop at gallery Item
    // 3. Render GalleryItem
  }
  // shouldComponentUpdate(nextProps: any, nextState: any) {
  //   console.log("shouldComponentUpdate", this.state.galleryItem, nextState);
  //   return true;
  // }
    componentDidMount() {
    this._isMounted = true;
  }

  render() {
    console.log("RENDER", this.state.galleryItem.isLoaded,  this.state.galleryItems.length);
    return (
      (!!this.state.galleryItem && this.state.galleryItem.isLoaded) ? this.renderContent(this.state.galleryItem) : <LoadingComponent />
    )
  }

  // Decription: Render the individual viewers by filetype
  renderContent(galleryItem: IGalleryItem) {
    const viewerName = !!galleryItem.fileType ? fileViewerMap[galleryItem.fileType] : "";
    return (
      <GalleryWrapper index={0} total={100}>
        <ViewerDisplay tag={viewerName} file={galleryItem} />
      </GalleryWrapper>)
  }



  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default GalleryView;
