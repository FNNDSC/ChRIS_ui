import React, { Fragment, useEffect } from "react";
import { IFileBlob } from "../../../api/model";
import useSize from "../../FeedTree/useSize";

type AllProps = {
  fileItem: IFileBlob;
};

const TextDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const divRef = React.useRef(null);
  const { fileItem } = props;
  useSize(divRef);

  useEffect(() => {
    const textDisplay = document.getElementById("text-display");

    const displayContent = async () => {
      if (textDisplay && fileItem.file) {
        try {
          const blob = await fileItem.file.getFileBlob();
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            if (textDisplay instanceof HTMLSpanElement) {
              textDisplay.innerText = reader.result as string;
            }
          });
          reader.readAsText(blob);
        } catch (error) {
          console.error("Error fetching file blob:", error);
        }
      }
    };

    displayContent();
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
            color: "white",
          }}
        />
      </div>
    </Fragment>
  );
};

export default TextDisplay;
