import { Text } from "@patternfly/react-core";
import React, { useState, useContext, useEffect, useRef } from "react";
import ReactJSON from "@microlink/react-json-view";
import type { IFileBlob } from "../../../api/model";
import { ThemeContext } from "../../DarkTheme/useTheme";

type AllProps = {
  selectedFile?: IFileBlob;
};

const JsonDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const isDarkTheme = useContext(ThemeContext);
  const [blobText, setBlobText] = useState({});
  const { selectedFile } = props;

  useEffect(() => {
    async function getBlobText() {
      const reader = new FileReader();
      reader.addEventListener("loadend", (e: any) => {
        const blobText = e.target.result;
        setBlobText(JSON.parse(blobText));
      });
      const blob = await selectedFile?.getFileBlob();
      blob && reader.readAsText(blob);
    }
    if (selectedFile) {
      getBlobText();
    }
  }, [selectedFile]);

  return (
    <>
      {blobText ? (
        <ReactJSON
          theme={isDarkTheme ? "grayscale" : "tomorrow"}
          name={false}
          displayDataTypes={false}
          src={blobText}
          displayObjectSize={false}
          collapsed={false}
        />
      ) : (
        <Text component="p">Could not load json payload at the moment....</Text>
      )}
    </>
  );
};

const MemoedJsonDisplay = React.memo(JsonDisplay);

export default MemoedJsonDisplay;
