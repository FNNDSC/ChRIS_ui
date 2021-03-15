import React from "react";
import { Button, Backdrop, Bullseye, Spinner } from "@patternfly/react-core";
import { CloseIcon } from "@patternfly/react-icons";
const DcmImageSeries = React.lazy(
  () => import("../dicomViewer/DcmImageSeries")
);
import { DataNode } from "../../store/explorer/types";
import { useTypedSelector } from "../../store/hooks";
import { FeedFile } from "@fnndsc/chrisapi";
import GalleryModel from "../../api/models/gallery.model";

type AllProps = {
  selectedFile: DataNode;
  toggleViewerMode: (isViewerMode: boolean) => void;
};

type GalleryState = {
  urlArray: FeedFile[];
  inPlay: boolean;
};

function getInitialState() {
  return {
    urlArray: [],
    inPlay: false,
  };
}

const GalleryDicomView = () => {
  const { selectedPlugin, pluginFiles } = useTypedSelector(
    (state) => state.feed
  );

  const [
    galleryDicomState,
    setGalleryDicomState,
  ] = React.useState<GalleryState>(getInitialState);
  const files = selectedPlugin && pluginFiles[selectedPlugin.data.id].files;
  const { urlArray, inPlay } = galleryDicomState;
  console.log("URL ARRAY", urlArray);

  React.useEffect(() => {
    if (files && files.length > 0) {
      const urlArray = getUrlArray(files);
      setGalleryDicomState((state) => {
        return {
          ...state,
          urlArray,
        };
      });
    }
  }, [files]);

  return (
    <div>
      <h1>Hey There</h1>
    </div>
  );
};

const getUrlArray = (feedFiles: FeedFile[]) => {
  const files = feedFiles.filter((item: FeedFile) => {
    return GalleryModel.isValidFile(item.data.fname);
  });
  return files;
};

export default GalleryDicomView;
