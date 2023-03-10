import * as React from "react";
import { IFileBlob } from "../../../../api/models/file-viewer.model";
import {
  handleEventState,
  enableDOMElement,
  loadDicomImage,
  displayDicomImage,
  windowResize,
} from "../../../detailedView/displays/DicomViewer/utils";

export type DcmImageProps = {
  fileItem: IFileBlob;
  preview?: string;
  actionState: any;
};

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const dicomImageRef = React.useRef<HTMLDivElement>(null);
  const { fileItem, preview } = props;

  const onWindowResize = () => {
    const element = dicomImageRef.current;
    if (element) {
      windowResize(element);
    }
  };

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
      handleEventState(event, value);
    }

    if (event === "Wwwc") {
      handleEventState(event, value);
    }

    if (event === "Reset View") {
      /*
      cornerstoneTools.clearToolState(dicomImageRef.current, "Length");
      cornerstone.reset(dicomImageRef.current);
      setDicomState((dicomState) => {
        return {
          ...dicomState,
          gallery: false,
        };
      });
      */
    }

    if (event === "Length") {
      handleEventState(event, value);
    }

    if (event === "Gallery") {
      /*
      cornerstone.reset(dicomImageRef.current);
      setDicomState((dicomState) => {
        return {
          ...dicomState,
          gallery: value,
        };
      });
      */
    }

    if (event === "TagInfo") {
      //  handleModalToggle(value);
    }
  }, []);

  React.useEffect(() => {
    if (props.actionState) {
      const event = Object.keys(props.actionState)[0];
      handleEvents(event, props.actionState[event]);
    }
  }, [props.actionState, handleEvents]);

  const initAmi = React.useCallback((fileItem: IFileBlob) => {
    const { blob } = fileItem;
    const element = dicomImageRef.current;
    if (!!element) {
      enableDOMElement(element);
      const imageId = loadDicomImage(blob);
      displayDicomImage(imageId, element);
      window.addEventListener("resize", onWindowResize);
    }
  }, []);

  React.useEffect(() => {
    if (!!fileItem) {
      initAmi(fileItem);
    }
  }, [fileItem, initAmi]);

  return (
    <div className={preview === "large" ? "dcm-preview" : ""}>
      <div ref={dicomImageRef} id="container">
        <div id="dicomImageWebGL"></div>
      </div>
    </div>
  );
};

export default DcmDisplay;
