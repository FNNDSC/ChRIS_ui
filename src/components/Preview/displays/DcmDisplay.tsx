import type { RenderingEngine } from "@cornerstonejs/core";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type IFileBlob, getFileExtension } from "../../../api/model";
import { notification } from "../../Antd";
import { SpinContainer } from "../../Common";
import useSize from "../../FeedTree/useSize";
import type { ActionState } from "../FileDetailView";
import {
  events,
  basicInit,
  displayDicomImage,
  handleEvents,
  loadDicomImage,
  setUpTooling,
} from "./dicomUtils/utils";
import type { IStackViewport } from "./dicomUtils/utils";

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

  // State variables
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageStack, setImageStack] = useState<ImageStackType>({});
  const [multiFrameDisplay, setMultiFrameDisplay] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLoadedIndex, setLastLoadedIndex] = useState(0);

  // Refs
  const dicomImageRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const activeViewportRef = useRef<IStackViewport | null>(null);
  const cacheRef = useRef<{ [key: string]: ImageStackType }>({
    [CACHE_KEY]: {},
  });
  const cineIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Derived values
  const size = useSize(dicomImageRef);
  const cacheStack = cacheRef.current[CACHE_KEY];
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

        await activeViewportRef.current.setStack(
          imageIDs,
          index !== -1 ? index : 0,
        );
        activeViewportRef.current.render();
        setCurrentImageIndex(index);
        return cacheStack;
      }

      // Load new image if not in cache
      const blob = await selectedFile.getFileBlob();
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
        framesCount > 1 ? framesList : [imageID],
        elementId,
      );

      setMultiFrameDisplay(framesCount > 1);
      activeViewportRef.current = viewport;
      renderingEngineRef.current = renderingEngine;
      setImageStack(newImageStack);
      setCurrentImageIndex(selectedIndex);
      cacheRef.current[CACHE_KEY] = newImageStack;
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
        message: "Error Loading DICOM Image",
        description:
          (error as Error)?.message ||
          "An error occurred while loading the DICOM Image",
      });
    }
  }, [isError, error]);

  /**
   * Stop cine playback.
   */
  const stopCinePlay = useCallback(() => {
    if (cineIntervalIdRef.current) {
      clearInterval(cineIntervalIdRef.current);
      cineIntervalIdRef.current = null;
    }
  }, []);

  /**
   * Clean up when the component unmounts.
   * Destroys the rendering engine and clears caches and intervals.
   */
  useEffect(() => {
    return () => {
      renderingEngineRef.current?.destroy();
      cacheRef.current = { [CACHE_KEY]: {} };
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
          await activeViewportRef.current.setStack(imageIDs, selectedIndex);
          activeViewportRef.current.render();
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
      cacheRef.current[CACHE_KEY] = updatedImageStack;

      if (activeViewportRef.current) {
        const imageIDs = Object.values(updatedImageStack).flat() as string[];
        await activeViewportRef.current.setStack(imageIDs, selectedIndex);
        activeViewportRef.current.render();
      }

      setLastLoadedIndex(lastLoadedIndex + Object.keys(newImages).length);
      setIsLoadingMore(false);
    },
    [cacheStack, lastLoadedIndex, selectedIndex, loadDicomImage],
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
        setCurrentImageIndex(newIndex);
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

  /**
   * Start cine playback.
   */
  const startCinePlay = useCallback(() => {
    if (
      cineIntervalIdRef.current ||
      !activeViewportRef.current ||
      !imageStack[fname] ||
      imageCount <= 1
    )
      return;

    const defaultPlaybackSpeed = 24; // Default playback speed (fps)
    const frameDuration = 1000 / defaultPlaybackSpeed; // Frame duration in milliseconds

    cineIntervalIdRef.current = setInterval(() => {
      if (activeViewportRef.current) {
        let currentIndex = activeViewportRef.current.getCurrentImageIdIndex();
        currentIndex = (currentIndex + 1) % imageCount;
        activeViewportRef.current.setImageIdIndex(currentIndex);
        setCurrentImageIndex(currentIndex);
      }
    }, frameDuration);
  }, [imageStack, fname, imageCount]);

  /**
   * Manage cine playback based on `actionState["Play"]` state.
   */
  useEffect(() => {
    const isPlaying = actionState.Play === true;
    if (isPlaying && imageCount > 1) {
      startCinePlay();
    } else {
      stopCinePlay();
    }
    return () => {
      stopCinePlay();
    };
  }, [actionState.Play, startCinePlay, stopCinePlay, imageCount]);

  /* Manage Tooling */
  useEffect(() => {
    if (actionState && activeViewportRef.current) {
      handleEvents(actionState, activeViewportRef.current);
    }
  }, [actionState]);

  return (
    <>
      {loadingFirstFrame && <SpinContainer title="Displaying image..." />}
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
              <i>Loading more...</i>
            </div>
          )}
        </div>

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
