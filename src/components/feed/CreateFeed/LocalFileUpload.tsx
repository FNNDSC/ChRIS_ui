import React, { useContext } from "react";
import { CreateFeedContext } from "./context";
import { Grid, GridItem, Button } from "@patternfly/react-core";
import { FileIcon, OutlinedTrashAltIcon } from "@patternfly/react-icons";
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
      <span className="file-icon">
        <FileIcon />
      </span>
      <span className="file-name">{file.name}</span>
      <span className="trash-icon">
        <OutlinedTrashAltIcon
          onClick={() => {
            dispatch({
              type: Types.RemoveLocalFile,
              payload: {
                filename: file.name,
              },
            });
          }}
        />
      </span>
    </div>
  ));

  return (
    <div className="local-file-upload">
      <h1 className="pf-c-title pf-m-2xl">File Selection: Local File Upload</h1>
      <p>Choose files from your local computer to create a feed</p>
      <br />
      <Grid hasGutter={true}>
        <GridItem span={4} rowSpan={4}>
          <p className="section-header">File Upload</p>
          <Button 
          style={{
            width:'100%'
          }}
          onClick={() => handleChoseFilesClick()}>
            Choose Files...
          </Button>
        </GridItem>
        <GridItem span={8} rowSpan={12}>
          <p className="section-header">Local files to add to new feed:</p>
          <div className="file-list">{fileList}</div>
        </GridItem>
      </Grid>
    </div>
  );
};

export default LocalFileUpload;
