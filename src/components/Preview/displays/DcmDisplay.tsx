import { useEffect, useState, useRef } from "react";
import {
  FileViewerModel,
  IFileBlob,
  getFileExtension,
} from "../../../api/model";
import {
  displayDicomImage,
  loadDicomImage,
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
  const [cornerstoneInitialized, setCornerstoneInitialized] =
    useState<boolean>(false);
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

  useEffect(() => {
    async function setupCornerstone() {
      const element = document.getElementById(elementId) as HTMLDivElement;
      if (file && blob && element && !cornerstoneInitialized) {
        let imageID: string;
        const extension = getFileExtension(file.data.fname);
        await basicInit();
        setUpTooling(uniqueId);
        if (extension === "dcm") {
          imageID = await loadDicomImage(blob);
        } else {
          const fileviewer = new FileViewerModel();
          const fileName = fileviewer.getFileName(file);
          imageID = `web:${file.url}${fileName}`;
        }

        const { viewport, renderingEngine } = await displayDicomImage(
          element,
          imageID,
          uniqueId,
        );
        setActiveViewport(viewport);
        setRenderingEngine(renderingEngine);
        setCornerstoneInitialized(true); // Mark Cornerstone as initialized
      }
    }

    setupCornerstone();
  }, [file, blob, uniqueId, cornerstoneInitialized, elementId]);

  useEffect(() => {
    if (actionState && activeViewport) {
      handleEvents(actionState, activeViewport);
    }
  }, [actionState, activeViewport]);

  useEffect(() => {
    handleResize();
  }, [size]);

  return (
    <div
      id="content"
      ref={dicomImageRef}
      className={preview === "large" ? "dcm-preview" : ""}
    >
      <div id={elementId} />
    </div>
  );
};

export default DcmDisplay;
