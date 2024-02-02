import React, { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import ReactJson from "react-json-view";
import {
  Button,
  TextInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  PageSection,
  Modal,
  CodeBlockCode,
  CodeBlock,
  FormGroup,
  Form,
  Alert as PatternflyAlert,
  Progress,
  ModalVariant,
} from "@patternfly/react-core";
import { Typography } from "antd";
import { debounce } from "lodash";

import { useLocation, useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import WrapperConnect from "../Wrapper";
import Cart from "./Cart";
import Browser from "./Browser";
import { LocalFileList } from "../CreateFeed/HelperComponent";
import { SpinContainer, EmptyStateComponent } from "../Common";
import BreadcrumbContainer from "./BreadcrumbContainer";
import { LibraryProvider } from "./context/";
import { InfoIcon } from "../Common";
import FaUpload from "@patternfly/react-icons/dist/esm/icons/upload-icon";
import type { AxiosProgressEvent, AxiosResponse } from "axios";
import { useCookieToken } from "../Common";
import { useTypedSelector } from "../../store/hooks";
import {
  catchError,
  limitConcurrency,
  getTimestamp,
  uploadWrapper,
} from "../../api/common";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";
import { fetchResource } from "../../api/common";
import "./LibraryCopy.css";

export const fetchFilesUnderThisPath = async (path?: string) => {
  if (!path) return;

  const client = ChrisAPIClient.getClient();
  const pathList = await client.getFileBrowserPath(path);
  const pagination = {
    limit: 20,
    offset: 0,
  };

  if (pathList) {
    const fn = pathList.getFiles;
    const boundFn = fn.bind(pathList);

    const { resource } = await fetchResource(pagination, boundFn);

    if (resource) {
      return resource;
    }
  }

  return [];
};

export const fetchFoldersUnderThisPath = async (path?: string) => {
  if (!path) return;
  const client = ChrisAPIClient.getClient();
  const uploads = await client.getFileBrowserPaths({
    path,
  });

  const parsedUpload =
    uploads.data && uploads.data[0].subfolders
      ? JSON.parse(uploads.data[0].subfolders)
      : [];

  return parsedUpload;
};

const useGetFolders = (computedPath: string) => {
  const folderData = useQuery({
    queryKey: ["folders", computedPath],
    queryFn: () => fetchFoldersUnderThisPath(computedPath),
    enabled: !!computedPath,
  });

  return folderData;
};

const useGetFiles = (computedPath: string) => {
  const fileData = useQuery({
    queryKey: ["files", computedPath],
    queryFn: () => fetchFilesUnderThisPath(computedPath),
    enabled: !!computedPath,
  });

  return fileData;
};

const { Paragraph } = Typography;

export const LibraryCopyPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  const handleLocalFiles = (files: File[]) => {
    setLocalFiles(files);
  };

  const handleFileModal = () => {
    setIsOpenModal(!isOpenModal);
    if (isOpenModal && localFiles.length > 0) {
      setLocalFiles([]);
    }
  };

  const handleAddFolder = (path: string, user: string) => {
    navigate(`/library/${user}/uploads/${path}`);
  };

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "lib",
      }),
    );
  }, [dispatch]);

  return (
    <WrapperConnect>
      <>
        <PageSection
          style={{
            paddingBottom: "0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <InfoIcon
            title="Library"
            p1={
              <Paragraph>
                The Library provides a card-focused mechanism for browsing,
                viewing, and interacting with data in the ChRIS system. A card
                is analogous to a file or folder in a convention filesystem, and
                multiple cards can be grouped into a shopping cart to allow for
                bulk operations. Simply long press and release a card to add it
                to the cart. Bulk operations include: <b>Download</b> (which
                will copy all cart contents to your local filesystem),{" "}
                <b>Delete</b> (which will permanently remove all data in the
                cards from ChRIS), and <b>Create</b> which will seed a new
                analysis with a new root node containing each card as a
                subdirectory.
              </Paragraph>
            }
          />
          <div style={{ marginRight: "1rem" }}>
            <Button
              variant="primary"
              onClick={handleFileModal}
              icon={<FaUpload />}
            >
              Upload
            </Button>
          </div>
        </PageSection>

        <PageSection
          style={{
            paddingTop: "0",
          }}
        >
          <LibraryProvider>
            <UploadComponent
              handleFileModal={handleFileModal}
              handleLocalFiles={handleLocalFiles}
              uploadFileModal={isOpenModal}
              handleAddFolder={handleAddFolder}
              localFiles={localFiles}
              handleDelete={(name: string, type?: string) => {
                if (type === "folder") {
                  setLocalFiles([]);
                } else {
                  const filteredfiles = localFiles.filter(
                    (file) => file.name !== name,
                  );
                  setLocalFiles(filteredfiles);
                }
              }}
            />

            <Cart />
            <LocalSearch />

            <NormalBrowser />
          </LibraryProvider>
        </PageSection>
      </>
    </WrapperConnect>
  );
};

function NormalBrowser() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];

  const computedPath = currentPathSplit || "/";

  const fileData = useGetFiles(computedPath);
  const folderData = useGetFolders(computedPath);

  const { data: files, isLoading: isFileLoading } = fileData;
  const { data: folders, isLoading: isFolderLoading } = folderData;

  const handleFolderClick = debounce((folder: string) => {
    const url = `${decodedPath}/${folder}`;
    navigate(url);
  }, 500);

  const handleBreadcrumb = (path: string) => {
    navigate(`/library${path}`);
  };

  return (
    <>
      <BreadcrumbContainer
        path={computedPath}
        handleFolderClick={handleBreadcrumb}
      />

      <Browser
        handleFolderClick={handleFolderClick}
        files={files}
        folders={folders}
        path={computedPath}
      />

      {(isFileLoading || isFolderLoading) && (
        <SpinContainer title="Fetching the Resources for this path" />
      )}
    </>
  );
}

export default LibraryCopyPage;

const items = ["feeds", "pacs"];

function LocalSearch() {
  const navigate = useNavigate();

  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchSpace, setSearchSpace] = useState(items[0]);

  const handleSearch = async () => {
    if (value) {
      navigate(`/librarysearch/?search=${value}&space=${searchSpace}`);
    }
  };

  return (
    <div
      style={{
        margin: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <Dropdown
        toggle={(toggleRef: any) => {
          return (
            <MenuToggle
              ref={toggleRef}
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              {searchSpace}
            </MenuToggle>
          );
        }}
        aria-label="Choose a space to search"
        isOpen={isOpen}
      >
        <DropdownList>
          {items.map((item) => {
            return (
              <DropdownItem
                key={item}
                onClick={() => {
                  setSearchSpace(item);
                  setIsOpen(!isOpen);
                }}
              >
                {item}
              </DropdownItem>
            );
          })}
        </DropdownList>
      </Dropdown>

      <TextInput
        aria-label="Search over uploaded Space"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
        onChange={(_e, value) => setValue(value)}
        value={value}
        placeholder="Choose a space to search under"
      />
    </div>
  );
}

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

const UploadComponent: React.FC<UploadComponentProps> = ({
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
  }, [uploadFileModal]);

  // Handle server upload
  const handleUpload = async () => {
    const client = ChrisAPIClient.getClient();
    await client.setUrls();
    const onUploadProgress = (file: any, progressEvent: AxiosProgressEvent) => {
      if (progressEvent && progressEvent.total) {
        const percentCompleted = `${Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        )}%`;
        setCurrentFile((prevProgresses) => ({
          ...prevProgresses,
          [file.name]: percentCompleted,
        }));
      }
    };

    const uploadDirectory = `${username}/uploads/${directoryName}`;

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
      className="custom-modal" // Add a custom class for styling
    >
      {/* Upload Buttons Section */}
      <div className="upload-buttons">
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
        <Button
          onClick={() => folderInput.current && folderInput.current.click()}
          variant="primary"
        >
          Upload Folder
        </Button>
        <Button
          onClick={() => fileInput.current && fileInput.current.click()}
          variant="primary"
        >
          Upload Files
        </Button>
      </div>

      {/* Local Files Section */}
      <div className="local-files-section">
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
        className="directory-form"
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
      <div className="upload-button-section">
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
      <div className="code-display-section">
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
