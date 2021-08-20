import React, { useState, useRef, useEffect, useCallback } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as dicomParser from "dicom-parser";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import Hammer from "hammerjs";
import { Progress, ProgressSize } from "@patternfly/react-core";

import GalleryModel from "../../api/models/gallery.model";
import { DataNode } from "../../store/explorer/types";
import { useTypedSelector } from "../../store/hooks";
import { isDicom, isNifti } from "./utils";

cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
const { Image } = cornerstone;

type ImageItem = {
  imageId: string;
  image: typeof Image;
};

cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    "Content-Type": "application/vnd.collection+json",
    Authorization: "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
  },
  method: "get",
  responseType: "arrayBuffer",
});
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

const GalleryDicomView = (props: { files?: DataNode[] }) => {
  const dicomImageRef = useRef(null);
  const selectedFiles = useTypedSelector(
    (state) => state.explorer.selectedFolder
  );
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState<ImageItem[]>([]);

  const displayImageFromFiles = useCallback((items: ImageItem[]) => {
    console.log("Items", items);
    const image = items[0].image;
    const imageId = items[0].imageId;
    const element = dicomImageRef.current;
    console.log("Element", element);
    cornerstone.enable(element);
    cornerstone.displayImage(element, image);
  }, []);

  const loadImagesIntoCornerstone = useCallback(async () => {
    const imageIds: string[] = [];
    const items: ImageItem[] = [];
    let count = 0;
    let step = 0;

    if (selectedFiles && selectedFiles.length > 0) {
      step = selectedFiles.length / 50;
      let nextProgress = step;
      for (let i = 0; i < selectedFiles?.length; i++) {
        const selectedFile = selectedFiles[i].file;
        if (selectedFile) {
          const fname = selectedFile.data.fname;

          if (GalleryModel.isValidDcmFile(fname)) {
            console.log("Fname", fname);
            if (isNifti(fname)) {
              const fileArray = fname.split("/");
              const fileName = fileArray[fileArray.length - 1];
              const imageIdObject = ImageId.fromURL(
                `nifti:${selectedFile.url}${fileName}`
              );
              const numberOfSlices = cornerstone.metaData.get(
                "multiFrameModule",
                imageIdObject.url
              ).numberOfFrames;
              imageIds.push(
                ...Array.from(
                  Array(numberOfSlices),
                  (_, i) =>
                    `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`
                )
              );
            } else if (isDicom(fname)) {
              const file = await selectedFile.getFileBlob();
              imageIds.push(
                cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
              );
            } else {
              const file = await selectedFile.getFileBlob();
              imageIds.push(cornerstoneFileImageLoader.fileManager.add(file));
            }
          }
        }
      }

      for (let i = 0; i < imageIds.length; i++) {
        cornerstone.loadImage(imageIds[i]).then((image: any) => {
          let item: ImageItem = {} as ImageItem;
          item = {
            imageId: imageIds[i],
            image: image,
          };
          items.push(item);
          count++;
          const progress = Math.floor(count * (100 / selectedFiles.length));

          if (progress > nextProgress) {
            nextProgress += step;
            setProgress(progress);
          }
          if (count === imageIds.length) {
            //setItems(items);
            displayImageFromFiles(items);
          }
        });
      }
    }
  }, [selectedFiles, displayImageFromFiles]);

  console.log("State", progress, items);

  useEffect(() => {
    loadImagesIntoCornerstone();
  }, [loadImagesIntoCornerstone]);

  const styleDicomImage = {
    width: "100%",
    height: "100%",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        color: "#fff",
        fontSize: "1rem",
        textShadow: "1px 1px #000000",
      }}
      className="cornerstone-enabled-image"
    >
      <Progress value={progress} size={ProgressSize.sm} />
      <div style={styleDicomImage} ref={dicomImageRef}></div>
    </div>
  );
};

export default GalleryDicomView;
