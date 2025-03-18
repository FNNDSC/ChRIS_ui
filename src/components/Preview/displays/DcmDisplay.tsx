import type { RenderingEngine } from "@cornerstonejs/core";
import type { StackViewport } from "@cornerstonejs/core";
import { Progress, message, notification } from "antd";
import type { AxiosProgressEvent } from "axios";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IFileBlob } from "../../../api/model";
import { getFileExtension } from "../../../api/model";
import useSize from "../../FeedTree/useSize";
import type { ActionState } from "../FileDetailView";
import {
  events,
  basicInit,
  displayDicomImage,
  handleEvents,
  loadDicomImage,
  playClip,
  setUpTooling,
  stopClip,
  stupidlyGetFileResourceUrl,
} from "./dicomUtils/utils";

const TOOL_KEY = "cornerstone-display";
const MESSAGE_KEY = "scroll-warning";

export type DcmImageProps = {
  selectedFile: IFileBlob;
  actionState: ActionState;
  preview: string;
  list?: IFileBlob[];
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;
};

const DcmDisplayCopy = (props: DcmImageProps) => {
  const {
    selectedFile,
    list,
    handlePagination,
    fetchMore,
    preview,
    filesLoading,
    actionState,
  } = props;

  const dicomImageRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const activeViewportRef = useRef<StackViewport | null>(null);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageStack, setImageStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [singleFrame, setSingleFrame] = useState(false);

  const size = useSize(dicomImageRef);
  const fname = selectedFile.data.fname;

  const handleResize = useCallback(() => {
    if (!dicomImageRef.current || !elementRef.current || !size) return;
    const { width, height } = size;
    elementRef.current.style.width = `${width}px`;
    elementRef.current.style.height = `${height}px`;
    renderingEngineRef.current?.resize(true, true);
    activeViewportRef.current?.resize();
  }, [size]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const setupCornerstone = useCallback(async () => {
    await basicInit();
    setUpTooling(TOOL_KEY);
  }, []);

  const downloadDicomFile = useCallback(
    async (url: string, token: string, showProgress: boolean) => {
      try {
        const response = await axios.get(url, {
          responseType: "blob",
          headers: { Authorization: `Token ${token}` },
          onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
            if (!showProgress || !progressEvent.total) return;
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setDownloadProgress(percentCompleted);
          },
        });
        return response.data;
      } catch (error: any) {
        notification.error({
          message: "Download DICOM Error",
          description: error?.message || String(error),
        });
        throw error;
      }
    },
    [],
  );

  const renderImagesOnElement = useCallback(
    async (imageIDs: string[]) => {
      if (!elementRef.current) return;
      const elementId = `cornerstone-element-${fname}`;
      try {
        const { viewport, renderingEngine } = await displayDicomImage(
          elementRef.current,
          imageIDs,
          elementId,
        );
        setImageStack(imageIDs);
        activeViewportRef.current = viewport;
        renderingEngineRef.current = renderingEngine;
      } catch (error: any) {
        notification.error({
          message: "Render Image Error",
          description: error?.message || String(error),
        });
      }
    },
    [fname],
  );

  const displayPreviewFile = useCallback(async () => {
    if (!elementRef.current) return;
    try {
      const url = stupidlyGetFileResourceUrl(selectedFile);
      const blob = await downloadDicomFile(url, selectedFile.auth.token, true);
      const { framesCount, imageID } = await loadDicomImage(blob);
      const framesList =
        framesCount > 1
          ? Array.from(
              { length: framesCount },
              (_, i) => `${imageID}#frame=${i + 1}`,
            )
          : imageID;
      const imageIDs = Array.isArray(framesList) ? framesList : [framesList];
      setSingleFrame(imageIDs.length === 1);
      await renderImagesOnElement(imageIDs);
    } catch (error: any) {
      notification.error({
        message: "Display Preview File Error",
        description: error?.message || String(error),
      });
    }
  }, [selectedFile, downloadDicomFile, renderImagesOnElement]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await setupCornerstone();
      } catch (error: any) {
        notification.error({
          message: "Setup Cornerstone Error",
          description: error?.message || String(error),
        });
        return;
      }
      try {
        await displayPreviewFile();
      } catch (error: any) {
        notification.error({
          message: "Display Preview File Error",
          description: error?.message || String(error),
        });
      }
    };
    initialize();
  }, [setupCornerstone, displayPreviewFile]);

  useEffect(() => {
    const viewport = activeViewportRef.current;
    if (!viewport || !actionState) return;
    try {
      handleEvents(actionState, viewport);
    } catch (error: any) {
      notification.error({
        message: "Tooling Activation Error",
        description: error?.message || String(error),
      });
    }
  }, [actionState]);

  const handleImageRendered = useCallback(() => {
    try {
      const viewport = activeViewportRef.current;
      if (!viewport) return;
      const newIndex = viewport.getCurrentImageIdIndex();
      setCurrentImageIndex((prev) => (newIndex !== prev ? newIndex : prev));
    } catch (error: any) {
      notification.error({
        message: "Image Rendered Handler Error",
        description: error?.message || String(error),
      });
    }
  }, []);

  useEffect(() => {
    const elem = elementRef.current;
    if (!elem) return;
    elem.addEventListener(events.IMAGE_RENDERED, handleImageRendered);
    return () => {
      elem.removeEventListener(events.IMAGE_RENDERED, handleImageRendered);
    };
  }, [handleImageRendered]);

  const filteredList = useMemo(
    () =>
      list?.filter((file) => getFileExtension(file.data.fname) === "dcm") || [],
    [list],
  );

  const loadMoreImages = useCallback(async () => {
    if (!elementRef.current || loading) return;
    setLoading(true);
    try {
      const newIDs: string[] = [];
      for (const file of filteredList) {
        const url = stupidlyGetFileResourceUrl(file);
        const blob = await downloadDicomFile(url, file.auth.token, false);
        const { framesCount, imageID } = await loadDicomImage(blob);
        if (framesCount > 1) {
          setSingleFrame(false);
          message.info("Multiframe dicom found. Click on the image to view");
          break;
        }
        newIDs.push(imageID);
      }
      await renderImagesOnElement(newIDs);
      if (newIDs.length === filteredList.length && fetchMore && !filesLoading) {
        message.info({
          content:
            "Please wait for all the images to be loaded into the stack for scrolling.",
          key: MESSAGE_KEY,
          duration: 3,
        });
        handlePagination?.();
      }
    } catch (error: any) {
      notification.error({
        message: "Load More Images Error",
        description: error?.message || String(error),
      });
    } finally {
      setLoading(false);
    }
  }, [
    filteredList,
    loading,
    fetchMore,
    filesLoading,
    handlePagination,
    downloadDicomFile,
    renderImagesOnElement,
  ]);

  const handleWheelEvent = useCallback(
    async (event: WheelEvent) => {
      try {
        event.preventDefault();
        if (imageStack.length === filteredList.length && !fetchMore) return;
        if (singleFrame || imageStack.length <= filteredList.length) {
          if (imageStack.length === 1) {
            message.info({
              content:
                "Please wait for all the images to be loaded into the stack for scrolling.",
              key: MESSAGE_KEY,
              duration: 3,
            });
          }
          await loadMoreImages();
        }
      } catch (error: any) {
        notification.error({
          message: "Wheel Event Error",
          description: error?.message || String(error),
        });
      }
    },
    [imageStack, filteredList, fetchMore, singleFrame, loadMoreImages],
  );

  useEffect(() => {
    const elem = elementRef.current;
    if (!elem) return;
    const wheelListener = (e: WheelEvent) => {
      handleWheelEvent(e);
    };
    elem.addEventListener("wheel", wheelListener);
    return () => {
      elem.removeEventListener("wheel", wheelListener);
    };
  }, [handleWheelEvent]);

  const startCinePlay = useCallback(() => {
    try {
      if (!elementRef.current) {
        notification.error({
          message: "Cine Playback Error",
          description: "Cine playback cannot start: conditions not met.",
        });
        return;
      }
      const clipOptions = { framesPerSecond: 24, loop: true };
      playClip(elementRef.current, clipOptions);
    } catch (error: any) {
      notification.error({
        message: "Play Clip Error",
        description: error?.message || String(error),
      });
    }
  }, []);

  const stopCinePlay = useCallback(() => {
    try {
      if (elementRef.current) {
        stopClip(elementRef.current);
      }
    } catch (error: any) {
      notification.error({
        message: "Stop Clip Error",
        description: error?.message || String(error),
      });
    }
  }, []);

  useEffect(() => {
    const handlePlayState = async () => {
      try {
        const isPlaying = actionState.Play === true;
        if (isPlaying) {
          if (
            !singleFrame ||
            (imageStack.length === filteredList.length && !fetchMore)
          ) {
            startCinePlay();
            return;
          }
          if (singleFrame || imageStack.length <= filteredList.length) {
            if (imageStack.length === 1) {
              message.info({
                content:
                  "Please wait for all the images to be loaded into the stack for scrolling.",
                key: MESSAGE_KEY,
                duration: 3,
              });
            }
            await loadMoreImages();
          }
        } else {
          stopCinePlay();
        }
      } catch (error: any) {
        notification.error({
          message: "Play State Error",
          description: error?.message || String(error),
        });
      }
    };
    handlePlayState();
  }, [
    actionState.Play,
    singleFrame,
    filteredList,
    imageStack,
    fetchMore,
    startCinePlay,
    stopCinePlay,
    loadMoreImages,
  ]);

  useEffect(() => {
    return () => {
      renderingEngineRef.current?.destroy();
      setImageStack([]);
      elementRef.current?.removeEventListener(
        events.IMAGE_RENDERED,
        handleImageRendered,
      );
      stopCinePlay();
    };
  }, [handleImageRendered, stopCinePlay]);

  const showProgress = downloadProgress > 0 && downloadProgress < 100;
  const imageCount = imageStack.length;
  const totalDigits = imageCount.toString().length;
  const currentIndexDisplay = (currentImageIndex + 1)
    .toString()
    .padStart(totalDigits, "0");
  const imageCountDisplay = imageCount.toString().padStart(totalDigits, "0");

  return (
    <div
      id="content"
      ref={dicomImageRef}
      className={preview === "large" ? "dcm-preview" : ""}
    >
      {showProgress && <Progress percent={downloadProgress} />}
      <div
        style={{
          position: "absolute",
          top: "0.25em",
          right: "0.25em",
          zIndex: 99999,
          width: "200px",
        }}
      >
        {loading && <div>Loading...</div>}
        {imageCount > 1 && (
          <div
            style={{
              color: "#fff",
              marginBottom: "0.5em",
              fontFamily: "monospace",
            }}
          >
            {`Current Index: ${currentIndexDisplay}/${imageCountDisplay}`}
          </div>
        )}
      </div>
      <div
        id={`cornerstone-element-${fname}`}
        ref={elementRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DcmDisplayCopy;
