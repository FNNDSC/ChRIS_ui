import * as React from "react";
import { IFileBlob } from "../../../../api/models/file-viewer.model";
import { useTypedSelector } from "../../../../store/hooks";
import {
  handleEventState,
  enableDOMElement,
  loadDicomImage,
  displayDicomImage,
  windowResize,
  resetDicomSettings,
  loadJpgImage,
  handleRotate,
  handleScale,
} from "../../../detailedView/displays/DicomViewer/utils";
import useSize from "../../FeedTree/useSize";
import { getFileExtension } from "../../../../api/models/file-explorer.model";

export type DcmImageProps = {
  fileItem: IFileBlob;
  preview?: string;
  actionState: any;
};

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const dicomImageRef = React.useRef<HTMLDivElement>(null);
  const { fileItem, preview } = props;
  const drawerState = useTypedSelector((state) => state.drawers);

  useSize(dicomImageRef);
  const onWindowResize = () => {
    const element = dicomImageRef.current;

    if (element) {
      windowResize(element);
    }
  };

  if (
    drawerState["preview"].maximized === true ||
    (drawerState["preview"].maximized === false &&
      drawerState["preview"].open === true)
  ) {
    onWindowResize();
  }

  const handleEvents = React.useCallback((event: string, value: boolean) => {
    if (event === "Zoom") {
      handleEventState(event, value);
    }

    if (event === "Pan") {
      handleEventState(event, value);
    }
    if (event === "Magnify") {
      handleEventState(event, value);
    }

    if (event === "Rotate") {
      if (dicomImageRef.current) {
        handleRotate(dicomImageRef.current);
      }
    }

    if (event === "Wwwc") {
      handleEventState(event, value);
    }

    if (event === "Reset View") {
      if (dicomImageRef.current) {
        resetDicomSettings(dicomImageRef.current);
      }
    }

    if (event === "Length") {
      handleEventState(event, value);
    }
  }, []);

  React.useEffect(() => {
    if (props.actionState) {
      const event = Object.keys(props.actionState)[0];
      handleEvents(event, props.actionState[event]);
    }
  }, [props.actionState, handleEvents]);

  const handleEventsThroughKeys = (event: any) => {
    console.log("Event", event);
    switch (event.key) {
      case "ArrowDown": {
        if (dicomImageRef.current) handleRotate(dicomImageRef.current);
        break;
      }

      case "+": {
        if (dicomImageRef.current) handleScale(dicomImageRef.current, "+");
        break;
      }

      case "-": {
        if (dicomImageRef.current) handleScale(dicomImageRef.current, "-");
        break;
      }

      case "r": {
        if (dicomImageRef.current) resetDicomSettings(dicomImageRef.current);
        break;
      }
      default:
        break;
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleEventsThroughKeys);
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("keydown", handleEventsThroughKeys);
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  const initAmi = React.useCallback((fileItem: IFileBlob) => {
    const { blob } = fileItem;
    const element = dicomImageRef.current;
    if (!!element) {
      enableDOMElement(element);

      let imageId;
      if (getFileExtension(fileItem.file?.data.fname) === "dcm") {
        imageId = loadDicomImage(blob);
      } else {
        imageId = loadJpgImage(blob);
      }
      displayDicomImage(imageId, element);
    }
  }, []);

  React.useEffect(() => {
    if (!!fileItem) {
      initAmi(fileItem);
    }
  }, [fileItem, initAmi]);

  return (
    <div className={preview === "large" ? "dcm-preview" : ""}>
      <div ref={dicomImageRef} id="container"></div>
    </div>
  );
};

export default DcmDisplay;
