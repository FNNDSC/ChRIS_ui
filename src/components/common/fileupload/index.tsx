import { Tooltip } from "@patternfly/react-core";
import React, { useCallback, useContext, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { MdOutlineUploadFile } from "react-icons/md";
import { CreateFeedContext } from "../../feed/CreateFeed/context";

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
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
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
  const {
    getRootProps,
    isFocused,
    isDragReject,
    acceptedFiles,
    isDragActive,
    isDragAccept,
    getInputProps,
    open,
  } = useDropzone();
  const { state } = useContext(CreateFeedContext);

  React.useEffect(() => {
    if (acceptedFiles.length > 0) {
      handleLocalUploadFiles(acceptedFiles);
    }
  }, [acceptedFiles, handleLocalUploadFiles, state.data.localFiles.length]);

  React.useEffect(() => {
    if (state.data.localFiles.length == 0) {
      open()
    }
  }, [open, state.data.localFiles.length])

  const handleKeyDown = useCallback((e: any) => {
    console.log(e)
    if (e.key == "u") {
      console.log("called")
      open()
    }
  }, [open])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

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
    <section className="container" style={{ height: "100%", position: "relative" }}>
      <Tooltip content="Press the U key to select a file">
      <div className="pf-c-chip pf-m-read-only tag"  style={{ position: "absolute", top: "10%", right: "8%" }}>
        <span className="pf-c-chip__text">U</span>
      </div>
      </Tooltip>
      <div {...getRootProps({ style })} >
        <input {...getInputProps()} />
        <MdOutlineUploadFile size="40" />
        <p>Drag &apos;n&apos; drop some files here or click to select files</p>
      </div>
    </section>
  );
};
export default DragAndUpload;
