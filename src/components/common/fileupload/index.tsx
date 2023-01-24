import { WizardContext } from "@patternfly/react-core";
import React, { useContext } from "react";
import { useDropzone } from "react-dropzone";
import { CreateFeedContext } from "../../feed/CreateFeed/context";

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
    getRootProps,
    isFocused,
    isDragReject,
    acceptedFiles,
    isDragActive,
    isDragAccept,
    getInputProps,
    open,
  } = useDropzone();
  const { activeStep } = useContext(WizardContext)
  const { state } = useContext(CreateFeedContext);

  React.useEffect(() => {
    if (acceptedFiles.length > 0) {
      handleLocalUploadFiles(acceptedFiles);
    }
  }, [acceptedFiles, handleLocalUploadFiles]);
  
  React.useEffect(() => {
    if (activeStep.name == "Local File Upload" && state.data.localFiles.length == 0) {
      open()
    }
  }, [activeStep.name, open, state.data.localFiles.length])
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
      <div {...getRootProps({ style })} >
        <input {...getInputProps()} />
        <p>Drag &apos;n&apos; drop some files here or click to select files</p>
      </div>
    </section>
  );
};
export default DragAndUpload;
