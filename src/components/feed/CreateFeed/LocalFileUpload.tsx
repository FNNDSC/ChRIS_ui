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
    <FileUpload
      handleDeleteDispatch={handleDeleteDispatch}
      localFiles={localFiles}
      dispatchFn={handleDispatch}
    />
  );
};

export default LocalFileUpload;
