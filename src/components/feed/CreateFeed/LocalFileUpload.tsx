import React, { useContext } from "react";
import { CreateFeedContext } from "./context";
import { Split, SplitItem, Button } from "@patternfly/react-core";
import { FileIcon, CloseIcon } from "@patternfly/react-icons";
import { LocalFile, Types } from "./types";

const LocalFileUpload: React.FC = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { localFiles } = state.data;
  const openLocalFilePicker = (): Promise<LocalFile[]> => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.click();
    return new Promise((res) => {
      input.onchange = async () => {
        if (input.files) {
          const files = Array.from(input.files).map((file) => {
            return {
              name: file.name,
              blob: file,
            };
          });
          res(files);
        }
      };
    });
  };

  const handleChoseFilesClick = () => {
    openLocalFilePicker().then((files: LocalFile[]) => {
      dispatch({
        type: Types.AddLocalFile,
        payload: {
          files,
        },
      });
    });
  };

  const fileList = localFiles.map((file) => (
    <div className="file-preview" key={file.name}>
      <FileIcon />
      <span className="file-name">{file.name}</span>
      <CloseIcon
        className="file-remove"
        onClick={() => {
          dispatch({
            type: Types.RemoveLocalFile,
            payload: {
              filename: file.name,
            },
          });
        }}
      />
    </div>
  ));

  return (
    <div className="local-file-upload">
      <h1 className="pf-c-title pf-m-2xl">File Selection: Local File Upload</h1>
      <p>Choose files from your local computer to create a feed</p>
      <br />
      <Split hasGutter={true}>
        <SplitItem isFilled>
          <p className="section-header">File Upload</p>
          <Button onClick={() => handleChoseFilesClick()}>
            Choose Files...
          </Button>
        </SplitItem>
        <SplitItem isFilled className="file-list-wrap">
          <p className="section-header">Local files to add to new feed:</p>
          <div className="file-list">{fileList}</div>
        </SplitItem>
      </Split>
    </div>
  );
};

export default LocalFileUpload;
