import { Tooltip } from "@patternfly/react-core";
import React, { useCallback, useContext, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import IconUpload from "@patternfly/react-icons/dist/esm/icons/upload-icon";
import { CreateFeedContext } from "../CreateFeed/context";
import { Types } from "../CreateFeed/types/feed";
import "./DragFileUpload.css";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 4,
  borderColor: "#dfe1e6",
  borderStyle: "dashed",
  color: "white",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2188ff",
};

const activeStyle = {
  borderColor: "#2188ff",
};

const acceptStyle = {
  borderColor: "#37b24d",
};

const rejectStyle = {
  borderColor: "#ff5252",
};

const DragAndUpload = ({
  handleLocalUploadFiles,
}: {
  handleLocalUploadFiles: (files: any[]) => void;
}) => {
  const onDrop = useCallback(
    (acceptedFiles: any) => {
      handleLocalUploadFiles(acceptedFiles);
    },
    [handleLocalUploadFiles],
  );

  const {
    getRootProps,
    getInputProps,
    open,
    isFocused,
    isDragReject,
    isDragActive,
    isDragAccept,
  } = useDropzone({ onDrop });

  const { state, dispatch } = useContext(CreateFeedContext);

  useEffect(() => {
    if (state.data.localFiles.length === 0) {
      if (state.selectedConfig.includes("local_select")) {
        dispatch({
          type: Types.SelectedConfig,
          payload: {
            selectedConfig: state.selectedConfig.filter(
              (value: string) => value !== "local_select",
            ),
          },
        });
      }
    }
  }, [dispatch, state.data.localFiles.length, state.selectedConfig]);

  const handleKeyDown = useCallback(
    (e: any) => {
      if (
        e.code === "KeyU" &&
        document &&
        document.activeElement &&
        document.activeElement.tagName !== "INPUT"
      ) {
        open();
      }
    },
    [open],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const style = {
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
    height: "100%",
  };

  return (
    <section className="drag-and-upload-container">
      <Tooltip content="Press the U key to select a file">
        <div className="tag">
          <span className="tag-text">U</span>
        </div>
      </Tooltip>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <IconUpload />
        <p>
          Drag &apos;n&apos; drop some files here or click to select files.
          <br />
          Use the button below for Folder Uploads.
        </p>
      </div>
    </section>
  );
};

export default DragAndUpload;
