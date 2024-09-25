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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalImagesProcessed, setTotalImagesProcessed] = useState(0);
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
      setTotalImagesProcessed(1);
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

  const loadMoreImages = async (signal: AbortSignal) => {
    setIsLoadingMore(true);
    if (list && !multiFrameDisplay) {
      if (
        imageStack.length > 0 &&
        imageStack.length !== list.length &&
        activeViewport
      ) {
        // Find the index of the current image ID in the list
        const currentImageIndexInList = list.findIndex((file) => {
          return file.data.fname === selectedFile?.data.fname;
        });
        console.log("List", list, currentImageIndexInList);
        const filesToLoad = [
          ...list.slice(0, currentImageIndexInList), // Files before the current image
          ...list.slice(currentImageIndexInList + 1), // Files after the current image
        ];
        console.log("filestoLoad", filesToLoad);
        const newImageStack = [...imageStack];
        let imagesProcessed = totalImagesProcessed;
        for (const file of filesToLoad) {
          imagesProcessed += 1;
          if (signal.aborted) {
            setIsLoadingMore(false);
            return;
          }
          const extension = getFileExtension(file.data.fname);
          if (extension !== "dcm") {
            continue;
          }
          const blob = await file.getFileBlob();
          const imageData = await loadDicomImage(blob); // Load and generate the image ID
          const imageID = imageData.imageID;
          newImageStack.push(imageID); // Add the new image ID to the stack
        }
        setImageStack(newImageStack);
        setTotalImagesProcessed(imagesProcessed);
        if (activeViewport) {
          const currentIndex = activeViewport.getCurrentImageIdIndex();
          await activeViewport.setStack(newImageStack, currentIndex);
          activeViewport.render();
        }
      }
    } else if (multiFrameDisplay && activeViewport) {
      await activeViewport.setStack(imageStack);
      activeViewport.render();
    }
    setIsLoadingMore(false);
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
          console.log(
            id >= Math.floor(imageStack.length / 2) &&
              fetchMore &&
              handlePagination &&
              !filesLoading &&
              totalImagesProcessed === list.length,
            "TotalImagesProcessed",
            totalImagesProcessed,
          );
          if (
            id >= Math.floor(imageStack.length / 2) &&
            fetchMore &&
            handlePagination &&
            !filesLoading
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
