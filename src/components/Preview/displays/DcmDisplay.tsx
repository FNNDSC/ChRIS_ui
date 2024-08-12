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
import { _loadImageIntoBuffer } from "./dicomUtils/webImageLoader";

export type DcmImageProps = {
  fileItem: IFileBlob;
  preview?: string;
  actionState: ActionState;
};

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const { fileItem, preview, actionState } = props;
  const { file, blob } = fileItem;
  const [activeViewport, setActiveViewport] = useState<
    IStackViewport | undefined
  >();
  const [renderingEngine, setRenderingEngine] = useState<RenderingEngine>();

  const dicomImageRef = useRef<HTMLDivElement>(null);
  const uniqueId = `${file?.data.id || v4()}`;
  const elementId = `cornerstone-element-${uniqueId}`;
  const size = useSize(dicomImageRef); // Use the useSize hook with dicomImageRef

  const handleResize = () => {
    // Update the element with elementId when the size of dicomImageRef changes
    if (dicomImageRef.current && size) {
      //@ts-ignore
      const parentWidth = size.width;
      //@ts-ignore
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
      removeTools();
      cleanupCornerstoneTooling();
    };
  }, []);

  async function setupCornerstone() {
    const element = document.getElementById(elementId) as HTMLDivElement;
    if (file && blob) {
      let imageID: string;
      const extension = getFileExtension(file.data.fname);
      renderingEngine?.destroy();
      await basicInit();
      setUpTooling(uniqueId);
      if (extension === "dcm") {
        imageID = await loadDicomImage(blob);
      } else {
        const fileviewer = new FileViewerModel();
        const fileName = fileviewer.getFileName(file as FileBrowserFolderFile);
        imageID = `web:${file.url}${fileName}`;
      }
      const { viewport, renderingEngine: newRenderingEngine } =
        await displayDicomImage(element, imageID, uniqueId);
      setActiveViewport(viewport);
      setRenderingEngine(newRenderingEngine);
      return file.data.fname;
    }
  }

  const { isLoading } = useQuery({
    queryKey: ["cornerstone-preview", file, blob],
    queryFn: () => setupCornerstone(),
    refetchOnMount: true,
  });

  useEffect(() => {
    if (actionState && activeViewport) {
      handleEvents(actionState, activeViewport);
    }
  }, [actionState, activeViewport]);

  useEffect(() => {
    handleResize();
  }, [size]);

  return (
    <>
      {isLoading && <SpinContainer title="Displaying image..." />}
      <div
        id="content"
        ref={dicomImageRef}
        className={preview === "large" ? "dcm-preview" : ""}
      >
        <div id={elementId} />
      </div>
    </>
  );
};

export default DcmDisplay;
