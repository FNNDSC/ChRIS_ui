import React, { useState, useContext, useEffect, useCallback } from "react";
import ReactJSON from "react-json-view";
import { IFileBlob } from "../../../api/model";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { SpinContainer } from "../../Common";

type AllProps = {
  fileItem: IFileBlob;
};

const JsonDisplay: React.FunctionComponent<AllProps> = ({
  fileItem,
}: AllProps) => {
  const isDarkTheme = useContext(ThemeContext);
  const [blobText, setBlobText] = useState<any>(null); // Update with correct initial state type

  const getBlobText = useCallback(async () => {
    const { file } = fileItem;
    if (file) {
      try {
        const blob = await file.getFileBlob();
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          const blobText = e.target.result;
          setBlobText(JSON.parse(blobText));
        });
        reader.readAsText(blob);
      } catch (error) {
        console.error("Error reading file blob:", error);
        setBlobText(null);
      }
    }
  }, [fileItem.url]);

  useEffect(() => {
    getBlobText();
  }, [getBlobText]);

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
        <SpinContainer title="Fetching json..." />
      )}
    </>
  );
};

export default JsonDisplay;
