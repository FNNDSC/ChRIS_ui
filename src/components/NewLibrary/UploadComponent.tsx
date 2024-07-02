import {
  Button,
  CodeBlock,
  CodeBlockCode,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  Alert as PatternflyAlert,
  Progress,
  TextInput,
} from "@patternfly/react-core";
import { useNavigate } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import type { AxiosResponse } from "axios";
import type { AxiosProgressEvent } from "axios";
import ReactJson from "react-json-view";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  catchError,
  getTimestamp,
  limitConcurrency,
  uploadWrapper,
} from "../../api/common";
import { useTypedSelector } from "../../store/hooks";
import { EmptyStateComponent, useCookieToken } from "../Common";
import { LocalFileList } from "../CreateFeed/HelperComponent";
import { UploadIcon as FaUpload } from "../Icons";
import styles from "./UploadFile.module.css";

interface UploadComponentProps {
  handleFileModal: () => void;
  handleLocalFiles: (files: File[]) => void;
  handleDelete: (name: string, type?: string) => void;
  uploadFileModal: boolean;
  localFiles: File[];
  handleAddFolder: (path: string, user: string) => void;
}

interface FileUpload {
  file: File;
  promise: Promise<AxiosResponse<any>>;
}

const UploadContainer = ({
  isOpenModal,
  handleFileModal,
}: {
  isOpenModal: boolean;
  handleFileModal: () => void;
}) => {
  const navigate = useNavigate();
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const handleLocalFiles = (files: File[]) => {
    setLocalFiles(files);
  };

  const closeModal = () => {
    if (isOpenModal && localFiles.length > 0) {
      setLocalFiles([]);
    }
    handleFileModal();
  };

  const handleAddFolder = (path: string, user: string) => {
    navigate(`home/${user}/uploads/${path}`);
  };

  return (
    <UploadComponent
      handleAddFolder={handleAddFolder}
      handleLocalFiles={handleLocalFiles}
      handleFileModal={closeModal}
      localFiles={localFiles}
      uploadFileModal={isOpenModal}
      handleDelete={(name: string, type?: string) => {
        if (type === "folder") {
          setLocalFiles([]);
        } else {
          const filteredfiles = localFiles.filter((file) => file.name !== name);
          setLocalFiles(filteredfiles);
        }
      }}
    />
  );
};

export default UploadContainer;

export const UploadComponent: React.FC<UploadComponentProps> = ({
  handleFileModal,
  handleLocalFiles,
  handleAddFolder,
  handleDelete,
  uploadFileModal,
  localFiles,
}) => {
  const token = useCookieToken();
  const folderInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const username = useTypedSelector((state) => state.user.username);
  const [warning, setWarning] = useState<Record<string, string>>({});
  const [directoryName, setDirectoryName] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(5);
  const [currentFile, setCurrentFile] = useState<Record<string, string>>({});
  const [countdownInterval, setCountdownInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [serverProgress, setServerProgress] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Handle file change for local upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const files = Array.from(fileList);

    // Calculate the total size of all files
    const totalSize = files.reduce(
      (total, file) => total + (file.size || 0),
      0,
    );

    // Initialize loaded size
    let loadedSize = 0;

    // Initialize completed files count
    let completedFiles = 0;

    // Use FileReader to read file contents and track progress for each file
    files.forEach((file) => {
      const reader = new FileReader();

      reader.onprogress = (event) => {
        // Update loaded size
        loadedSize += event.loaded || 0;

        // Calculate overall progress
        const overallProgress = (loadedSize / totalSize) * 100;

        // Update progress
        setProgress(overallProgress);
      };

      // Read the file as ArrayBuffer
      reader.readAsArrayBuffer(file);

      reader.onloadend = () => {
        // Update completed files count
        if (++completedFiles === files.length) {
          // Reset loaded size when all files are loaded
          loadedSize = 0;

          // Reset progress to 0 when all files are loaded
          setProgress(0);

          // Pass the fileList to the parent component
          handleLocalUploadFiles(files);
        }
      };
    });
  };

  // Handle local file uploads
  const handleLocalUploadFiles = (files: any[]) => {
    setWarning({});
    handleLocalFiles(files);
  };

  // Handle reset
  const handleReset = useCallback(() => {
    setCurrentFile({});
    setCountdown(5);
    setServerProgress(0);
    handleFileModal();
    countdownInterval && clearInterval(countdownInterval);
  }, [countdownInterval, handleFileModal]);

  // Countdown effect
  useEffect(() => {
    if (countdown === 0) {
      handleReset();
    }
  }, [handleReset, countdown]);

  // Effect for updating directory name
  useEffect(() => {
    const d = getTimestamp();
    setDirectoryName(`${d}`);
  }, []);

  // Handle server upload
  const handleUpload = async () => {
    const client = ChrisAPIClient.getClient();
    await client.setUrls();
    const onUploadProgress = (file: any, progressEvent: AxiosProgressEvent) => {
      if (progressEvent?.total) {
        const percentCompleted = `${Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        )}%`;
        setCurrentFile((prevProgresses) => ({
          ...prevProgresses,
          [file.name]: percentCompleted,
        }));
      }
    };

    const uploadDirectory = `home/${username}/uploads/${directoryName}`;

    const fileUploads: FileUpload[] = uploadWrapper(
      localFiles,
      uploadDirectory,
      token,
      onUploadProgress,
    );

    const completedUploads: number[] = [];
    const promises = fileUploads.map(
      ({ promise }) =>
        () =>
          promise,
    );
    let serverProgressForClosingModal = 0;

    const results = await limitConcurrency(4, promises, (progress: number) => {
      setServerProgress(progress);
      serverProgressForClosingModal = progress;
    });

    results.forEach((result, i) => {
      if (result.status === 201) {
        completedUploads.push(i);
      } else {
        const err = catchError(result);
        const { file } = fileUploads[i];
        setWarning({
          ...warning,
          [file.name]: err.error_message,
        });
      }
    });

    if (
      completedUploads.length === localFiles.length &&
      serverProgressForClosingModal === 100
    ) {
      username && handleAddFolder(directoryName, username);
      const intervalDelay = 1000;
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, intervalDelay);
      setCountdownInterval(interval);
    }
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      onClose={() => handleReset()}
      isOpen={uploadFileModal}
      aria-labelledby="file-upload"
      className={styles.customModal} // Add a custom class for styling
    >
      {/* Upload Buttons Section */}
      <div className={styles.uploadButtons}>
        <input
          ref={folderInput}
          style={{ display: "none" }}
          type="file"
          //@ts-ignore
          webkitdirectory="true"
          onChange={handleFileChange}
          multiple
        />
        <input
          ref={fileInput}
          style={{ display: "none" }}
          type="file"
          onChange={handleFileChange}
          multiple
        />
        <Button onClick={() => folderInput.current?.click()} variant="primary">
          Upload Folder
        </Button>
        <Button onClick={() => fileInput.current?.click()} variant="primary">
          Upload Files
        </Button>
      </div>

      {/* Local Files Section */}
      <div className={styles.localFilesSection}>
        {progress > 0 ? (
          <Progress
            aria-labelledby="file-upload"
            size="sm"
            style={{ marginTop: "1rem" }}
            value={progress}
            measureLocation="outside"
          />
        ) : localFiles.length > 0 ? (
          localFiles[0].webkitRelativePath ? (
            <LocalFileList
              key={0} // Use a unique key for the folder
              handleDeleteDispatch={(name, type?: string) =>
                handleDelete(name, type)
              }
              file={localFiles[0]}
              index={0}
              showIcon={true}
              isFolder={true}
            />
          ) : (
            localFiles.map((file: File, index: number) => (
              <LocalFileList
                key={index}
                handleDeleteDispatch={(name, type?: string) =>
                  handleDelete(name, type)
                }
                file={file}
                index={index}
                showIcon={true}
              />
            ))
          )
        ) : (
          <EmptyStateComponent title="No Files or Folders have been uploaded yet..." />
        )}
      </div>

      {/* Directory Name Section */}
      <Form
        onSubmit={(event) => event.preventDefault()}
        className={styles.directoryForm}
      >
        <FormGroup fieldId="directory name" isRequired label="Directory Name">
          <TextInput
            isRequired
            id="horizontal-form-name"
            value={directoryName}
            type="text"
            name="horizontal-form-name"
            onChange={(_event, value) => setDirectoryName(value)}
          />
        </FormGroup>
      </Form>

      {/* Upload Button Section */}
      <div className={styles.uploadButtonSection}>
        <Button
          isDisabled={
            localFiles.length === 0 ||
            (countdown < 5 && countdown > 0) ||
            directoryName.length === 0 ||
            serverProgress > 0
          }
          onClick={handleUpload}
          icon={<FaUpload />}
          variant="primary"
        >
          Push to File Storage
        </Button>
      </div>

      {/* Code Display Section */}
      <div className={styles.codeDisplaySection}>
        <CodeBlock style={{ height: "200px", overflow: "scroll" }}>
          <CodeBlockCode>
            {Object.keys(currentFile).length === 0 ? (
              <span style={{ fontFamily: "monospace" }}>
                You have no active uploads. Please upload Files from your local
                computer and hit the 'Push to File Storage' button. You can give
                a directory name for your upload or use the default name above.
                Your uploads will appear under the 'Uploads' space once it is
                complete.
              </span>
            ) : (
              <ReactJSONView currentFile={currentFile} />
            )}
          </CodeBlockCode>
          <CodeBlockCode>
            {Object.keys(warning).length > 0 && (
              <ReactJSONView currentFile={warning} />
            )}
          </CodeBlockCode>
        </CodeBlock>
      </div>

      {/* Progress Bar Section */}
      <Progress
        size="sm"
        style={{ marginTop: "1rem" }}
        value={serverProgress}
        title={`${serverProgress}% Complete`}
        measureLocation="outside"
      />

      {/* Countdown Alert Section */}
      {countdown < 5 && countdown > 0 && (
        <PatternflyAlert variant="success" title="Successful Upload">
          The files have been uploaded to the server. This modal will close in{" "}
          {countdown} seconds.
        </PatternflyAlert>
      )}
    </Modal>
  );
};

export const ReactJSONView = ({
  currentFile,
}: {
  currentFile: Record<string, string>;
}) => {
  return (
    <ReactJson
      style={{ height: "100%" }}
      displayDataTypes={false}
      theme="grayscale"
      src={currentFile}
      name={null}
      enableClipboard={false} // Set enableClipboard prop to false
      displayObjectSize={false} // Set displayObjectSize prop to false
      collapsed={4}
    />
  );
};
