import React, { useContext } from "react";
import {
  Split,
  SplitItem,
  Button,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Alert,
  AlertGroup,
  AlertActionLink,
  ChipGroup,
  Chip,
} from "@patternfly/react-core";
import BrowserContainer from "./BrowserContainer";
import { FaUpload } from "react-icons/fa";
import FileUpload from "../../../../components/common/fileupload";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { LocalFile } from "../../../../components/feed/CreateFeed/types";
import { useTypedSelector } from "../../../../store/hooks";
import { LibraryContext, Types } from "./context";
import { MainRouterContext } from "../../../../routes";

const DataLibrary = () => {
  const username = useTypedSelector((state) => state.user.username);
  const { state, dispatch } = useContext(LibraryContext);
  const router = useContext(MainRouterContext);
  const [uploadFileModal, setUploadFileModal] = React.useState(false);
  const [localFiles, setLocalFiles] = React.useState<LocalFile[]>([]);
  const [directoryName, setDirectoryName] = React.useState("");
  const { isRoot, multipleFileSelect, fileSelect } = state;

  const rootCheck = Object.keys(isRoot).length > 0;

  const handleFileModal = () => {
    setUploadFileModal(!uploadFileModal);
    setLocalFiles([]);
    setDirectoryName("");
  };

  const handleLocalFiles = (files: LocalFile[]) => {
    setLocalFiles(files);
  };

  const handleDirectoryName = (directoryName: string) => {
    setDirectoryName(directoryName);
  };

  const createFeed = () => {
    router.actions.createFeedWithData(fileSelect);
  };

  const clearFeed = () => {
    dispatch({
      type: Types.SET_CLEAR_FILE_SELECT,
      payload: {
        clear: true,
      },
    });
  };

  const uploadedFiles = (
    <section>
      <Split>
        <SplitItem>
          <h3>Uploads</h3>
        </SplitItem>
        <SplitItem style={{ margin: "auto 1em" }} isFilled>
          <hr />
        </SplitItem>
      </Split>
      <BrowserContainer
        type="uploads"
        path={`${username}/uploads`}
        username={username}
      />
    </section>
  );

  const feedFiles = (
    <section>
      <Split>
        <SplitItem>
          <h3>Completed Analyses</h3>
        </SplitItem>
        <SplitItem style={{ margin: "auto 1em" }} isFilled>
          <hr />
        </SplitItem>
      </Split>
      <BrowserContainer type="feed" path={`${username}`} username={username} />
    </section>
  );

  const servicesFiles = (
    <section>
      <Split>
        <SplitItem>
          <h3>External Services</h3>
        </SplitItem>
        <SplitItem style={{ margin: "auto 1em" }} isFilled>
          <hr />
        </SplitItem>
      </Split>
      <BrowserContainer type="services" path={`SERVICES`} username={username} />
    </section>
  );

  return (
    <>
      {multipleFileSelect && (
        <AlertGroup isToast>
          <Alert
            title="Multiple File Select"
            variant="info"
            style={{ width: "100%", marginTop: "3em" }}
            actionLinks={
              <>
                <AlertActionLink onClick={createFeed}>
                  Create Feed
                </AlertActionLink>
                <AlertActionLink onClick={clearFeed}>Clear</AlertActionLink>
              </>
            }
          >
            <ChipGroup>
              {fileSelect.length > 0 &&
                fileSelect.map((file: string, index) => {
                  return (
                    <Chip
                      onClick={() => {
                        dispatch({
                          type: Types.SET_REMOVE_FILE_SELECT,
                          payload: {
                            path: file,
                          },
                        });
                      }}
                      key={index}
                    >
                      {file}
                    </Chip>
                  );
                })}
            </ChipGroup>
          </Alert>
        </AlertGroup>
      )}

      <section>
        <Split>
          <UploadComponent
            handleFileModal={handleFileModal}
            handleLocalFiles={handleLocalFiles}
            uploadFileModal={uploadFileModal}
            handleDirectoryName={handleDirectoryName}
            directoryName={directoryName}
            localFiles={localFiles}
          />

          <SplitItem>
            <Button icon={<FaUpload />} onClick={handleFileModal}>
              Upload Files
            </Button>
            <Button
              onClick={() => {
                dispatch({
                  type: Types.SET_MULTIPLE_FILE_SELECT,
                  payload: {
                    active: !multipleFileSelect,
                  },
                });
              }}
              style={{ marginLeft: "1em" }}
            >
              {`Multiple Element Select:${
                multipleFileSelect === true ? " On" : " Off"
              }`}
            </Button>
          </SplitItem>
        </Split>
      </section>

      {!rootCheck
        ? uploadedFiles
        : isRoot["uploads"]
        ? uploadedFiles
        : undefined}
      {!rootCheck ? feedFiles : isRoot["feed"] ? feedFiles : undefined}
      {!rootCheck
        ? servicesFiles
        : isRoot["services"]
        ? servicesFiles
        : undefined}
    </>
  );
};

export default DataLibrary;

const UploadComponent = ({
  handleFileModal,
  handleLocalFiles,
  uploadFileModal,
  localFiles,
  directoryName,
  handleDirectoryName,
}: {
  handleFileModal: () => void;
  handleLocalFiles: (files: LocalFile[]) => void;
  uploadFileModal: boolean;
  localFiles: LocalFile[];
  directoryName: string;
  handleDirectoryName: (path: string) => void;
}) => {
  const username = useTypedSelector((state) => state.user.username);
  const { dispatch } = useContext(LibraryContext);
  const [warning, setWarning] = React.useState("");
  const [count, setCount] = React.useState(0);

  const handleAddFolder = (directoryName: string) => {
    dispatch({
      type: Types.SET_ADD_FOLDER,
      payload: {
        folder: directoryName,
        username,
      },
    });
  };
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
              handleDirectoryName(value);
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
          handleLocalFiles(files);
          if (!directoryName) {
            setWarning("Please add a directory name");
          } else {
            if (directoryName) {
              handleAddFolder(directoryName);
            }
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
          }
        }}
      />
    </Modal>
  );
};
