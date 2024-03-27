import * as React from "react";
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
} from "./dicomUtils/utils";
import useSize from "../../FeedTree/useSize";
import { type ActionState } from "../FileDetailView";
import { _loadImageIntoBuffer } from "./dicomUtils/webImageLoader";

export type DcmImageProps = {
  fileItem: IFileBlob;
  preview?: string;
  actionState: ActionState;
};

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const { fileItem, preview, actionState } = props;
  const { file, blob } = fileItem;

  const [activeViewport, setActiveViewport] = React.useState<
    IStackViewport | undefined
  >();
  const [cornerstoneInitialized, setCornerstoneInitialized] =
    React.useState<boolean>(false);
  const dicomImageRef = React.useRef(null);

  const uniqueId = `${file?.data.id}`;
  const elementId = `cornerstone-element-${uniqueId}`;

  useSize(dicomImageRef);

  React.useEffect(() => {
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

        const activeViewport = await displayDicomImage(
          element,
          imageID,
          uniqueId,
        );
        setActiveViewport(activeViewport);
        setCornerstoneInitialized(true); // Mark Cornerstone as initialized
      }
    }

    setupCornerstone();
  }, [file, blob, uniqueId, cornerstoneInitialized, elementId]);

  React.useEffect(() => {
    if (actionState && activeViewport) {
      handleEvents(actionState, uniqueId, activeViewport);
    }
  }, [actionState, activeViewport, uniqueId]);

  const style = {
    height: "100%",
    width: "100%",
  };

  return (
    <div id="content" className={preview === "large" ? "dcm-preview" : ""}>
      <div id={elementId} style={style} ref={dicomImageRef} />
    </div>
  );
};

export default DcmDisplay;
