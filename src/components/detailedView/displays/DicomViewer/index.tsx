import React, { useState } from "react";
import { FeedFile } from "@fnndsc/chrisapi";
import * as dicomParser from "dicom-parser";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import { useTypedSelector } from "../../../../store/hooks";
import { isDicom, isNifti, dumpDataSet, initDicom } from "./utils";
import { SpinContainer } from "../../../common/loading/LoadingContent";
import { getFileExtension } from "../../../../api/models/file-explorer.model";
import GalleryModel from "../../../../api/models/gallery.model";
import {
  GalleryButtonContainer,
  ButtonContainer,
  TagInfoModal,
} from "./utils/helpers";

const { ImageId } = initDicom();

const DicomViewerContainer = () => {
  const selectedFolder = useTypedSelector(
    (state) => state.explorer.selectedFolder
  );
  const [filteredFiles, setFilteredFiles] = useState<FeedFile[]>([]);
  const [loader, setLoader] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [output, setOutput] = useState("");
  const [frames, setFrames] = useState(0);
  const [currentImage, setCurrentImage] = useState<number | undefined>(1);
  const [showTagInfo, setTagInfo] = useState(false);
  const [gallery, setGallery] = useState(false);
  const dicomImageRef = React.useRef<HTMLDivElement>(null);

  const loadImage = async (id: string) => {
    const image = await cornerstone.loadAndCacheImage(id).then((image: any) => {
      return image;
    });
    return image;
  };

  const displayImageFromFiles = React.useCallback(async (files: any[]) => {
    if (files) {
      const imageIds = [];
      const images: any[] = [];
      setLoader(true);
      let niftiSlices = 0;
      const fileTypes = ["jpeg", "jpg", "png"];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (isNifti(file.data.fname)) {
          const fileArray = file.data.fname.split("/");
          const fileName = fileArray[fileArray.length - 1];
          const imageIdObject = ImageId.fromURL(`nifti:${file.url}${fileName}`);
          niftiSlices = cornerstone.metaData.get(
            "multiFrameModule",
            imageIdObject.url
          ).numberOfFrames;

          imageIds.push(
            ...Array.from(
              Array(niftiSlices),
              (_, i) =>
                `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`
            )
          );

          const image = await loadImage(imageIdObject.url);
          images.push(image);
        } else if (isDicom(file.data.fname)) {
          const blob = await file.getFileBlob();
          const imageId =
            cornerstoneWADOImageLoader.wadouri.fileManager.add(blob);
          imageIds.push(imageId);
          const image = await loadImage(imageId);
          images.push(image);
        } else if (fileTypes.includes(getFileExtension(file.data.fname))) {
          const blob = await file.getFileBlob();
          const imageId = cornerstoneFileImageLoader.fileManager.add(blob);
          imageIds.push(imageId);
          const image = await loadImage(imageId);
          images.push(image);
        }
      }

      const element = dicomImageRef.current;
      if (element) cornerstone.enable(element);
      const stack = {
        currentImageIdIndex: 0,
        imageIds: imageIds,
      };

      cornerstone.displayImage(element, images[0]);
      cornerstoneTools.addStackStateManager(element, ["stack"]);
      cornerstoneTools.addToolState(element, "stack", stack);

      setImages(images);
      setLoader(false);

      if (dicomImageRef.current) {
        dicomImageRef.current.addEventListener(
          "cornerstonenewimage",
          (event: any) => {
            const imageIndex = images.findIndex((image) => {
              return image.imageId === event.detail.image.imageId;
            });
            if (imageIndex !== -1) {
              setCurrentImage(imageIndex + 1);
              setFrames(imageIndex);
            }
          }
        );
      }
    }
  }, []);

  React.useEffect(() => {
    if (selectedFolder) {
      const filteredFiles = selectedFolder.filter((file) => {
        return GalleryModel.isValidDcmFile(file.data.fname);
      });

      setFilteredFiles(filteredFiles);
      displayImageFromFiles(filteredFiles);
    }
  }, [displayImageFromFiles, selectedFolder]);

  const handleEvents = (event: string) => {
    if (event === "Zoom") {
      cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 1 });
    }

    if (event === "Pan") {
      cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
    }
    if (event === "Magnify") {
      cornerstoneTools.setToolActive("Magnify", { mouseButtonMask: 1 });
    }

    if (event === "Rotate") {
      cornerstoneTools.setToolActive("Rotate", { mouseButtonMask: 1 });
    }

    if (event === "Wwwc") {
      cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 });
    }

    if (event === "Reset View") {
      cornerstone.reset(dicomImageRef.current);
      setGallery(false);
    }

    if (event === "Length") {
      cornerstoneTools.setToolActive("Length", { mouseButtonMask: 1 });
    }

    if (event === "Gallery") {
      cornerstone.reset(dicomImageRef.current);
      setGallery(!gallery);
    }

    if (event === "TagInfo") {
      handleModalToggle();
    }
  };

  const handleModalToggle = () => {
    setTagInfo(!showTagInfo);
    displayTagInfo();
  };

  const displayTagInfo = async () => {
    if (filteredFiles) {
      const file = filteredFiles[frames];

      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          if (reader.result) {
            //@ts-ignore
            const byteArray = new Uint8Array(reader.result);
            //@ts-ignore
            const dataSet = dicomParser.parseDicom(byteArray);
            //@ts-ignore
            const output: any[] = [];
            dumpDataSet(dataSet, output);
            const newOutput = "<ul>" + output.join("") + "</ul>";
            setOutput(newOutput);
          }
        } catch (error) {
          console.log("Error", error);
        }
      };

      if (file) {
        const blob = await file.getFileBlob();
        reader.readAsArrayBuffer(blob);
      }
    }
  };

  const styleDiv = {
    position: "absolute",
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "768px",
          color: "#fff",
          position: "relative",
          fontSize: "1rem",
          textShadow: "1px 1px #000000",
        }}
        ref={dicomImageRef}
      >
        {loader ? (
          <SpinContainer title="Loading files into cornerstone" />
        ) : (
          <>
            <div id="dicomImageWebGL"></div>
            <div
              id="topleft"
              className="overlay"
              //@ts-ignore
              style={{
                ...styleDiv,
                top: "0px",
                left: "0px",
                display: "flex",
                flexDirection: "column",
                marginLeft: "0.5em",
              }}
            >
              <span>Image Number: {`${currentImage}/${images.length}`}</span>
              <span>
                Name:{" "}
                {`${
                  filteredFiles &&
                  filteredFiles[frames] &&
                  filteredFiles[frames].data.fname
                }`}
              </span>
            </div>
          </>
        )}
      </div>
      <div
        style={{
          marginTop: "1rem",
        }}
      >
        <ButtonContainer action="Zoom" handleEvents={handleEvents} />
        <ButtonContainer action="Pan" handleEvents={handleEvents} />
        <ButtonContainer action="Magnify" handleEvents={handleEvents} />
        <ButtonContainer action="Rotate" handleEvents={handleEvents} />
        <ButtonContainer action="Wwwc" handleEvents={handleEvents} />
        <ButtonContainer action="Reset View" handleEvents={handleEvents} />
        <ButtonContainer action="Length" handleEvents={handleEvents} />
        <ButtonContainer action="Gallery" handleEvents={handleEvents} />
        <ButtonContainer action="TagInfo" handleEvents={handleEvents} />
      </div>
      {gallery && (
        <div style={{ marginTop: "1rem" }}>
          <GalleryButtonContainer
            text="Next"
            handleClick={() => {
              if (frames < images.length - 1) {
                const newFrame = frames + 1;
                cornerstone.displayImage(
                  dicomImageRef.current,
                  images[newFrame]
                );

                setFrames(newFrame);
              }
            }}
          />

          <GalleryButtonContainer
            text="Previous"
            handleClick={() => {
              if (frames >= 0) {
                const newFrame = frames - 1;
                cornerstone.displayImage(
                  dicomImageRef.current,
                  images[newFrame]
                );

                setFrames(newFrame);
              }
            }}
          />

          <GalleryButtonContainer
            handleClick={() => {
              const frame = 0;
              setFrames(frame);
              cornerstone.displayImage(dicomImageRef.current, images[frame]);
            }}
            text=" First"
          />

          <GalleryButtonContainer
            handleClick={() => {
              const frame = images.length - 1;
              setFrames(frame);
              cornerstone.displayImage(dicomImageRef.current, images[frame]);
            }}
            text="Last"
          />

          <GalleryButtonContainer
            handleClick={() => {
              cornerstoneTools.playClip(dicomImageRef.current, 5);
            }}
            text="Play"
          />

          <GalleryButtonContainer
            handleClick={() => {
              cornerstoneTools.stopClip(dicomImageRef.current);
            }}
            text="Pause"
          />
        </div>
      )}
      <TagInfoModal
        handleModalToggle={handleModalToggle}
        isModalOpen={showTagInfo}
        output={output}
        file={filteredFiles && filteredFiles[frames]}
      />
    </>
  );
};

export default DicomViewerContainer;
