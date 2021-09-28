import React from "react";
import GalleryDicomView from "../../components/dicomViewer/GalleryDicomView";
import XtkViewer from "../../components/detailedView/displays/XtkViewer/XtkViewer";
import "./ViewImage.scss";

const GalleryPage = () => {
  return (
    <div className="gallery">
      <GalleryDicomView />
    </div>
  );
};
export default GalleryPage;
