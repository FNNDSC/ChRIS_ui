import type { RenderingEngine } from "@cornerstonejs/core";
import type { FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import {
  FileViewerModel,
  type IFileBlob,
  getFileExtension,
} from "../../../api/model";
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
  const [imageStack, setImageStack] = useState<string[]>([]);
  const [renderingEngine, setRenderingEngine] = useState<RenderingEngine>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
      let imageID: string;
      const extension = getFileExtension(selectedFile.data.fname);
      await basicInit();
      setUpTooling(uniqueId);
      if (extension === "dcm") {
        const blob = await selectedFile.getFileBlob();
        imageID = await loadDicomImage(blob);
      } else {
        // Code to view png and jpg file types in cornerstone. Currently we are using the default image display so this code is redundant.
        // This code should be deleted in the future.
        const fileviewer = new FileViewerModel();
        const fileName = fileviewer.getFileName(
          selectedFile as FileBrowserFolderFile,
        );
        imageID = `web:${selectedFile.url}${fileName}`;
      }
      const { viewport, renderingEngine: newRenderingEngine } =
        await displayDicomImage(element, imageID, uniqueId);
      setActiveViewport(viewport);
      setRenderingEngine(newRenderingEngine);
      setImageStack([imageID]);

      return selectedFile.data.fname;
    }
  }

  const { isLoading } = useQuery({
    queryKey: ["cornerstone-preview", selectedFile],
    queryFn: () => setupCornerstone(),
    refetchOnMount: true,
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
    const newImageStack = [...imageStack];
    if (list) {
      for (const file of list.slice(imageStack.length)) {
        if (signal.aborted) {
          setIsLoadingMore(false);
          return;
        }
        const blob = await file.getFileBlob();
        const imageId = await loadDicomImage(blob); // Load and generate the image ID
        newImageStack.push(imageId); // Add the new image ID to the stack
      }
      setImageStack(newImageStack);

      if (activeViewport) {
        const currentIndex = activeViewport.getCurrentImageIdIndex();
        await activeViewport.setStack(newImageStack, currentIndex);
        activeViewport.render();
      }
    }
    setIsLoadingMore(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (list) {
      if (
        imageStack.length > 0 &&
        imageStack.length !== list.length &&
        activeViewport
      ) {
        loadMoreImages(signal);
      }
    }

    return () => {
      controller.abort(); // Abort loading images on unmount
    };
  }, [list, fetchMore, activeViewport]);

  useEffect(() => {
    if (activeViewport && list) {
      const element = activeViewport.element;

      const handleImageRendered = (_event: any) => {
        const newIndex = activeViewport.getCurrentImageIdIndex();
        setCurrentImageIndex(newIndex + 1);
      };

      const handleFetchMoreImages = (_event: any) => {
        const id = activeViewport.getCurrentImageIdIndex();
        if (
          id >= Math.floor(imageStack.length / 2) &&
          list.length === imageStack.length &&
          fetchMore &&
          handlePagination &&
          !filesLoading &&
          !isLoadingMore
        ) {
          handlePagination();
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
  }, [activeViewport, imageStack, fetchMore, handlePagination]);

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
