import React, { Fragment } from "react";
import { IFileBlob } from "../../../../api/models/file-viewer.model";
import useSize from "../../FeedTree/useSize";

type AllProps = {
  fileItem: IFileBlob;
};

const TextDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const divRef = React.useRef(null);
  const { fileItem } = props;
  useSize(divRef);

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
        ref={divRef}
        style={{
          display: "block",
          overflowY: "scroll",
          width: "100%",
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
