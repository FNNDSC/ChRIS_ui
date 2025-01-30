import React, { useCallback, useContext, useEffect } from "react";
import { WizardContext } from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types } from "./types/feed";
import { LocalFileList } from "./HelperComponent";
import { notification } from "antd";

const LocalFileUpload = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { localFiles } = state.data;
  const { goToNextStep: onNext, goToPrevStep: onBack } =
    useContext(WizardContext);

  const handleDeleteDispatch = (file: string) => {
    dispatch({
      type: Types.RemoveLocalFile,
      payload: {
        filename: file,
      },
    });

    notification.info({
      message: "File removed",
      description: `${file} file removed`,
      duration: 1,
    });
  };

  return (
    <>
      <div className="pacs-alert-wrap">
        <div className="pacs-alert-step-wrap">
          <h1 style={{ marginTop: "1rem" }}>Selected Files:</h1>
          <FileUploadComponent
            className="local-file-upload"
            handleDeleteDispatch={handleDeleteDispatch}
            localFiles={localFiles}
            onNext={onNext}
            onBack={onBack}
          />
        </div>
      </div>
    </>
  );
};

export default LocalFileUpload;

type FileUploadProps = {
  localFiles: File[];
  handleDeleteDispatch: (file: string) => void;
  onNext: () => void;
  onBack: () => void;
  uploadName?: JSX.Element;
  className: string;
};

const FileUploadComponent = ({
  localFiles,
  onBack,
  onNext,
  handleDeleteDispatch,
  className,
}: FileUploadProps) => {
  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.code === "ArrowLeft") {
        onBack();
      } else if (e.code === "ArrowRight" && localFiles.length > 0) {
        onNext();
      }
    },
    [localFiles.length, onBack, onNext],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const fileList =
    localFiles.length > 0
      ? localFiles.map((file: File, index: number) => (
          <React.Fragment key={index}>
            <LocalFileList
              handleDeleteDispatch={handleDeleteDispatch}
              file={file}
              index={index}
              showIcon={true}
            />
          </React.Fragment>
        ))
      : null;

  return (
    <div className={className}>
      <div className="file-list">{fileList}</div>
    </div>
  );
};
