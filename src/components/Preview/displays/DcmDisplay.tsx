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
  ImageId,
  prepareNifti,
} from "../utils";
import useSize from "../../FeedTree/useSize";
import { getFileExtension } from "../../../api/model";
import { SpinContainer } from "../../Common";

export type DcmImageProps = {
  fileItem: IFileBlob;
  preview?: string;
  actionState: any;
};

prepareNifti();

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const dicomImageRef = React.useRef<HTMLDivElement>(null);
  const { fileItem, preview } = props;
  const drawerState = useTypedSelector((state) => state.drawers);
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [sliceInfo, setSliceInfo] = React.useState({
    currentSliceIndex: 0,
    totalSlices: 0,
  });

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
    const { blob, file } = fileItem;
    const element = dicomImageRef.current;

    let imageId: string | any;

    if (element && file) {
      try {
        setLoading(true);
        enableDOMElement(element);

        const fileExtension = getFileExtension(file.data.fname);
        const isNifti = fileExtension === "nii" || fileExtension === "nii.gz";

        if (fileExtension && fileExtension === "dcm") {
          imageId = loadDicomImage(blob);
        } else if (fileExtension && isNifti) {
          const fileArray = file.data.fname.split("/");
          const fileName = fileArray[fileArray.length - 1];
          const imageIdObject = ImageId.fromURL(`nifti:${file.url}${fileName}`);
          imageId = imageIdObject;
        } else {
          imageId = loadJpgImage(blob);
        }

        displayDicomImage(
          imageId,
          element,
          fileExtension,
          () => {
            setError(true);
          },
          () => {
            setLoading(false);
          },
          (currentSliceIndex: number, totalSlices: number) => {
            setSliceInfo({
              currentSliceIndex,
              totalSlices,
            });
          },
        );
      } catch (error: any) {
        console.log("Error", error);
        // Handle the error as needed
        setError(true);
      }
    }
  }, []);

  React.useEffect(() => {
    if (fileItem) {
      initAmi(fileItem);
    }
  }, [fileItem, initAmi]);

  return (
    <>
      <div
        ref={dicomImageRef}
        className={preview === "large" ? "dcm-preview" : ""}
      >
        {" "}
        {sliceInfo.currentSliceIndex > 0 && sliceInfo.totalSlices > 0 && (
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              padding:'0.5em'
            }}
          >
            {sliceInfo.currentSliceIndex}/{sliceInfo.totalSlices}
          </div>
        )}
        {error ? (
          <Alert
            type="error"
            closable
            onClose={() => setError(false)}
            description="This file does not have image data. Failed to parse..."
          />
        ) : loading ? (
          <SpinContainer title="Processing the file using cornerstone..." />
        ) : (
          <div id="container"></div>
        )}
      </div>
    </>
  );
};

export default DcmDisplay;
