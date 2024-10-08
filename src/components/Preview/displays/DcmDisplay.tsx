import type { RenderingEngine } from "@cornerstonejs/core";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { getFileExtension, type IFileBlob } from "../../../api/model";
import { SpinContainer } from "../../Common";
import useSize from "../../FeedTree/useSize";
import type { ActionState } from "../FileDetailView";
import {
  basicInit,
  displayDicomImage,
  loadDicomImage,
  setUpTooling,
  events,
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
  } = props;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageStack, setImageStack] = useState<ImageStackType>({});
  const [multiFrameDisplay, setMultiframeDisplay] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLoadedIndex, setLastLoadedIndex] = useState(0);

  const dicomImageRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const activeViewportRef = useRef<IStackViewport | null>(null);
  const cacheRef = useRef<{ [key: string]: ImageStackType }>({
    [CACHE_KEY]: {},
  });

  const size = useSize(dicomImageRef);
  const cacheStack = cacheRef.current[CACHE_KEY];
  const fname = selectedFile.data.fname;

  // Handle resizing of the DICOM image viewer
  const handleResize = useCallback(() => {
    if (dicomImageRef.current && size && elementRef.current) {
      const { width, height } = size;
      elementRef.current.style.width = `${width}px`;
      elementRef.current.style.height = `${height}px`;
      renderingEngineRef.current?.resize(true, true);
      activeViewportRef.current?.resize();
    }
  }, [size]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial resize
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // Initialize Cornerstone
  useEffect(() => {
    const setupCornerstone = async () => {
      await basicInit();
      setUpTooling(TOOL_KEY);
    };
    setupCornerstone();
  }, []);

  // Filter the list to include only DICOM files
  const filteredList = useMemo(
    () =>
      list?.filter((file) => getFileExtension(file.data.fname) === "dcm") || [],
    [list],
  );

  // Preview the selected DICOM file
  const previewFile = useCallback(async () => {
    if (!elementRef.current) return {};

    const existingImageEntry = cacheStack?.[fname];

    if (existingImageEntry && activeViewportRef.current) {
      let imageIDs: string[];
      let index: number;

      if (Array.isArray(existingImageEntry)) {
        // Multi-frame image
        imageIDs = existingImageEntry;
        index = currentImageIndex;
        setMultiframeDisplay(true);
      } else {
        // Single-frame images
        imageIDs = Object.values(cacheStack).flat() as string[];
        index = imageIDs.findIndex((id) => id === existingImageEntry);
        setMultiframeDisplay(false);
      }

      await activeViewportRef.current.setStack(
        imageIDs,
        index !== -1 ? index : 0,
      );
      activeViewportRef.current.render();

      return cacheStack;
    }

    // Load new image if not in cache
    const blob = await selectedFile.getFileBlob();
    const imageData = await loadDicomImage(blob);
    const { framesCount, imageID } = imageData;

    const framesList =
      framesCount > 1
        ? Array.from({ length: framesCount }, (_, i) => `${imageID}?frame=${i}`)
        : imageID;

    const newImageStack: ImageStackType = {
      [fname]: framesList,
    };

    const elementId = `cornerstone-element-${fname}`;
    const { viewport, renderingEngine } = await displayDicomImage(
      elementRef.current,
      framesCount > 1 ? framesList[0] : imageID,
      elementId,
    );

    setMultiframeDisplay(framesCount > 1);
    activeViewportRef.current = viewport;
    renderingEngineRef.current = renderingEngine;

    setImageStack(newImageStack);
    cacheRef.current[CACHE_KEY] = newImageStack;
    return newImageStack;
  }, [selectedFile, cacheStack, fname, currentImageIndex]);

  const { isLoading, data } = useQuery({
    queryKey: ["cornerstone-preview", fname],
    queryFn: previewFile,
    enabled: !!selectedFile && !!elementRef.current,
  });

  // Clean up when the component unmounts
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
    };
  }, []);

  // Load multi-frame images
  const loadMultiFrames = useCallback(async () => {
    if (activeViewportRef.current) {
      const currentIndex = activeViewportRef.current.getCurrentImageIdIndex();
      const imageIDs = imageStack[fname] as string[];
      await activeViewportRef.current.setStack(imageIDs, currentIndex);
      activeViewportRef.current.render();
    }
  }, [imageStack, fname]);

  // Generator for loading image files
  function* imageFileGenerator(list: IFileBlob[], startIndex: number) {
    for (let i = startIndex; i < list.length; i++) {
      yield list[i];
    }
  }

  // Load more images when needed
  const loadMoreImages = useCallback(
    async (filteredList: IFileBlob[]) => {
      if (Object.keys(cacheStack).length === filteredList.length) {
        setImageStack(cacheStack);
        if (activeViewportRef.current) {
          const currentIndex =
            activeViewportRef.current.getCurrentImageIdIndex();
          const imageIDs = Object.values(cacheStack).flat() as string[];
          await activeViewportRef.current.setStack(imageIDs, currentIndex);
          activeViewportRef.current.render();
        }
        return;
      }

      setIsLoadingMore(true);
      const generator = imageFileGenerator(filteredList, lastLoadedIndex);
      const newImages: ImageStackType = {};

      let next = generator.next();
      while (!next.done) {
        const file = next.value;
        if (cacheStack[file.data.fname]) {
          next = generator.next();
          continue;
        }

        const blob = await file.getFileBlob();
        const imageData = await loadDicomImage(blob);
        newImages[file.data.fname] = imageData.imageID;
        next = generator.next();
      }

      const updatedImageStack = { ...cacheStack, ...newImages };
      setImageStack(updatedImageStack);
      cacheRef.current[CACHE_KEY] = updatedImageStack;

      if (activeViewportRef.current) {
        const currentIndex = activeViewportRef.current.getCurrentImageIdIndex();
        const imageIDs = Object.values(updatedImageStack).flat() as string[];
        await activeViewportRef.current.setStack(imageIDs, currentIndex);
        activeViewportRef.current.render();
      }

      setLastLoadedIndex(lastLoadedIndex + Object.keys(newImages).length);
      setIsLoadingMore(false);
    },
    [cacheStack, lastLoadedIndex],
  );

  const loadingFirstFrame = isLoading || !data;

  // Load more images when scrolling near the end
  useEffect(() => {
    if (
      !loadingFirstFrame &&
      !Array.isArray(data[selectedFile.data.fname]) &&
      filteredList.length > lastLoadedIndex &&
      Object.keys(cacheStack).length !== filteredList.length &&
      !multiFrameDisplay
    ) {
      loadMoreImages(filteredList);
    }

    if (!loadingFirstFrame && multiFrameDisplay) {
      loadMultiFrames();
    }
  }, [
    loadingFirstFrame,
    filteredList,
    lastLoadedIndex,
    cacheStack,
    multiFrameDisplay,
    loadMoreImages,
    loadMultiFrames,
    data,
    selectedFile,
  ]);

  // Handle image rendering event
  const handleImageRendered = useCallback(() => {
    if (activeViewportRef.current) {
      const newIndex = activeViewportRef.current.getCurrentImageIdIndex();
      setCurrentImageIndex(newIndex);

      if (
        filteredList &&
        newIndex >= filteredList.length - 5 &&
        fetchMore &&
        !filesLoading &&
        !isLoadingMore &&
        !loadingFirstFrame &&
        !multiFrameDisplay
      ) {
        handlePagination?.();
      }
    }
  }, [
    filteredList,
    fetchMore,
    filesLoading,
    isLoadingMore,
    loadingFirstFrame,
    multiFrameDisplay,
    handlePagination,
  ]);

  // Add event listener for image rendering
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

  const imageCount = multiFrameDisplay
    ? (imageStack[fname] as string[]).length
    : Object.values(imageStack).flat().length;

  return (
    <>
      {loadingFirstFrame && <SpinContainer title="Displaying image..." />}
      <div
        id="content"
        ref={dicomImageRef}
        className={preview === "large" ? "dcm-preview" : ""}
      >
        <div
          style={{
            position: "absolute",
            top: "0.25em",
            right: "0.25em",
            zIndex: 99999,
          }}
        >
          <div style={{ color: "#fff" }}>
            {`Current Index: ${currentImageIndex + 1} (${
              currentImageIndex + 1
            }/${imageCount})`}
          </div>
          {isLoadingMore && (
            <div style={{ color: "#fff" }}>
              <i>Loading more...</i>
            </div>
          )}
        </div>

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
