import * as React from "react";
import { Alert } from "antd";
import { IFileBlob } from "../../../api/model";
import { useTypedSelector } from "../../../store/hooks";
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
} from "../utils";
import useSize from "../../FeedTree/useSize";
import { getFileExtension } from "../../../api/model";

export type DcmImageProps = {
  fileItem: IFileBlob;
  preview?: string;
  actionState: any;
};

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const dicomImageRef = React.useRef<HTMLDivElement>(null);
  const { fileItem, preview } = props;
  const drawerState = useTypedSelector((state) => state.drawers);
  const [error, setError] = React.useState(false);

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
    if (element) {
      enableDOMElement(element);

      let imageId;
      if (getFileExtension(fileItem.file?.data.fname) === "dcm") {
        imageId = loadDicomImage(blob);
      } else {
        imageId = loadJpgImage(blob);
      }
      displayDicomImage(imageId, element, () => {
        setError(true);
      });
    }
  }, []);

  React.useEffect(() => {
    if (fileItem) {
      initAmi(fileItem);
    }
  }, [fileItem, initAmi]);

  return (
    <div className={preview === "large" ? "dcm-preview" : ""}>
      {error ? (
        <Alert
          type="error"
          closable
          onClose={()=>setError(false)}
          description="This file does not have image data. Failed to parse..."
        />
      ) : (
        <div ref={dicomImageRef} id="container"></div>
      )}
    </div>
  );
};

export default DcmDisplay;
