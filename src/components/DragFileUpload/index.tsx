import { Tooltip } from "@patternfly/react-core";
import React, { useCallback, useContext, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { IconUpload } from "@tabler/icons-react";

import { CreateFeedContext } from "../CreateFeed/context";
import { Types } from "../CreateFeed/types/feed";

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const focusedStyle = {
  borderColor: "#0066cc",
};

const rejectStyle = {
  borderColor: "#ff1744",
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
    [handleLocalUploadFiles]
  );

  const {
    getRootProps,
    isFocused,
    isDragReject,
    isDragActive,
    isDragAccept,
    getInputProps,
    open,
  } = useDropzone({ onDrop });
  const { state, dispatch } = useContext(CreateFeedContext);

  React.useEffect(() => {
    if (state.data.localFiles.length == 0) {
      if (state.selectedConfig.includes("local_select")) {
        dispatch({
          type: Types.SelectedConfig,
          payload: {
            selectedConfig: state.selectedConfig.filter(
              (value: string) => value != "local_select"
            ),
          },
        });
      }
    }
  }, [dispatch, state.data.localFiles.length, state.selectedConfig]);

  const handleKeyDown = useCallback(
    (e: any) => {
      if (
        e.code == "KeyU" &&
        document &&
        document.activeElement &&
        document.activeElement.tagName !== "INPUT"
      ) {
        open();
      }
    },
    [open]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const style = React.useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
      height: "100%",
    }),
    [isDragActive, isDragReject, isDragAccept, isFocused]
  );
  return (
    <section
      className="container"
      style={{ height: "100%", position: "relative" }}
    >
      <Tooltip content="Press the U key to select a file">
        <div
          className="pf-c-chip pf-m-read-only tag"
          style={{ position: "absolute", top: "10%", right: "8%" }}
        >
          <span className="pf-c-chip__text">U</span>
        </div>
      </Tooltip>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <IconUpload />
        <p>Drag &apos;n&apos; drop some files here or click to select files</p>
      </div>
    </section>
  );
};
export default DragAndUpload;
