// Import statements
import type { RenderingEngine } from "@cornerstonejs/core";
import { ToolGroupManager } from "@cornerstonejs/tools";
import { useQuery } from "@tanstack/react-query";
import { Progress, message } from "antd"; // Import Antd message
import axios, { type AxiosProgressEvent } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type IFileBlob, getFileExtension } from "../../../api/model";
import { notification } from "../../Antd";
import { SpinContainer } from "../../Common";
import useSize from "../../FeedTree/useSize";
import type { ActionState } from "../FileDetailView";
import { useDicomCache } from "./DicomCacheContext";
import {
  type IStackViewport,
  basicInit,
  displayDicomImage,
  events,
  handleEvents,
  loadDicomImage,
  playClip,
  setUpTooling,
  stopClip,
  stupidlyGetFileResourceUrl,
} from "./dicomUtils/utils";

export type DcmImageProps = {
  selectedFile: IFileBlob;
  actionState: ActionState;
  preview: string;
  list?: IFileBlob[];
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;
};

const TOOL_KEY = "cornerstone-display";
const CACHE_KEY = "cornerstone-stack";
const MESSAGE_KEY = "scroll-warning"; // Define a unique key for the message

type ImageStackType = {
  [key: string]: string | string[];
};

const DcmDisplay = (props: DcmImageProps) => {
  const {
    selectedFile,
    list,
    handlePagination,
    fetchMore,
    preview,
    filesLoading,
    actionState,
  } = props;
  const { cache, setCache } = useDicomCache();

  // State variables
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageStack, setImageStack] = useState<ImageStackType>({});
  const [multiFrameDisplay, setMultiFrameDisplay] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLoadedIndex, setLastLoadedIndex] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Refs
  const dicomImageRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const activeViewportRef = useRef<IStackViewport | null>(null);

  // Derived values
  const size = useSize(dicomImageRef);
  const cacheStack = cache[CACHE_KEY] || {};
  const fname = selectedFile.data.fname;

  /**
   * Handle resizing of the DICOM image viewer when the container size changes.
   */
  const handleResize = useCallback(() => {
    if (dicomImageRef.current && size && elementRef.current) {
      const { width, height } = size;
      elementRef.current.style.width = `${width}px`;
      elementRef.current.style.height = `${height}px`;
      renderingEngineRef.current?.resize(true, true);
      activeViewportRef.current?.resize();
    }
  }, [size]);

  // Set up resize event listener
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial resize
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  /**
   * Initialize Cornerstone library and set up tooling.
   */
  useEffect(() => {
    const setupCornerstone = async () => {
      await basicInit();
      setUpTooling(TOOL_KEY);
    };
    setupCornerstone();
  }, []);

  /**
   * Filter the file list to include only DICOM files.
   */
  const filteredList = useMemo(
    () =>
      list?.filter((file) => getFileExtension(file.data.fname) === "dcm") || [],
    [list],
  );

  /**
   * Find the index of the selected file in the filtered list.
   */
  const selectedIndex = useMemo(
    () =>
      filteredList?.findIndex((file) => file.data.id === selectedFile.data.id),
    [filteredList, selectedFile.data.id],
  );

  /** Fetch File Blob */

  const downloadDicomFile = async (url: string, token: string) => {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
        headers: {
          Authorization: `Token ${token}`,
        },
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setDownloadProgress(percentCompleted);
          }
        },
      });
      return response.data; // This is the Blob
    } catch (e) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  };

  /**
   * Preview the selected DICOM file.
   * If the image is already cached, it uses the cached data.
   * Otherwise, it loads the image and caches it.
   */
  const previewFile = async () => {
    try {
      if (!elementRef.current) return {};
      const existingImageEntry = cacheStack?.[fname];

      if (existingImageEntry && activeViewportRef.current) {
        // Image is already cached
        let imageIDs: string[];
        let index: number;

        if (Array.isArray(existingImageEntry)) {
          // Multi-frame image
          imageIDs = existingImageEntry;
          index = currentImageIndex;
          setMultiFrameDisplay(true);
        } else {
          // Single-frame images
          imageIDs = Object.values(cacheStack).flat() as string[];
          index = imageIDs.findIndex((id) => id === existingImageEntry);
          setMultiFrameDisplay(false);
        }

        // Ensure index is valid
        if (index < 0 || index >= imageIDs.length) {
          index = 0;
        }

        await activeViewportRef.current.setStack(imageIDs, index);
        activeViewportRef.current.render();
        setCurrentImageIndex(index);
        return cacheStack;
      }

      // Load new image if not in cache

      const url = stupidlyGetFileResourceUrl(selectedFile);
      const blob = await downloadDicomFile(url, selectedFile.auth.token);
      const imageData = await loadDicomImage(blob);
      const { framesCount, imageID } = imageData;

      const framesList =
        framesCount > 1
          ? Array.from(
              { length: framesCount },
              (_, i) => `${imageID}#frame=${i + 1}`,
            )
          : imageID;

      const newImageStack: ImageStackType = {
        [fname]: framesList,
      };

      const elementId = `cornerstone-element-${fname}`;
      const { viewport, renderingEngine } = await displayDicomImage(
        elementRef.current,
        Array.isArray(framesList) ? framesList : [framesList],
        elementId,
      );

      setMultiFrameDisplay(framesCount > 1);
      activeViewportRef.current = viewport;
      renderingEngineRef.current = renderingEngine;
      setImageStack(newImageStack);
      setCurrentImageIndex(selectedIndex || 0);
      // Update the cache using the context
      setCache(() => {
        const updatedCache = {
          [CACHE_KEY]: newImageStack,
        };
        return updatedCache;
      });
      return newImageStack;
    } catch (e) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  };

  // Use React Query to fetch and cache the preview data
  const { isLoading, data, isError, error } = useQuery({
    queryKey: ["cornerstone-preview", fname],
    queryFn: previewFile,
    enabled: !!selectedFile && !!elementRef.current,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      notification.error({
        message: error.name,
        description: (error as Error)?.message,
      });
    }
  }, [isError, error]);

  /**
   * Stop cine playback.
   */
  const stopCinePlay = useCallback(() => {
    if (elementRef.current) {
      stopClip(elementRef.current);
    }
  }, []);

  /**
   * Clean up when the component unmounts.
   * Destroys the rendering engine and clears intervals.
   */
  useEffect(() => {
    return () => {
      renderingEngineRef.current?.destroy();
      setIsLoadingMore(false);
      setLastLoadedIndex(0);
      setImageStack({});
      if (elementRef.current) {
        elementRef.current.removeEventListener(
          events.IMAGE_RENDERED,
          handleImageRendered,
        );
      }
      stopCinePlay();
    };
  }, [stopCinePlay]);

  /**
   * Start cine playback.
   */
  const startCinePlay = useCallback(() => {
    if (elementRef.current) {
      const clipOptions = {
        framesPerSecond: 24,
        loop: true,
      };

      try {
        playClip(elementRef.current, clipOptions);
      } catch (error) {
        notification.error({ message: "Failed to play this clip" });
      }
    } else {
      notification.error({
        message: "Cine playback cannot start: conditions not met.",
      });
    }
  }, []);

  /**
   * Generator function to yield image files starting from a specific index.
   */
  function* imageFileGenerator(
    list: IFileBlob[],
    startIndex: number,
  ): Generator<IFileBlob> {
    for (let i = startIndex; i < list.length; i++) {
      yield list[i];
    }
  }

  /**
   * Load more images when needed.
   * This function loads additional images into the cache and updates the viewport.
   */
  const loadMoreImages = useCallback(
    async (filteredList: IFileBlob[]) => {
      if (Object.keys(cacheStack).length === filteredList.length) {
        // All images are already loaded
        setImageStack(cacheStack);
        if (activeViewportRef.current) {
          const imageIDs = Object.values(cacheStack).flat() as string[];
          // Ensure currentImageIndex is within bounds
          const index = Math.min(currentImageIndex, imageIDs.length - 1);
          await activeViewportRef.current.setStack(imageIDs, index);
          activeViewportRef.current.render();
          setCurrentImageIndex(index);
        }
        return;
      }

      setIsLoadingMore(true);
      const generator = imageFileGenerator(filteredList, lastLoadedIndex);
      const newImages: ImageStackType = {};
      for (let next = generator.next(); !next.done; next = generator.next()) {
        const file = next.value;
        if (cacheStack[file.data.fname]) {
          continue; // Skip if already in cache
        }
        const blob = await file.getFileBlob();
        const imageData = await loadDicomImage(blob);
        newImages[file.data.fname] = imageData.imageID;
      }
      const updatedImageStack = { ...cacheStack, ...newImages };
      setImageStack(updatedImageStack);
      // Update the cache using the context
      setCache(() => {
        const updatedCache = {
          [CACHE_KEY]: updatedImageStack,
        };
        return updatedCache;
      });

      if (activeViewportRef.current) {
        const imageIDs = Object.values(updatedImageStack).flat() as string[];
        // Ensure currentImageIndex is within bounds
        const index = Math.min(currentImageIndex, imageIDs.length - 1);
        await activeViewportRef.current.setStack(imageIDs, index);
        activeViewportRef.current.render();
        setCurrentImageIndex(index);
      }

      setLastLoadedIndex(lastLoadedIndex + Object.keys(newImages).length);
      setIsLoadingMore(false);
    },
    [cacheStack, lastLoadedIndex, currentImageIndex],
  );

  // Check if the first frame is still loading
  const loadingFirstFrame = isLoading && !data;

  /**
   * Load more images when scrolling near the end.
   * Also handles loading multi-frame images.
   */
  useEffect(() => {
    if (
      !loadingFirstFrame &&
      data &&
      !Array.isArray(data[fname]) &&
      filteredList.length > lastLoadedIndex &&
      Object.keys(cacheStack).length !== filteredList.length &&
      !multiFrameDisplay
    ) {
      loadMoreImages(filteredList);
    }
  }, [
    loadingFirstFrame,
    filteredList,
    lastLoadedIndex,
    cacheStack,
    multiFrameDisplay,
    loadMoreImages,
    data,
    fname,
  ]);

  /**
   * Handle image rendered event.
   * Updates the current image index and triggers pagination if needed.
   */
  const handleImageRendered = useCallback(() => {
    if (activeViewportRef.current) {
      if (
        multiFrameDisplay ||
        (!multiFrameDisplay && Object.keys(imageStack).length > 1)
      ) {
        const newIndex = activeViewportRef.current.getCurrentImageIdIndex();
        if (newIndex !== currentImageIndex) {
          setCurrentImageIndex(newIndex);
        }
      }

      if (
        filteredList &&
        fetchMore &&
        !filesLoading &&
        !loadingFirstFrame &&
        !multiFrameDisplay
      ) {
        handlePagination?.();
      }
    }
  }, [
    multiFrameDisplay,
    imageStack,
    filteredList,
    fetchMore,
    filesLoading,
    loadingFirstFrame,
    handlePagination,
    currentImageIndex,
  ]);

  // Add event listener for image rendered event
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.addEventListener(
        events.IMAGE_RENDERED,
        handleImageRendered,
      );
    }
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener(
          events.IMAGE_RENDERED,
          handleImageRendered,
        );
      }
    };
  }, [handleImageRendered]);

  console.log("Image stack", imageStack, fname);

  /**
   * Calculate the total number of images.
   */
  const imageCount = useMemo(() => {
    return multiFrameDisplay
      ? (imageStack[fname] as string[]).length
      : Object.keys(imageStack).length;
  }, [multiFrameDisplay, imageStack, fname]);

  const totalDigits = imageCount.toString().length;
  const currentIndexDisplay = (currentImageIndex + 1)
    .toString()
    .padStart(totalDigits, "0");
  const imageCountDisplay = imageCount.toString().padStart(totalDigits, "0");

  /* Manage Tooling */
  useEffect(() => {
    if (actionState && activeViewportRef.current) {
      handleEvents(actionState, activeViewportRef.current);
    }
  }, [actionState]);

  /**
   * Determine if all images are loaded.
   */
  const isAllImagesLoaded = useMemo(
    () => Object.keys(imageStack).length === filteredList.length,
    [imageStack, filteredList],
  );

  /**
   * Handle cine playback based on `actionState["Play"]` state.
   */
  useEffect(() => {
    const isPlaying = actionState.Play === true;
    if (isPlaying) {
      if (multiFrameDisplay || isAllImagesLoaded) {
        startCinePlay();
      } else {
        message.info({
          content:
            "Please wait for all the images to be loaded into the stack for scrolling.",
          key: MESSAGE_KEY,
          duration: 3,
        });
        // Reset the Play action
        handleEvents(
          { Play: false },
          activeViewportRef.current as IStackViewport,
        );
      }
    } else {
      stopCinePlay();
    }
    return () => {
      stopCinePlay();
    };
  }, [
    actionState.Play,
    isAllImagesLoaded,
    multiFrameDisplay,
    startCinePlay,
    stopCinePlay,
  ]);

  /**
   * Enable or disable stack scrolling based on image load status.
   */
  useEffect(() => {
    if (elementRef.current) {
      const toolGroup = ToolGroupManager.getToolGroup(TOOL_KEY);
      if (multiFrameDisplay || isAllImagesLoaded) {
        // Activate stack scrolling
        toolGroup?.setToolActive("StackScrollMouseWheel");
      } else {
        // Deactivate stack scrolling
        toolGroup?.setToolDisabled("StackScrollMouseWheel");
      }
    }
  }, [isAllImagesLoaded, multiFrameDisplay]);

  /**
   * Intercept wheel events to prevent scrolling before all images are loaded.
   */
  useEffect(() => {
    if (elementRef.current && !multiFrameDisplay && !isAllImagesLoaded) {
      const handleWheelEvent = (event: WheelEvent) => {
        event.preventDefault();
        message.info({
          content:
            "Please wait for all the images to be loaded into the stack for scrolling.",
          key: MESSAGE_KEY,
          duration: 3,
        });
      };
      elementRef.current.addEventListener("wheel", handleWheelEvent);
      return () => {
        elementRef.current?.removeEventListener("wheel", handleWheelEvent);
      };
    }
  }, [isAllImagesLoaded, multiFrameDisplay]);

  const showProgress = downloadProgress > 0 && downloadProgress < 100;

  return (
    <>
      <div
        id="content"
        ref={dicomImageRef}
        className={preview === "large" ? "dcm-preview" : ""}
      >
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
          {/* Current Index Display */}
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

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div style={{ color: "#fff" }}>
              <i>More Files are being loaded...</i>
            </div>
          )}
        </div>
        {isLoading && !showProgress && (
          <SpinContainer title="Loading DICOM Image..." />
        )}
        {showProgress && <Progress percent={downloadProgress} />}

        {/* DICOM Image Display */}
        <div
          id={`cornerstone-element-${fname}`}
          ref={elementRef}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </>
  );
};

export default DcmDisplay;
