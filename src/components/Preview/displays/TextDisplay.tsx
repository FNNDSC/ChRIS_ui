import React, { Fragment } from "react";
import type { IFileBlob } from "../../../api/model";
import useSize from "../../FeedTree/useSize";

type AllProps = {
  selectedFile?: IFileBlob;
};

const TextDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const divRef = React.useRef(null);
  const { selectedFile } = props;
  useSize(divRef);

  React.useEffect(() => {
    const textDisplay = document.getElementById("text-display");

    if (textDisplay) {
      const displayContent = async () => {
        if (selectedFile) {
          if (selectedFile.url) {
            try {
              const response = await fetch(selectedFile.url);
              const text = await response.text();
              textDisplay.innerText = text;
            } catch (error) {
              console.error("Failed to fetch text content from URL:", error);
            }
          } else {
            const reader = new FileReader();
            reader.addEventListener(
              "load",
              () => {
                //@ts-ignore
                textDisplay.innerText = reader.result;
              },
              false,
            );
            const blob = await selectedFile.getFileBlob();
            reader.readAsText(blob);
          }
        }
      };

      displayContent();
    }
  }, [selectedFile]);

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

const MemoedTextDisplay = React.memo(TextDisplay);

export default MemoedTextDisplay;
