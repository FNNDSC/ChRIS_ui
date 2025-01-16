import type { RenderingEngine } from "@cornerstonejs/core";
import type { IStackViewport } from "@cornerstonejs/core/types";
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
  getFileResourceUrl,
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

  // DOM element refs and Cornerstone references
  const dicomImageRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const activeViewportRef = useRef<IStackViewport | null>(null);

  // State for progress, index, loaded image IDs, etc.
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageStack, setImageStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [singleFrame, setSingleFrame] = useState(false);

  // For auto-resizing
  const size = useSize(dicomImageRef);
  const fname = selectedFile.data.fname;

  /***************************************************
   * Resizing logic
   ***************************************************/
  const handleResize = useCallback(() => {
    if (!dicomImageRef.current || !elementRef.current || !size) return;
    const { width, height } = size;
    elementRef.current.style.width = `${width}px`;
    elementRef.current.style.height = `${height}px`;

    // Force re-layout in Cornerstone
    renderingEngineRef.current?.resize(true, true);
    activeViewportRef.current?.resize();
  }, [size]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); // initial
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  /***************************************************
   * Cornerstone initialization
   ***************************************************/
  const setupCornerstone = useCallback(async () => {
    try {
      await basicInit();
      setUpTooling(TOOL_KEY);
    } catch (error: any) {
      notification.error({
        message: "Cornerstone Initialization Error",
        description: error?.message || String(error),
      });
    }
  }, []);

  /***************************************************
   * Download a DICOM file as a Blob
   ***************************************************/
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
        return response.data; // Blob
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

  /***************************************************
   * Render images in the Cornerstone element
   ***************************************************/
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

  /***************************************************
   * Display the initially selected file
   ***************************************************/
  const displayPreviewFile = useCallback(async () => {
    if (!elementRef.current) return;
    try {
      const url = getFileResourceUrl(selectedFile);
      const blob = await downloadDicomFile(url, selectedFile.auth.token, true);
      const { framesCount, imageID } = await loadDicomImage(blob);

      // Single or multi-frame
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
        message: "Display File Error",
        description: error?.message || String(error),
      });
    }
  }, [selectedFile, downloadDicomFile, renderImagesOnElement]);

  /***************************************************
   * Mount effect: initialize Cornerstone + preview file
   ***************************************************/
  useEffect(() => {
    setupCornerstone().catch((error) => {
      notification.error({
        message: "Setup Cornerstone Error",
        description: error?.message || String(error),
      });
    });
    displayPreviewFile().catch((error) => {
      notification.error({
        message: "Display Preview File Error",
        description: error?.message || String(error),
      });
    });
  }, [setupCornerstone, displayPreviewFile]);

  /***************************************************
   * Tooling activation & responding to actionState
   ***************************************************/
  useEffect(() => {
    const viewport = activeViewportRef.current;
    if (!viewport) return;

    try {
      if (actionState) {
        handleEvents(actionState, viewport);
      }
    } catch (error: any) {
      notification.error({
        message: "Tooling Activation Error",
        description: error?.message || String(error),
      });
    }
  }, [actionState]);

  /***************************************************
   * Track current image index on IMAGE_RENDERED
   ***************************************************/
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

  /***************************************************
   * Filter .dcm files
   ***************************************************/
  const filteredList = useMemo(
    () =>
      list?.filter((file) => getFileExtension(file.data.fname) === "dcm") || [],
    [list],
  );

  /***************************************************
   * Load more single-frame images into the stack
   ***************************************************/
  const loadMoreImages = useCallback(async () => {
    if (!elementRef.current || loading) return;
    setLoading(true);

    try {
      const newIDs: string[] = [];
      for (const file of filteredList) {
        const url = getFileResourceUrl(file);
        const blob = await downloadDicomFile(url, file.auth.token, false);
        const { framesCount, imageID } = await loadDicomImage(blob);

        // If multi-frame, show info & stop
        if (framesCount > 1) {
          setSingleFrame(false);
          message.info("Multiframe dicom found. Click on the image to view");
          break;
        }
        newIDs.push(imageID);
      }

      // Replaces the existing stack with newly loaded images
      await renderImagesOnElement(newIDs);

      // If we loaded the entire list, fetch more from parent if needed
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

  /***************************************************
   * Wheel event: load more images if needed
   ***************************************************/
  const handleWheelEvent = useCallback(
    (event: WheelEvent) => {
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
          loadMoreImages().catch((error) => {
            notification.error({
              message: "Load More Images on Wheel Error",
              description: error?.message || String(error),
            });
          });
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
    elem?.addEventListener("wheel", handleWheelEvent);
    return () => {
      elem?.removeEventListener("wheel", handleWheelEvent);
    };
  }, [handleWheelEvent]);

  /***************************************************
   * Cine playback logic (play/stop)
   ***************************************************/
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

  /***************************************************
   * Handle "Play" states from actionState
   ***************************************************/
  useEffect(() => {
    try {
      const isPlaying = actionState.Play === true;

      if (isPlaying) {
        // If we already have the entire stack or no more to fetch, just play
        if (
          !singleFrame ||
          (imageStack.length === filteredList.length && !fetchMore)
        ) {
          startCinePlay();
          return;
        }
        // Otherwise, if singleFrame or partial, load more
        if (singleFrame || imageStack.length <= filteredList.length) {
          if (imageStack.length === 1) {
            message.info({
              content:
                "Please wait for all the images to be loaded into the stack for scrolling.",
              key: MESSAGE_KEY,
              duration: 3,
            });
          }
          loadMoreImages().catch((error) => {
            notification.error({
              message: "Load More Images on Play Error",
              description: error?.message || String(error),
            });
          });
        }
      } else {
        // Not playing
        stopCinePlay();
      }
    } catch (error: any) {
      notification.error({
        message: "Play State Error",
        description: error?.message || String(error),
      });
    }
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

  /***************************************************
   * Cleanup
   ***************************************************/
  useEffect(() => {
    return () => {
      // Destroy the Cornerstone engine
      renderingEngineRef.current?.destroy();
      setImageStack([]);
      // Remove rendered event listener
      elementRef.current?.removeEventListener(
        events.IMAGE_RENDERED,
        handleImageRendered,
      );
      // Stop any ongoing clip
      stopCinePlay();
    };
  }, [handleImageRendered, stopCinePlay]);

  /***************************************************
   * UI: progress bar, indexes, etc.
   ***************************************************/
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
      {/* Download progress bar */}
      {showProgress && <Progress percent={downloadProgress} />}

      {/* Overlay Controls */}
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

      {/* Cornerstone Element */}
      <div
        id={`cornerstone-element-${fname}`}
        ref={elementRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default DcmDisplayCopy;
