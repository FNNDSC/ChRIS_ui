import React, { useState } from "react";
import { FeedFile } from "@fnndsc/chrisapi";

import * as dicomParser from "dicom-parser";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import { useTypedSelector } from "../../../../store/hooks";
import { isDicom, isNifti, dumpDataSet, initDicom, removeTool } from "./utils";
import { SpinContainer } from "../../../common/loading/LoadingContent";
import { getFileExtension } from "../../../../api/models/file-explorer.model";
import GalleryModel from "../../../../api/models/gallery.model";
import { GalleryButtonContainer, TagInfoModal } from "./utils/helpers";

const { ImageId } = initDicom();
const { Image } = cornerstone;

type ImageType = typeof Image;

type DicomState = {
  filteredFiles: FeedFile[];
  images: ImageType[];
  frames: number;
  output: any[];
  showTagInfo: boolean;
  gallery: boolean;
  currentImage: number;
  loader: boolean;
  imageDictionary: {
    [key: string]: number;
  };
};

const getInitialState = () => {
  return {
    filteredFiles: [] as FeedFile[],
    images: [] as ImageType[],
    frames: 0,
    output: [],
    showTagInfo: false,
    gallery: false,
    currentImage: 1,
    loader: false,
    imageDictionary: {},
  };
};

const DicomViewerContainer = (props: {
  action: {
    [key: string]: boolean;
  };
  handleTagInfoState: () => void;
}) => {
  const { selectedFolder, selectedFile } = useTypedSelector(
    (state) => state.explorer
  );

  const [dicomState, setDicomState] = useState<DicomState>(getInitialState());
  const {
    filteredFiles,
    images,
    frames,
    output,
    showTagInfo,
    gallery,
    currentImage,
    loader,
    imageDictionary,
  } = dicomState;

  const handleEventState = (event: string, value: boolean) => {
    if (value === true) {
      cornerstoneTools.setToolActive(event, { mouseButtonMask: 1 });
    } else {
      cornerstoneTools.setToolPassive(event);
    }
  };

  const displayTagInfo = React.useCallback(async () => {
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
            const testOutput: any[] = [];
            dumpDataSet(dataSet, output, testOutput);
            const merged = Object.assign({}, ...testOutput);
            setDicomState((dicomState) => {
              return {
                ...dicomState,
                output: merged,
              };
            });
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
  }, [filteredFiles, frames]);

  const handleModalToggle = React.useCallback(
    async (value: boolean) => {
      setDicomState((dicomState) => {
        return {
          ...dicomState,
          showTagInfo: value,
        };
      });

      if (!value) {
        props.handleTagInfoState();
      }

      if (!showTagInfo) {
        await displayTagInfo();
      }
    },
    [displayTagInfo, props, showTagInfo]
  );

  const handleEvents = React.useCallback(
    (event: string, value: boolean) => {
      if (event === "Zoom") {
        handleEventState(event, value);
      }

      if (event === "Pan") {
        handleEventState(event, value);
      }
      if (event === "Magnify") {
        handleEventState(event, value);
      }

      if (event === "Rotate") {
        handleEventState(event, value);
      }

      if (event === "Wwwc") {
        handleEventState(event, value);
      }

      if (event === "Reset View") {
        cornerstone.reset(dicomImageRef.current);
        setDicomState((dicomState) => {
          return {
            ...dicomState,
            gallery: false,
          };
        });
      }

      if (event === "Length") {
        handleEventState(event, value);
      }

      if (event === "Gallery") {
        cornerstone.reset(dicomImageRef.current);
        setDicomState((dicomState) => {
          return {
            ...dicomState,
            gallery: value,
          };
        });
      }

      if (event === "TagInfo") {
        handleModalToggle(value);
      }
    },
    [handleModalToggle]
  );

  React.useEffect(() => {
    if (props.action) {
      const event = Object.keys(props.action)[0];
      handleEvents(event, props.action[event]);
    }
  }, [props.action, handleEvents]);

  const dicomImageRef = React.useRef<HTMLDivElement>(null);

  const loadImage = async (id: string) => {
    const image = await cornerstone.loadAndCacheImage(id).then((image: any) => {
      return image;
    });
    return image;
  };

  const displayImageFromFiles = React.useCallback(
    async (files: any[]) => {
      if (files) {
        const imageIds = [];
        const imagesToDisplay: any[] = [];
        const imageDict: {
          [key: string]: number;
        } = {};
        let selected = 0;
        setDicomState((dicomState) => {
          return {
            ...dicomState,
            loader: true,
          };
        });

        let niftiSlices = 0;
        const fileTypes = ["jpeg", "jpg", "png"];

        try {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isSelected = file.data.fname === selectedFile?.data.fname;
            if (isSelected) {
              selected = i;
            }
            if (isNifti(file.data.fname)) {
              const fileArray = file.data.fname.split("/");
              const fileName = fileArray[fileArray.length - 1];
              const imageIdObject = ImageId.fromURL(
                `nifti:${file.url}${fileName}`
              );
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
              imagesToDisplay.push(image);
              imageDict[imageIdObject] = i;
            } else if (isDicom(file.data.fname)) {
              const blob = await file.getFileBlob();
              const imageId =
                cornerstoneWADOImageLoader.wadouri.fileManager.add(blob);
              imageIds.push(imageId);
              const image = await loadImage(imageId);
              imagesToDisplay.push(image);
              imageDict[imageId] = i;
            } else if (fileTypes.includes(getFileExtension(file.data.fname))) {
              const blob = await file.getFileBlob();
              const imageId = cornerstoneFileImageLoader.fileManager.add(blob);
              imageIds.push(imageId);
              const image = await loadImage(imageId);
              imagesToDisplay.push(image);
              imageDict[imageId] = i;
            }
          }

          const element = dicomImageRef.current;
          if (element) {
            cornerstone.enable(element);

            const stack = {
              currentImageIdIndex: selected,
              imageIds: imageIds,
            };

            cornerstone.displayImage(element, imagesToDisplay[selected]);
            cornerstoneTools.addStackStateManager(element, ["stack"]);
            cornerstoneTools.addToolState(element, "stack", stack);

            setDicomState((dicomState) => {
              return {
                ...dicomState,
                images: imagesToDisplay,
                imageDictionary: imageDict,
                currentImage: selected + 1,
                frames: selected,
                loader: false,
              };
            });
          }

          fireEvent();
        } catch (error) {}
      }
    },
    [selectedFile]
  );

  const firePlayEvent = () => {
    if (dicomImageRef.current) {
      dicomImageRef.current.addEventListener(
        "cornerstonenewimage",
        (event: any) => {
          const imageIndex = imageDictionary[event.detail.image.imageId];
          setDicomState((dicomState) => {
            return {
              ...dicomState,
              currentImage: imageIndex + 1,
              frames: imageIndex,
            };
          });
        }
      );
    }
  };

  const removePlayEvent = () => {
    if (dicomImageRef.current) {
      dicomImageRef.current.removeEventListener("cornerstonenewimage", () => {
        console.log("Removed");
      });
    }
  };

  const fireEvent = () => {
    if (dicomImageRef.current) {
      dicomImageRef.current.addEventListener(
        "cornerstonetoolsstackscroll",
        (event: any) => {
          setDicomState((dicomState) => {
            return {
              ...dicomState,
              currentImage: event.detail.newImageIdIndex + 1,
              frames: event.detail.newImageIdIndex,
            };
          });
        }
      );
    }
  };

  React.useEffect(() => {
    if (selectedFolder) {
      const filteredFilesState = selectedFolder.filter((file) => {
        return GalleryModel.isValidDcmFile(file.data.fname);
      });

      setDicomState((dicomState) => {
        return {
          ...dicomState,
          filteredFiles: filteredFilesState,
        };
      });

      displayImageFromFiles(filteredFilesState);
    }
  }, [displayImageFromFiles, selectedFolder]);

  React.useEffect(() => {
    return () => {
      removeTool();
    };
  }, []);

  const styleDiv = {
    position: "absolute",
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
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
                color: "#73bcf7",
                marginTop: "0.5em",
              }}
            >
              <span>
                <b>Image Number:</b> {currentImage}/{images.length}
              </span>
              <span>
                <b>
                  {images && images[frames] && (
                    <b>
                      Image Dimensions: {images[frames].width} x{" "}
                      {images[frames].height}{" "}
                    </b>
                  )}
                </b>
              </span>
            </div>
            {images &&
              images[frames] &&
              images[frames].imageId.startsWith("dicomfile") && (
                <div
                  id="topRight"
                  className="overlay"
                  //@ts-ignore
                  style={{
                    ...styleDiv,
                    top: "0px",
                    right: "0px",
                    display: "flex",
                    flexDirection: "column",
                    marginRight: "1em",
                    marginTop: "0.5em",
                    color: "#73bcf7",
                  }}
                >
                  <span>
                    <b>Modality: </b>
                    {images[frames].data.string("x00080060")}
                  </span>
                  <span>
                    <b>Patient Name: </b>
                    {images[frames].data.string("x00100010")}
                  </span>
                  <span>
                    <b>Study ID: </b>
                    {images[frames].data.string("x00200010")}
                  </span>
                  <b>MR Acquisition Type: </b>
                  {images[frames].data.string("x00180023")}
                </div>
              )}

            {gallery && (
              <div
                //@ts-ignore
                style={{
                  ...styleDiv,
                  bottom: "0px",
                  left: "50%",
                  display: "flex",
                  color: "#73bcf7",
                  zIndex: "999",
                  margin: "0 auto",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <GalleryButtonContainer
                  handleClick={() => {
                    const frame = 0;
                    setDicomState({
                      ...dicomState,
                      frames: frame,
                      currentImage: frame + 1,
                    });
                    cornerstone.displayImage(
                      dicomImageRef.current,
                      images[frame]
                    );
                  }}
                  text=" First"
                />

                <GalleryButtonContainer
                  text="Previous"
                  handleClick={() => {
                    if (frames > 0) {
                      const newFrame = frames - 1;
                      cornerstone.displayImage(
                        dicomImageRef.current,
                        images[newFrame]
                      );

                      setDicomState({
                        ...dicomState,
                        frames: newFrame,
                        currentImage: newFrame + 1,
                      });
                    }
                  }}
                />
                <GalleryButtonContainer
                  handleClick={() => {
                    firePlayEvent();
                    cornerstoneTools.playClip(dicomImageRef.current, 5);
                  }}
                  text="Play"
                />

                <GalleryButtonContainer
                  handleClick={() => {
                    removePlayEvent();
                    cornerstoneTools.stopClip(dicomImageRef.current);
                  }}
                  text="Pause"
                />
                <GalleryButtonContainer
                  text="Next"
                  handleClick={() => {
                    if (frames < images.length - 1) {
                      const newFrame = frames + 1;
                      cornerstone.displayImage(
                        dicomImageRef.current,
                        images[newFrame]
                      );
                      setDicomState({
                        ...dicomState,
                        frames: newFrame,
                        currentImage: newFrame + 1,
                      });
                    }
                  }}
                />

                <GalleryButtonContainer
                  handleClick={() => {
                    const frame = images.length - 1;
                    setDicomState({
                      ...dicomState,
                      frames: frame,
                      currentImage: frame + 1,
                    });
                    cornerstone.displayImage(
                      dicomImageRef.current,
                      images[frame]
                    );
                  }}
                  text="Last"
                />
              </div>
            )}
          </>
        )}
      </div>

      <TagInfoModal
        handleModalToggle={handleEvents}
        isModalOpen={showTagInfo}
        output={output}
        file={filteredFiles && filteredFiles[frames]}
      />
    </>
  );
};

export default DicomViewerContainer;
