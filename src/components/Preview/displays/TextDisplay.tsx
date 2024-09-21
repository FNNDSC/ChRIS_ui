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
          const reader = new FileReader();
          reader.addEventListener(
            "load",
            () => {
              textDisplay.innerText = reader.result as string;
            },
            false,
          );
          const blob = await selectedFile.getFileBlob();
          reader.readAsText(blob);
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
