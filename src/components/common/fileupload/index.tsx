import React from "react";
import { useDropzone } from "react-dropzone";

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
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
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    open,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone();

  React.useEffect(() => {
    if (acceptedFiles.length > 0) {
      handleLocalUploadFiles(acceptedFiles);
    }
  }, [acceptedFiles, handleLocalUploadFiles, open]);

  React.useEffect(() => {
     if(acceptedFiles.length <= 0){
      open()
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
 
  const style = React.useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept, isFocused]
  );
  return (
    <section className="container">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag &apos;n&apos; drop some files here or click to select files</p>
      </div>
    </section>
  );
};
export default DragAndUpload;
