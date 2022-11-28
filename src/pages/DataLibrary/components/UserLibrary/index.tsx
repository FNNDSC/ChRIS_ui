import React, { useContext } from "react";
import {
  Button,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  AlertGroup,
  ChipGroup,
  Chip,
  Tabs,
  Tab,
  TabTitleText,
} from "@patternfly/react-core";
import { Feed } from "@fnndsc/chrisapi";
import { Alert, Progress as AntProgress } from "antd";
import BrowserContainer from "./BrowserContainer";
import LocalSearch from "./LocalSearch";
import { FaUpload } from "react-icons/fa";
import FileUpload from "../../../../components/common/fileupload";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { LocalFile } from "../../../../components/feed/CreateFeed/types/feed";
import { useTypedSelector } from "../../../../store/hooks";
import { FileSelect, LibraryContext, Types } from "./context";
import { MainRouterContext } from "../../../../routes";
import {
  clearSelectFolder,
  setDeleteFile,
  setMultiColumnLayout,
} from "./context/actions";
import { deleteFeed } from "../../../../store/feed/actions";
import { useDispatch } from "react-redux";
import { fetchResource } from "../../../../api/common";
import "./user-library.scss";

interface DownloadType {
  name: string;
  files: any[];
}

const DataLibrary = () => {
  const dispatch = useDispatch();
  const { state, dispatch: dispatchLibrary } = useContext(LibraryContext);
  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);
  const username = useTypedSelector((state) => state.user.username);
  const router = useContext(MainRouterContext);
  const [uploadFileModal, setUploadFileModal] = React.useState(false);
  const [localFiles, setLocalFiles] = React.useState<LocalFile[]>([]);
  const { foldersState, selectedFolder, currentPath } = state;
  const [error, setError] = React.useState<any[]>([]);
  const [fetchingFiles, setFetchingFiles] = React.useState(false);
  const [feedFilesToDelete, setFeedFilestoDelete] = React.useState<
    FileSelect[]
  >([]);

  const [download, setDownload] = React.useState({
    show: false,
    error: "",
    count: 0,
    path: "",
  });

  const handleFileModal = () => {
    setUploadFileModal(!uploadFileModal);
    setLocalFiles([]);
  };

  const handleLocalFiles = (files: LocalFile[]) => {
    setLocalFiles(files);
  };

  const returnFeedPath = (path: string) => {
    const pathSplit = path.split("/");

    const newPath = pathSplit.filter((path) => path !== "").join("/");
    return newPath;
  };

  const createFeed = () => {
    const pathList = selectedFolder.map((file) => {
      if (file.type === "feed") {
        return returnFeedPath(file.folder.path);
      }
      return file.folder.path;
    });
    router.actions.createFeedWithData(pathList);
  };

  const clearFeed = () => {
    dispatchLibrary({
      type: Types.SET_CLEAR_FILE_SELECT,
      payload: {
        clear: true,
      },
    });
    setDownload({
      show: false,
      error: "",
      count: 0,
      path: "",
    });
  };

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    eventKey: number | string
  ) => {
    setActiveTabKey(eventKey as number);
  };

  const handleDownload = async () => {
    setFetchingFiles(!fetchingFiles);

    Promise.all(
      selectedFolder.map(async (file: FileSelect) => {
        const { folder } = file;

        const { path: exactPath } = folder;
        const filesToPush: DownloadType = {
          name: file.folder.name,
          files: [],
        };

        const computePath =
          file.type === "feed" ? returnFeedPath(exactPath) : exactPath;

        const params = {
          limit: 1000,
          offset: 0,
          fname: computePath,
        };

        const client = ChrisAPIClient.getClient();
        if (file.type === "feed") {
          const feedFn = client.getFiles;
          const bindFn = feedFn.bind(client);
          const fileItems = await fetchResource(params, bindFn);
          filesToPush["files"].push(...fileItems);
        }

        if (file.type === "uploads") {
          const uploadsFn = client.getUploadedFiles;
          const uploadBound = uploadsFn.bind(client);
          const fileItems = await fetchResource(params, uploadBound);
          filesToPush["files"].push(...fileItems);
        }
        if (file.type === "services") {
          const pacsFn = client.getPACSFiles;
          const pacsBound = pacsFn.bind(client);
          const fileItems = await fetchResource(params, pacsBound);
          filesToPush["files"].push(...fileItems);
        }
        return filesToPush;
      })
    ).then((files) => {
      setFetchingFiles(false);
      if (files.length > 0) {
        downloadUtil(files);
      }
    });
  };

  const downloadUtil = async (filesItems: DownloadType[]) => {
    try {
      let writable;
      //@ts-ignore
      const existingDirectoryHandle = await window.showDirectoryPicker();
      for (let i = 0; i < filesItems.length; i++) {
        const { files, name } = filesItems[i];

        if (files.length > 0) {
          for (let index = 0; index < files.length; index++) {
            setDownload({
              ...download,
              show: true,
              count: Number(((index / files.length) * 100).toFixed(2)),
              path: `Downloading Files for the path ${name}`,
            });
            const file = files[index];
            const fileName = file.data.fname.split(`/`);
            const findIndex = fileName.findIndex(
              (file: string) => file === name
            );
            const fileNameSplit = fileName.slice(findIndex);
            const newDirectoryHandle: { [key: string]: any } = {};
            for (let fname = 0; fname < fileNameSplit.length; fname++) {
              const dictName = fileNameSplit[fname].replace(/:/g, "");
              if (fname === 0) {
                newDirectoryHandle[fname] =
                  await existingDirectoryHandle.getDirectoryHandle(dictName, {
                    create: true,
                  });
              } else if (fname === fileNameSplit.length - 1) {
                const blob = await file.getFileBlob();
                const existingHandle = newDirectoryHandle[fname - 1];
                if (existingHandle) {
                  const newFileHandle = await existingHandle.getFileHandle(
                    dictName,
                    {
                      create: true,
                    }
                  );
                  writable = await newFileHandle.createWritable();
                  await writable.write(blob);
                  await writable.close();
                }
              } else {
                const existingHandle = newDirectoryHandle[fname - 1];
                if (existingHandle) {
                  newDirectoryHandle[fname] =
                    await existingHandle.getDirectoryHandle(dictName, {
                      create: true,
                    });
                }
              }
            }

            setDownload({
              ...download,
              show: false,
              count: 100,
            });
          }
        } else {
        }
      }
    } catch (error) {
      setDownload({
        ...download,
        //@ts-ignore
        error: error,
      });
      setFetchingFiles(false);
    }
  };

  const handleDelete = () => {
    const errorWarnings: any[] = [];

    selectedFolder.map(async (file: FileSelect) => {
      const client = ChrisAPIClient.getClient();
      if (file.type === "uploads") {
        if (file.operation === "folder") {
          const paths = await client.getFileBrowserPath(file.folder.path);
          const fileList = await paths.getFiles({
            limit: 1000,
            offset: 0,
          });
          const files = fileList.getItems();
          if (files) {
            files.map(async (file: any) => {
              await file._delete();
            });
            dispatchLibrary(setDeleteFile(file));
            dispatchLibrary(clearSelectFolder(file));
          }
        } else {
          errorWarnings.push("file");
        }
      }

      if (file.type === "feed") {
        if (!errorWarnings.includes("feed")) {
          errorWarnings.push("feed");
        }
        setFeedFilestoDelete([...feedFilesToDelete, file]);
      }

      if (file.type === "services") {
        if (!errorWarnings.includes("services")) {
          errorWarnings.push("services");
        }
      }
    });

    setError(errorWarnings);
  };

  const handleDeleteFeed = async () => {
    const result = Promise.all(
      feedFilesToDelete.map(async (file) => {
        const feedId = file.folder.path
          .split("/")
          .find((feedString) => feedString.includes("feed"));

        if (feedId) {
          const id = feedId.split("_")[1];
          const client = ChrisAPIClient.getClient();
          const feed = await client.getFeed(parseInt(id));
          dispatchLibrary(setDeleteFile(file));
          dispatchLibrary(clearSelectFolder(file));
          return feed;
        }
      })
    );
    result.then((data) => dispatch(deleteFeed(data as Feed[])));
  };

  const uploadedFiles = (
    <section>
      <LocalSearch type="uploads" username={username} />
      <BrowserContainer
        type="uploads"
        path={`${username}/uploads`}
        username={username}
      />
    </section>
  );

  const feedFiles = (
    <section>
      <LocalSearch type="feed" username={username} />
      <BrowserContainer type="feed" path={`/`} username={username} />
    </section>
  );

  const servicesFiles = (
    <section>
      <LocalSearch type="services" username={username} />
      <BrowserContainer type="services" path={`SERVICES`} username={username} />
    </section>
  );

  const handleAddFolder = (directoryName: string) => {
    const folders =
      foldersState["uploads"] &&
      foldersState["uploads"][currentPath["uploads"]];

    const folderExists =
      folders && folders.findIndex((folder) => folder.name === directoryName);

    if (!folders || folderExists === -1) {
      dispatchLibrary({
        type: Types.SET_ADD_FOLDER,
        payload: {
          folder: directoryName,
          username,
        },
      });
    }
  };

  return (
    <>
      {selectedFolder.length > 0 && (
        <AlertGroup
          style={{
            zIndex: "999",
          }}
          isToast
        >
          <Alert
            type="info"
            description={
              <>
                <div
                  style={{
                    marginBottom: "1em",
                    display: "flex",
                  }}
                >
                  <Button
                    style={{ marginRight: "0.5em" }}
                    onClick={createFeed}
                    variant="primary"
                  >
                    Create Analysis
                  </Button>

                  <Button
                    style={{ marginRight: "0.5em" }}
                    onClick={() => {
                      handleDownload();
                    }}
                    variant="secondary"
                  >
                    Download Data
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                    Delete Data
                  </Button>
                </div>
                {selectedFolder.length > 0 && (
                  <>
                    <ChipGroup style={{ marginBottom: "1em" }} categoryName="">
                      {selectedFolder.map((file: FileSelect, index) => {
                        return (
                          <Chip
                            onClick={() => {
                              dispatchLibrary(clearSelectFolder(file));
                            }}
                            key={index}
                          >
                            {file.folder.path}
                          </Chip>
                        );
                      })}
                    </ChipGroup>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button variant="tertiary" onClick={clearFeed}>
                        Empty Cart
                      </Button>
                    </div>
                  </>
                )}
              </>
            }
            style={{ width: "100%", marginTop: "3em", padding: "2em" }}
          ></Alert>

          {fetchingFiles && (
            <Alert type="info" closable message="Fetching Files to Download" />
          )}

          {download.show && (
            <Alert
              type="info"
              closable
              message={
                <>
                  <span>{download.path}</span>
                  <AntProgress percent={download.count} size="small" />
                </>
              }
            />
          )}

          {error.length > 0 &&
            error.map((errorString, index) => {
              const errorUtil = (errorType: string) => {
                const newError = error.filter(
                  (errorWarn) => errorWarn !== errorType
                );
                setError(newError);
              };

              let warning = "";
              if (errorString === "feed") {
                warning = "Deleting a feed file deletes a feed";
              }
              if (errorString === "services") {
                warning = "Cannot Delete a pacs file currently";
              }

              if (errorString === "file") {
                warning = "Cannot delete a single file currently";
              }

              return (
                <Alert
                  key={index}
                  message={
                    <>
                      <div>{warning && warning}</div>
                      {errorString === "feed" && (
                        <>
                          {" "}
                          <Button
                            variant="link"
                            onClick={() => {
                              errorUtil(errorString);
                              handleDeleteFeed();
                            }}
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={() => {
                              errorUtil(errorString);
                            }}
                            variant="link"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </>
                  }
                  type="warning"
                  closable
                  onClose={() => {
                    errorUtil(errorString);
                  }}
                ></Alert>
              );
            })}
        </AlertGroup>
      )}

      <UploadComponent
        handleFileModal={handleFileModal}
        handleLocalFiles={handleLocalFiles}
        uploadFileModal={uploadFileModal}
        handleAddFolder={handleAddFolder}
        localFiles={localFiles}
      />

      <div
        style={{
          display: "flex",
        }}
      >
        <Button
          style={{
            marginLeft: "auto",
          }}
          variant="link"
          icon={<FaUpload />}
          onClick={handleFileModal}
        >
          Upload Files
        </Button>
        <Button
          onClick={() => {
            if (state.columnLayout === "multi") {
              dispatchLibrary(setMultiColumnLayout("single"));
            } else {
              dispatchLibrary(setMultiColumnLayout("multi"));
            }
          }}
          variant="link"
        >
          Switch Column Layout
        </Button>
      </div>
      <Tabs
        style={{
          width: "50%",
        }}
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        aria-label="Tabs in the default example"
      >
        <Tab eventKey={0} title={<TabTitleText>Uploads</TabTitleText>}>
          {activeTabKey === 0 && uploadedFiles}
        </Tab>
        <Tab
          eventKey={1}
          title={<TabTitleText>Completed Analyses</TabTitleText>}
        >
          {activeTabKey === 1 && feedFiles}
        </Tab>
        <Tab eventKey={2} title={<TabTitleText>Services / PACS</TabTitleText>}>
          {activeTabKey === 2 && servicesFiles}
        </Tab>
      </Tabs>
    </>
  );
};

export default DataLibrary;

interface UploadComponent {
  handleFileModal: () => void;
  handleLocalFiles: (files: LocalFile[]) => void;
  uploadFileModal: boolean;
  localFiles: LocalFile[];
  handleAddFolder: (path: string) => void;
}

const UploadComponent = ({
  handleFileModal,
  handleLocalFiles,
  handleAddFolder,
  uploadFileModal,
  localFiles,
}: UploadComponent) => {
  const username = useTypedSelector((state) => state.user.username);
  const [warning, setWarning] = React.useState("");
  const [directoryName, setDirectoryName] = React.useState("");
  const [count, setCount] = React.useState(0);

  return (
    <Modal
      title="Upload Files"
      onClose={() => {
        handleFileModal();
      }}
      isOpen={uploadFileModal}
      variant={ModalVariant.small}
      arial-labelledby="file-upload"
    >
      <Form isHorizontal>
        <FormGroup
          fieldId="directory name"
          label="Directory Name"
          helperText="Set a directory name"
        >
          <TextInput
            id="horizontal form name"
            value={directoryName}
            type="text"
            name="horizontal-form-name"
            onChange={(value) => {
              setWarning("");
              setDirectoryName(value);
            }}
          />
        </FormGroup>
      </Form>
      {localFiles.length > 0 && (
        <div
          style={{
            margin: "1em 0 0.5em 0",
          }}
        >
          <b>Total Number of Files to Upload: {localFiles.length}</b>
        </div>
      )}
      {warning && (
        <div
          style={{
            margin: "1em 0 1em, 0",
            color: "red",
          }}
        >
          {warning}
        </div>
      )}
      {localFiles.length > 0 && directoryName && (
        <Progress
          style={{
            margin: "1em 0 1em 0",
          }}
          title="File Upload Tracker"
          value={count}
          min={0}
          max={localFiles.length}
          measureLocation={ProgressMeasureLocation.top}
          label={`${count} out of ${localFiles.length}`}
          valueText={`${count} out of ${localFiles.length}`}
          variant={
            count === localFiles.length ? ProgressVariant.success : undefined
          }
        />
      )}
      <FileUpload
        className=""
        handleDeleteDispatch={() => {
          console.log("Test");
        }}
        localFiles={[]}
        dispatchFn={async (files) => {
          if (!directoryName) {
            setWarning("Please add a directory name");
          } else {
            if (directoryName) {
              handleAddFolder(directoryName);
              handleLocalFiles(files);
              const client = ChrisAPIClient.getClient();
              const path = `${username}/uploads/${directoryName}`;
              for (let i = 0; i < files.length; i++) {
                const file = files[i];
                await client.uploadFile(
                  {
                    upload_path: `${path}/${file.name}`,
                  },
                  {
                    fname: (file as LocalFile).blob,
                  }
                );
                setCount(i + 1);
              }

              /** Temporary Timer */

              setTimeout(() => {
                setDirectoryName("");
                handleFileModal();
              }, 1000);
            }
          }
        }}
      />
    </Modal>
  );
};
