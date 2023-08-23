import React, { Fragment } from "react";
import { IFileBlob } from "../../../../api/models/file-viewer.model";
type AllProps = {
  fileItem: IFileBlob;
};

const TextDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;

  React.useEffect(() => {
    const textDisplay = document.getElementById("text-display");
    if (textDisplay) {
      const reader = new FileReader();

      reader.addEventListener(
        "load",
        () => {
          //@ts-ignore
          textDisplay.innerText = reader.result;
        },
        false
      );

      if (fileItem.blob) {
        reader.readAsText(fileItem.blob);
      }
    }
  }, [fileItem]);

  return (
    <Fragment>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "1rem",
          color: "white",
        }}
        id="text-display"
      ></div>
    </Fragment>
  );
};

export default React.memo(TextDisplay);
