import React, { useState, useCallback, useEffect } from "react";
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
  ModalVariant,
  CodeBlockCode,
  CodeBlock,
  FormGroup,
  Form,
  Alert as PatternflyAlert,
  Progress,
  ProgressSize,
} from "@patternfly/react-core";
import { Typography } from "antd";
import { debounce } from "lodash";

import { useLocation, useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import WrapperConnect from "../Wrapper";
import DragAndUpload from "../DragFileUpload";
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

export const fetchFilesUnderThisPath = async (path?: string) => {
  if (!path) return;

  const client = ChrisAPIClient.getClient();
  const pathList = await client.getFileBrowserPath(path);
  const pagination = {
    limit: 20,
    offset: 0,
    totalCount: 0,
  };
  if (pathList) {
    const fileList = await pathList.getFiles({
      limit: pagination.limit,
      offset: pagination.offset,
    });

    if (fileList) {
      const files = fileList.getItems() as any[];
      return files;
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
              Upload Files
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
              handleDelete={(name: string) => {
                const filteredfiles = localFiles.filter(
                  (file) => file.name !== name,
                );
                setLocalFiles(filteredfiles);
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
  const currentPathSplit = pathname.split("/library/")[1];

  const computedPath = currentPathSplit || "/";
  const fileData = useGetFiles(computedPath);
  const folderData = useGetFolders(computedPath);

  const { data: files, isLoading: isFileLoading } = fileData;
  const { data: folders, isLoading: isFolderLoading } = folderData;

  const handleFolderClick = debounce((folder: string) => {
    const url = `${pathname}/${folder}`;
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

interface UploadComponent {
  handleFileModal: () => void;
  handleLocalFiles: (files: File[]) => void;
  handleDelete: (name: string) => void;
  uploadFileModal: boolean;
  localFiles: File[];
  handleAddFolder: (path: string, user: string) => void;
}

interface FileUpload {
  file: File;
  promise: Promise<AxiosResponse<any>>;
}

const UploadComponent = ({
  handleFileModal,
  handleLocalFiles,
  handleAddFolder,
  handleDelete,
  uploadFileModal,
  localFiles,
}: UploadComponent) => {
  const token = useCookieToken();
  const username = useTypedSelector((state) => state.user.username);
  const [warning, setWarning] = useState<Record<string, string>>({});
  const [directoryName, setDirectoryName] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [currentFile, setCurrentFile] = useState({});
  const [countdownInterval, setCountdownInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [serverProgress, setServerProgress] = useState(0);

  const handleLocalUploadFiles = (files: any[]) => {
    setWarning({});
    handleLocalFiles(files);
  };

  const handleReset = useCallback(() => {
    setCurrentFile({});
    setCountdown(5);
    setServerProgress(0);
    handleFileModal();
    countdownInterval && clearInterval(countdownInterval);
  }, [countdownInterval, handleFileModal]);

  useEffect(() => {
    if (countdown === 0) {
      handleReset();
    }
  }, [handleReset, countdown]);

  useEffect(() => {
    const d = getTimestamp();
    setDirectoryName(`${d}`);
  }, [uploadFileModal]);

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
      width="70%"
      title="Upload Files"
      onClose={() => {
        handleReset();
      }}
      isOpen={uploadFileModal}
      variant={ModalVariant.medium}
      arial-labelledby="file-upload"
    >
      <div style={{ height: "200px" }}>
        <DragAndUpload handleLocalUploadFiles={handleLocalUploadFiles} />
      </div>
      <div
        style={{
          height: "200px",
          marginTop: "1rem",
          overflow: "scroll",
        }}
      >
        {localFiles.length > 0 ? (
          localFiles.map((file, index) => {
            return (
              <LocalFileList
                key={index}
                handleDeleteDispatch={(name) => {
                  handleDelete(name);
                }}
                file={file}
                index={index}
                showIcon={true}
              />
            );
          })
        ) : (
          <EmptyStateComponent title="No files have been uploaded yet..." />
        )}
      </div>

      <Form
        onSubmit={(event) => event.preventDefault()}
        style={{ marginTop: "1rem" }}
        isHorizontal
      >
        <FormGroup fieldId="directory name" isRequired label="Directory Name">
          <TextInput
            isRequired
            id="horizontal form name"
            value={directoryName}
            type="text"
            name="horizontal-form-name"
            onChange={(_event, value) => {
              setDirectoryName(value);
            }}
          />
        </FormGroup>
      </Form>
      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
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
      <CodeBlock
        style={{ marginTop: "1rem", height: "200px", overflow: "scroll" }}
      >
        <CodeBlockCode>
          {Object.keys(currentFile).length === 0 ? (
            <span style={{ fontFamily: "monospace" }}>
              You have no active uploads. Please upload Files from your local
              computer and hit the &apos;Push to File Storage&apos; button. You
              can give a directory name for your upload or use the default name
              above. Your uploads will appear under the &apos;Uploads&apos;
              space once it is complete.
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
      <Progress
        size={ProgressSize.sm}
        style={{ marginTop: "1rem" }}
        value={serverProgress}
        title={`${serverProgress}% Complete`}
        measureLocation="outside"
      />
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
