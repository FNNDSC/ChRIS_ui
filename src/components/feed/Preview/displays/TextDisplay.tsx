import React, { Fragment } from "react";
import { IFileBlob } from "../../../../api/models/file-viewer.model";

type AllProps = {
  fileItem: IFileBlob;
};

const TextDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const [divHeight, setDivHeight] = React.useState("auto");
  const divRef = React.useRef(null);

  const { fileItem } = props;

  React.useEffect(() => {
    const resizeDiv = () => {
      if (divRef.current) {
        //@ts-ignore
        const newHeight = `${divRef.current.scrollHeight}px`;
        setDivHeight(newHeight);
      }
    };

    // Initially, calculate the height
    resizeDiv();

    // Listen for changes in content and recalculate the height
    window.addEventListener("resize", resizeDiv);

    return () => {
      // Clean up the event listener when the component unmounts
      window.removeEventListener("resize", resizeDiv);
    };
  });

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
          height: divHeight,
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
