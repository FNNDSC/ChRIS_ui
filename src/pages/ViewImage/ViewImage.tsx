import React from "react";
import GalleryDicomView from "../../components/dicomViewer/GalleryDicomView";

import "./ViewImage.scss";

const GalleryPage = () => {
  return (
    <div className="gallery">
      <GalleryDicomView />
    </div>
  );
};
export default GalleryPage;
