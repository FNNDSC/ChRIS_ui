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
          display: "block",
          padding: "15px",
          width: "100%",
          height: "350px",
          overflowY: "scroll",
        }}
      >
        <span
          id="text-display"
          style={{
            fontFamily: "monospace",
            fontSize: "1rem",
            color: "white",
          }}
        ></span>
      </div>
    </Fragment>
  );
};

export default React.memo(TextDisplay);
