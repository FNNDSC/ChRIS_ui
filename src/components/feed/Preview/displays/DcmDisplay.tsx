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
} from "../../../detailedView/displays/DicomViewer/utils";
import useSize from "../../FeedTree/useSize";

export type DcmImageProps = {
  fileItem: IFileBlob;
  preview?: string;
  actionState: any;
};

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const dicomImageRef = React.useRef<HTMLDivElement>(null);
  const { fileItem, preview } = props;
  const drawerState = useTypedSelector((state) => state.drawers);
  const size = useSize(dicomImageRef);
  const onWindowResize = () => {
    const element = dicomImageRef.current;
    console.log("window resize called");
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
      handleEventState(event, value);
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

  const initAmi = React.useCallback((fileItem: IFileBlob) => {
    const { blob } = fileItem;
    const element = dicomImageRef.current;
    if (!!element) {
      enableDOMElement(element);
      const imageId = loadDicomImage(blob);
      displayDicomImage(imageId, element);
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  });

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
