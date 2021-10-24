import React, { useContext } from "react";
import { CreateFeedContext } from "./context";

import { LocalFile, Types } from "./types";
import FileUpload from "../../common/fileupload";

const LocalFileUpload: React.FC = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { localFiles } = state.data;

  const handleDispatch = (files: LocalFile[]) => {
    dispatch({
      type: Types.AddLocalFile,
      payload: {
        files,
      },
    });
  };

  const handleDeleteDispatch = (file: string) => {
    dispatch({
      type: Types.RemoveLocalFile,
      payload: {
        filename: file,
      },
    });
  };

  return (
    <>
      <h1 className="pf-c-title pf-m-2xl">File Selection: Local File Upload</h1>
      <p>Choose files from your local computer to create a feed</p>
      <FileUpload
        className="local-file-upload"
        handleDeleteDispatch={handleDeleteDispatch}
        localFiles={localFiles}
        dispatchFn={handleDispatch}
      />
    </>
  );
};

export default LocalFileUpload;
