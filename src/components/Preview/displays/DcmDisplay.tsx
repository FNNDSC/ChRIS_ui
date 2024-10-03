import type { RenderingEngine } from "@cornerstonejs/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, useMemo } from "react";
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
    list = [], // Default to empty array
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

  // Filter the list to include only DICOM files
  const filteredList: IFileBlob[] = useMemo(
    () =>
      list.filter(
        (file) => getFileExtension(file.data.fname).toLowerCase() === "dcm",
      ),
    [list],
  );

  const loadMultiFrames = async () => {
    if (activeViewport) {
      const currentIndex = activeViewport.getCurrentImageIdIndex();
      await activeViewport.setStack(imageStack, currentIndex);
      activeViewport.render();
    }
  };

  const loadImage = async (file: IFileBlob): Promise<string | null> => {
    const fileName = file.data.fname;
    const extension = getFileExtension(fileName);
    if (extension !== "dcm") return null;
    const blob = await file.getFileBlob();
    const imageData = await loadDicomImage(blob);
    return imageData.imageID;
  };

  const loadImagesInBatches = async (
    start: number,
    end: number,
    skipIndex: number,
    abortSignal: AbortSignal,
  ) => {
    setIsLoadingMore(true);
    const generator = imageBatchGenerator(start, end, skipIndex, abortSignal);
    const newImageStack: string[] = []; // Temporary stack to hold new images
    try {
      for await (const newImage of generator) {
        if (abortSignal.aborted) {
          setIsLoadingMore(false);
          break; // Exit the loop if the signal is aborted
        }
        newImageStack.push(newImage);
      }

      // Update the image stack synchronously
      setImageStack((prevStack) => [...prevStack, ...newImageStack]);

      // Handle the async viewport operations separately
      if (activeViewport) {
        const currentIndex = activeViewport.getCurrentImageIdIndex();

        // Await async calls outside of the setState
        await activeViewport.setStack(
          [...imageStack, ...newImageStack],
          currentIndex > 0 ? currentIndex : skipIndex,
        );
        currentIndex === 0 && (await activeViewport.setImageIdIndex(skipIndex));
        activeViewport.render();
        setIsLoadingMore(false);
      }
    } catch (err) {
      setIsLoadingMore(false);
      if (abortSignal.aborted) {
      } else {
        console.error("Error loading images:", err);
      }
    }
  };

  async function* imageBatchGenerator(
    start: number,
    end: number,
    skipIndex: number,
    abortSignal: AbortSignal, // Include abort signal
  ) {
    for (let i = start; i < end; i++) {
      if (abortSignal.aborted) {
        return; // Exit the generator early if aborted
      }

      if (i === skipIndex) continue;

      const file = filteredList[i];
      if (file) {
        const imageID = await loadImage(file);
        if (imageID) {
          yield imageID; // Yield the image ID one by one
        }
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    setLastProcessedIndex(0);
    if (!isLoading && filteredList && !multiFrameDisplay) {
      const selectedIndex = filteredList.findIndex(
        (file) => file.data.fname === selectedFile?.data.fname,
      );
      loadImagesInBatches(
        lastProcessedIndex,
        filteredList.length,
        selectedIndex,
        abortController.signal,
      );
      setLastProcessedIndex(filteredList.length);
    } else if (multiFrameDisplay) {
      loadMultiFrames();
    }

    return () => {
      abortController.abort(); // Cleanup: abort the ongoing image loading process if the component unmounts
    };
  }, [
    isLoading,
    filteredList,
    activeViewport,
    multiFrameDisplay,
    selectedFile,
  ]);

  useEffect(() => {
    if (
      filteredList &&
      fetchMore &&
      handlePagination &&
      !filesLoading &&
      lastProcessedIndex === filteredList.length - 1
    ) {
      handlePagination();
    }
  }, [
    fetchMore,
    filteredList,
    lastProcessedIndex,
    handlePagination,
    filesLoading,
  ]);

  useEffect(() => {
    if (activeViewport && filteredList && handlePagination) {
      const element = activeViewport.element;
      const handleImageRendered = () => {
        const newIndex = activeViewport.getCurrentImageIdIndex();
        setCurrentImageIndex(newIndex);
        if (newIndex >= filteredList.length - 5 && fetchMore && !filesLoading) {
          handlePagination();
        }
      };
      element.addEventListener(events.IMAGE_RENDERED, handleImageRendered);
      return () => {
        element.removeEventListener(events.IMAGE_RENDERED, handleImageRendered);
      };
    }
  }, [fetchMore, handlePagination, filesLoading, filteredList, activeViewport]);

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
            top: "0.25em",
            right: "0.25em",
            zIndex: "99999",
          }}
        >
          <div style={{ color: "#fff" }}>
            {`Current Index: ${currentImageIndex + 1} (${currentImageIndex + 1}/${imageStack.length})`}
          </div>
          {isLoadingMore && (
            <div style={{ color: "#fff" }}>
              <i>Loading more...</i>
            </div>
          )}
        </div>

        <div id={elementId} />
      </div>
    </>
  );
};

export default DcmDisplay;
