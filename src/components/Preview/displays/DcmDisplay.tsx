import { useEffect, useState, useRef } from "react";
import { IFileBlob, getFileExtension } from "../../../api/model";
import {
  displayDicomImage,
  basicInit,
  handleEvents,
  type IStackViewport,
  setUpTooling,
  cleanupCornerstoneTooling,
  registerToolingOnce,
  removeTools,
} from "./dicomUtils/utils";
import useSize from "../../FeedTree/useSize";
import { type ActionState } from "../FileDetailView";
import { _loadImageIntoBuffer } from "./dicomUtils/webImageLoader";
import { RenderingEngine } from "@cornerstonejs/core";
import { v4 } from "uuid";
import { useQuery } from "@tanstack/react-query";
import { SpinContainer } from "../../Common";

export type DcmImageProps = {
  fileItem: IFileBlob;
  preview?: string;
  actionState: ActionState;
};

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const { fileItem, preview, actionState } = props;
<<<<<<< HEAD
  const { file, blob } = fileItem;
=======
  const { file, url } = fileItem;

>>>>>>> dab5c0e2 (feat: rebase)
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

<<<<<<< HEAD
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
        const fileName = fileviewer.getFileName(file);
        imageID = `web:${file.url}${fileName}`;
=======
  useEffect(() => {
    async function setupCornerstone() {
      const element = document.getElementById(elementId) as HTMLDivElement;
      if (file && url && element && !cornerstoneInitialized) {
        let imageID: string;
        const extension = getFileExtension(file.data.fname);
        await basicInit();
        setUpTooling(uniqueId);
        if (extension === "dcm") {
          imageID = "wadouri:" + url;
        } else {
          imageID = `web:${url}`;
        }

        const { viewport, renderingEngine } = await displayDicomImage(
          element,
          imageID,
          uniqueId,
        );
        setActiveViewport(viewport);
        setRenderingEngine(renderingEngine);
        setCornerstoneInitialized(true); // Mark Cornerstone as initialized
>>>>>>> dab5c0e2 (feat: rebase)
      }
      const { viewport, renderingEngine: newRenderingEngine } =
        await displayDicomImage(element, imageID, uniqueId);
      setActiveViewport(viewport);
      setRenderingEngine(newRenderingEngine);
      return file.data.fname;
    }
  }

<<<<<<< HEAD
  const { isLoading } = useQuery({
    queryKey: ["cornerstone-preview", file, blob],
    queryFn: () => setupCornerstone(),
    refetchOnMount: true,
  });
=======
    setupCornerstone();
  }, [file, url, uniqueId, cornerstoneInitialized, elementId]);
>>>>>>> dab5c0e2 (feat: rebase)

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
