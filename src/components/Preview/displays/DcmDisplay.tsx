import * as React from "react";
import { IFileBlob, getFileExtension } from "../../../api/model";
import {
  displayDicomImage,
  loadDicomImage,
  loadJPGImage,
  basicInit,
  handleEvents,
  type IStackViewport,
} from "../utils";
import useSize from "../../FeedTree/useSize";
import { type ActionState } from "../FileDetailView";

export type DcmImageProps = {
  fileItem: IFileBlob;
  preview?: string;
  actionState: ActionState;
};

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const { fileItem, preview, actionState } = props;
  const { file, blob } = fileItem;
  const dicomImageRef = React.useRef<HTMLDivElement>(null);
  const [activeViewport, setActiveViewport] = React.useState<
    IStackViewport | undefined
  >();

  useSize(dicomImageRef);

  React.useEffect(() => {
    async function setupCornerstone() {
      const element = dicomImageRef.current;
      if (file && blob && element) {
        let imageID: string;
        const extension = getFileExtension(file.data.fname);
        await basicInit();
        if (extension === "dcm") {
          imageID = await loadDicomImage(blob);
        } else {
          imageID = loadJPGImage(blob);
        }
        const activeViewport = await displayDicomImage(element, imageID);
        setActiveViewport(activeViewport);
      }
    }

    setupCornerstone();
  }, [file, blob]);

  React.useEffect(() => {
    if (actionState) {
      handleEvents(actionState, activeViewport);
    }
  }, [actionState, activeViewport]);

  const style = {
    height: "100%",
    width: "100%",
  };

  return (
    <div id="content" className={preview === "large" ? "dcm-preview" : ""}>
      <div id="cornerstone-element" style={style} ref={dicomImageRef} />{" "}
    </div>
  );
};

export default DcmDisplay;
