import type { RenderingEngine } from "@cornerstonejs/core";
import type { IStackViewport } from "@cornerstonejs/core/types";
import { ToolGroupManager } from "@cornerstonejs/tools";
import { Progress, message } from "antd";
import type { AxiosProgressEvent } from "axios";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IFileBlob } from "../../../api/model";
import { getFileExtension } from "../../../api/model";
import { notification } from "../../Antd";
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
  MouseBindings,
  StackScrollTool,
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
    await basicInit();
    setUpTooling(TOOL_KEY);
  }, []);

  /***************************************************
   * Download a DICOM file as a Blob
   ***************************************************/
  const downloadDicomFile = useCallback(
    async (url: string, token: string, showProgress: boolean) => {
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

      const { viewport, renderingEngine } = await displayDicomImage(
        elementRef.current,
        imageIDs,
        elementId,
      );

      setImageStack(imageIDs);
      activeViewportRef.current = viewport;
      renderingEngineRef.current = renderingEngine;
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

      // Single DICOM can be multi-frame or single-frame
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
    } catch (err) {
      console.error(err);
    }
  }, [selectedFile, downloadDicomFile, renderImagesOnElement]);

  /***************************************************
   * Mount effect: initialize Cornerstone + preview file
   ***************************************************/
  useEffect(() => {
    setupCornerstone();
    displayPreviewFile();
  }, [setupCornerstone, displayPreviewFile]);

  /***************************************************
   * Tooling activation & responding to actionState
   ***************************************************/
  useEffect(() => {
    const viewport = activeViewportRef.current;
    if (!viewport) return;

    const toolGroup = ToolGroupManager.getToolGroup(TOOL_KEY);

    toolGroup?.setToolActive(StackScrollTool.toolName, {
      bindings: [
        {
          mouseButton: MouseBindings.Wheel,
        },
      ],
    });

    if (actionState) {
      handleEvents(actionState, viewport);
    }
  }, [actionState]);

  /***************************************************
   * Track current image index on IMAGE_RENDERED
   ***************************************************/
  const handleImageRendered = useCallback(() => {
    const viewport = activeViewportRef.current;
    if (!viewport) return;
    const newIndex = viewport.getCurrentImageIdIndex();
    setCurrentImageIndex((prev) => (newIndex !== prev ? newIndex : prev));
  }, []);

  useEffect(() => {
    const elem = elementRef.current;
    if (!elem) return;

    // Add
    elem.addEventListener(events.IMAGE_RENDERED, handleImageRendered);
    return () => {
      // Cleanup
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
    console.log("Loading more...");
    const toolGroup = ToolGroupManager.getToolGroup(TOOL_KEY);

    console.log("ActiveTool", toolGroup?.currentActivePrimaryToolName);

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
    setLoading(false);
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
      event.preventDefault();

      // Already loaded all & no more to fetch
      if (imageStack.length === filteredList.length && !fetchMore) return;

      // If singleFrame or partial list, attempt to load more
      if (singleFrame || imageStack.length <= filteredList.length) {
        if (imageStack.length === 1) {
          message.info({
            content:
              "Please wait for all the images to be loaded into the stack for scrolling.",
            key: MESSAGE_KEY,
            duration: 3,
          });
        }
        loadMoreImages();
      }
    },
    [imageStack, filteredList, fetchMore, singleFrame, loadMoreImages],
  );

  useEffect(() => {
    const elem = elementRef.current;
    elem?.addEventListener("wheel", handleWheelEvent);
    return () => elem?.removeEventListener("wheel", handleWheelEvent);
  }, [handleWheelEvent]);

  /***************************************************
   * Cine playback logic (play/stop)
   ***************************************************/
  const startCinePlay = useCallback(() => {
    if (!elementRef.current) {
      notification.error({
        message: "Cine playback cannot start: conditions not met.",
      });
      return;
    }
    const clipOptions = { framesPerSecond: 24, loop: true };
    try {
      playClip(elementRef.current, clipOptions);
    } catch (error) {
      notification.error({ message: "Failed to play this clip" });
    }
  }, []);

  const stopCinePlay = useCallback(() => {
    if (elementRef.current) {
      stopClip(elementRef.current);
    }
  }, []);

  /***************************************************
   * Handle "Play" states from actionState
   * - If user sets "Play", we either start playing if
   *   we've loaded the stack, or attempt to load more.
   * - If "Play" is turned off, stop playback.
   ***************************************************/
  useEffect(() => {
    const isPlaying = actionState.Play === true;

    if (isPlaying) {
      // If we already have the entire stack or no more to fetch, just play
      if (imageStack.length === filteredList.length && !fetchMore) {
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
        loadMoreImages();
      }
    } else {
      // Not playing
      stopCinePlay();
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
