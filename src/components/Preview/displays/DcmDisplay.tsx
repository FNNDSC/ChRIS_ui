import type { RenderingEngine } from "@cornerstonejs/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { type IFileBlob, getFileExtension } from "../../../api/model";
import { SpinContainer } from "../../Common";
import useSize from "../../FeedTree/useSize";
import type { ActionState } from "../FileDetailView";
import {
  events,
  type IStackViewport,
  basicInit,
  cleanupCornerstoneTooling,
  displayDicomImage,
  handleEvents,
  loadDicomImage,
  registerToolingOnce,
  removeTools,
  setUpTooling,
} from "./dicomUtils/utils";

export type DcmImageProps = {
  selectedFile?: IFileBlob;
  actionState: ActionState;
  preview: string;
  list?: IFileBlob[];
  fetchMore?: boolean;
  handlePagination?: () => void;
  filesLoading?: boolean;
};

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const {
    selectedFile,
    actionState,
    preview,
    list,
    fetchMore,
    handlePagination,
    filesLoading,
  } = props;
  const [activeViewport, setActiveViewport] = useState<
    IStackViewport | undefined
  >();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [multiFrameDisplay, setMultiframeDisplay] = useState(false);
  const [imageStack, setImageStack] = useState<string[]>([]);
  const [renderingEngine, setRenderingEngine] = useState<RenderingEngine>();
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastProcessedIndex, setLastProcessedIndex] = useState(0);
  const dicomImageRef = useRef<HTMLDivElement>(null);
  const uniqueId = `${selectedFile?.data.id || v4()}`;
  const elementId = `cornerstone-element-${uniqueId}`;
  const size = useSize(dicomImageRef); // Use the useSize hook with dicomImageRef

  const handleResize = () => {
    // Update the element with elementId when the size of dicomImageRef changes
    if (dicomImageRef.current && size) {
      const parentWidth = size.width;
      const parentHeight = size.height;
      const element = document.getElementById(elementId);
      if (element) {
        element.style.width = `${parentWidth}px`;
        element.style.height = `${parentHeight}px`;
        renderingEngine?.resize(true, true);
        activeViewport?.resize();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    //Global registration needs to happen once
    registerToolingOnce();
    return () => {
      renderingEngine?.destroy();
      removeTools();
      cleanupCornerstoneTooling();
    };
  }, []);

  async function setupCornerstone() {
    const element = document.getElementById(elementId) as HTMLDivElement;
    if (selectedFile) {
      await basicInit();
      setUpTooling(uniqueId);
      const blob = await selectedFile.getFileBlob();
      const imageData = await loadDicomImage(blob);
      const imageID = imageData.imageID;
      const framesCount = imageData.framesCount;
      const newImageStack =
        framesCount > 1
          ? Array.from(
              { length: framesCount },
              (_, i) => `${imageID}?frame=${i}`,
            )
          : [imageID];
      const { viewport, renderingEngine: newRenderingEngine } =
        await displayDicomImage(element, newImageStack[0], uniqueId);
      setMultiframeDisplay(framesCount > 1);
      setActiveViewport(viewport);
      setRenderingEngine(newRenderingEngine);
      setImageStack(newImageStack);
      const currentIndex = list?.findIndex(
        (file) => file.data.fname === selectedFile.data.fname,
      );
      if (currentIndex) {
        const newSet = new Set(loadedIndexes);
        setLoadedIndexes(newSet.add(currentIndex));
        setLastProcessedIndex(currentIndex);
      }
      return selectedFile.data.fname;
    }
  }

  const { isLoading } = useQuery({
    queryKey: ["cornerstone-preview", selectedFile],
    queryFn: () => setupCornerstone(),
    enabled: !!selectedFile,
  });

  useEffect(() => {
    if (actionState && activeViewport) {
      handleEvents(actionState, activeViewport);
    }
  }, [actionState, activeViewport]);

  useEffect(() => {
    handleResize();
  }, [size]);

  const loadImage = async (file: IFileBlob): Promise<string | null> => {
    const fileName = file.data.fname;
    const extension = getFileExtension(fileName);
    if (extension !== "dcm") return null;
    const blob = await file.getFileBlob();
    const imageData = await loadDicomImage(blob);
    return imageData.imageID;
  };

  const loadImagesInDirection = async (
    direction: "forward" | "backward",
    signal: AbortSignal,
  ) => {
    setIsLoadingMore(true);
    if (list && !multiFrameDisplay) {
      const newImageStack = [...imageStack];
      const step = direction === "forward" ? 1 : -1;
      const endCondition = (i: number) =>
        direction === "forward" ? i < list.length : i >= 0;
      const startIndex =
        direction === "forward"
          ? lastProcessedIndex + 1
          : lastProcessedIndex - 1;
      const newLoadedIndexes = new Set(loadedIndexes);
      for (let i = startIndex; endCondition(i) && !signal.aborted; i += step) {
        if (newLoadedIndexes.has(i)) continue;
        const imageID = await loadImage(list[i]);
        if (imageID) {
          if (direction === "forward") {
            newImageStack.push(imageID);
          } else {
            newImageStack.unshift(imageID);
          }
          newLoadedIndexes.add(i);
        }
      }
      setImageStack([...newImageStack]);
      setLoadedIndexes(new Set(newLoadedIndexes));
      setLastProcessedIndex(direction === "forward" ? list.length - 1 : 0);
      if (activeViewport) {
        await activeViewport.setStack(newImageStack, currentImageIndex);
        activeViewport.render();
      }
    }
    setIsLoadingMore(false);
  };

  const loadMoreImages = async (signal: AbortSignal) => {
    if (multiFrameDisplay && activeViewport) {
      await activeViewport.setStack(imageStack);
      activeViewport.render();
    } else {
      await Promise.all([
        loadImagesInDirection("forward", signal),
        loadImagesInDirection("backward", signal),
      ]);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (!isLoading) {
      loadMoreImages(signal);
    }
    return () => {
      controller.abort(); // Abort loading images on unmount
    };
  }, [isLoading, list, multiFrameDisplay]);

  useEffect(() => {
    if (activeViewport && list) {
      const element = activeViewport.element;
      const handleImageRendered = (_event: any) => {
        const newIndex = activeViewport.getCurrentImageIdIndex();
        setCurrentImageIndex(newIndex + 1);
      };
      const handleFetchMoreImages = (_event: any) => {
        if (!multiFrameDisplay) {
          const id = activeViewport.getCurrentImageIdIndex();
          if (
            id >= Math.floor(imageStack.length / 2) &&
            fetchMore &&
            handlePagination &&
            !filesLoading &&
            lastProcessedIndex === list.length - 1
          ) {
            handlePagination();
          }
        }
      };
      element.addEventListener(events.IMAGE_RENDERED, handleImageRendered);
      element.addEventListener(
        events.STACK_VIEWPORT_SCROLL,
        handleFetchMoreImages,
      );
      return () => {
        element.removeEventListener(events.IMAGE_RENDERED, handleImageRendered);
        element.removeEventListener(
          events.STACK_VIEWPORT_SCROLL,
          handleFetchMoreImages,
        );
      };
    }
  }, [
    activeViewport,
    imageStack,
    fetchMore,
    handlePagination,
    multiFrameDisplay,
  ]);

  return (
    <>
      {isLoading && <SpinContainer title="Displaying image..." />}
      <div
        id="content"
        ref={dicomImageRef}
        className={preview === "large" ? "dcm-preview" : ""}
      >
        <div
          style={{
            position: "absolute",
            top: "0.5em",
            left: "0.5em",
            zIndex: "99999",
          }}
        >
          {isLoadingMore ? (
            <i>Loading More Images...</i>
          ) : (
            `Images Loaded: ${currentImageIndex}/${imageStack.length}`
          )}
        </div>

        <div id={elementId} />
      </div>
    </>
  );
};

export default DcmDisplay;
