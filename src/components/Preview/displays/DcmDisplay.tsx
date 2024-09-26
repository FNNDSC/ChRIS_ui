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
  loadDicomImage,
  registerToolingOnce,
  removeTools,
  setUpTooling,
} from "./dicomUtils/utils";
import { handleEvents } from "./dicomUtils/utils";

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
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [lastProcessedIndex, setLastProcessedIndex] = useState(0); // Track last processed file index

  const dicomImageRef = useRef<HTMLDivElement>(null);
  const uniqueId = `${selectedFile?.data.id || v4()}`;
  const elementId = `cornerstone-element-${uniqueId}`;
  const size = useSize(dicomImageRef);

  const handleResize = () => {
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
  }, [size, renderingEngine, activeViewport]);

  useEffect(() => {
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
      setIsLoadingImages(false);
      return selectedFile.data.fname;
    }
  }

  const { isLoading } = useQuery({
    queryKey: ["cornerstone-preview", selectedFile],
    queryFn: setupCornerstone,
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

  async function* imageBatchGenerator(
    start: number,
    end: number,
    skipIndex: number,
  ) {
    if (list) {
      for (let i = start; i < end; i++) {
        // Skip already loaded file
        if (i === skipIndex) continue;

        const file = list[i];
        if (file) {
          const imageID = await loadImage(file);
          if (imageID) {
            yield imageID; // Yield the image ID one by one
          }
        }
      }
    }
  }

  const loadImagesInBatches = async (
    start: number,
    end: number,
    skipIndex: number,
  ) => {
    const generator = imageBatchGenerator(start, end, skipIndex);
    const newImageStack: string[] = []; // Temporary stack to hold new images

    for await (const newImage of generator) {
      newImageStack.push(newImage);
    }

    // Once all images are loaded, update the imageStack and the viewport
    setImageStack((prevStack) => {
      const updatedStack = [...prevStack, ...newImageStack];

      // Update the viewport with the entire stack
      if (activeViewport) {
        const currentIndex = activeViewport.getCurrentImageIdIndex();
        activeViewport.setStack(updatedStack, currentIndex);
        activeViewport.render();
      }

      return updatedStack; // Update the state with the full stack
    });
  };

  const loadAllImages = async () => {
    if (list && !multiFrameDisplay && !isLoading) {
      const selectedIndex = list.findIndex(
        (file) => file.data.fname === selectedFile?.data.fname,
      );
      await loadImagesInBatches(lastProcessedIndex, list.length, selectedIndex);
      setLastProcessedIndex(list.length); // Update the last processed index
    }
  };

  const loadMultiFrames = async () => {
    if (activeViewport) {
      const currentIndex = activeViewport.getCurrentImageIdIndex();
      await activeViewport.setStack(imageStack, currentIndex);
      activeViewport.render();
    }
  };

  useEffect(() => {
    if (list && !multiFrameDisplay) {
      loadAllImages();
    } else if (multiFrameDisplay) {
      loadMultiFrames();
    }
  }, [isLoading, list, activeViewport, multiFrameDisplay]);

  useEffect(() => {
    if (
      list &&
      fetchMore &&
      handlePagination &&
      !filesLoading &&
      lastProcessedIndex === list.length - 1
    ) {
      handlePagination();
    }
  }, [fetchMore, handlePagination, filesLoading]);

  useEffect(() => {
    if (activeViewport && list && handlePagination) {
      const element = activeViewport.element;
      const handleImageRendered = () => {
        const newIndex = activeViewport.getCurrentImageIdIndex();
        setCurrentImageIndex(newIndex + 1);
        if (newIndex >= list.length - 5 && fetchMore && !filesLoading) {
          handlePagination();
        }
      };
      element.addEventListener(events.IMAGE_RENDERED, handleImageRendered);
      return () => {
        element.removeEventListener(events.IMAGE_RENDERED, handleImageRendered);
      };
    }
  }, [activeViewport, imageStack, fetchMore, filesLoading]);

  return (
    <>
      {(isLoading || isLoadingImages) && (
        <SpinContainer title="Displaying image..." />
      )}
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
          {`Images Loaded: ${currentImageIndex}/${imageStack.length}`}
        </div>
        <div id={elementId} />
      </div>
    </>
  );
};

export default DcmDisplay;
