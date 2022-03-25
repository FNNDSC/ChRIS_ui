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
} from "@patternfly/react-core";
import FeedsBrowser from "./FeedsBrowser";
import UploadsBrowser from "./UploadsBrowser";
import ServicesBrowser from "./ServicesBrowser";
import { FaUpload } from "react-icons/fa";
import FileUpload from "../../../../components/common/fileupload";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { LocalFile } from "../../../../components/feed/CreateFeed/types";
import { useTypedSelector } from "../../../../store/hooks";
import { LibraryContext, Types } from "./context";

const DataLibrary = () => {
  const { state } = useContext(LibraryContext);
  const [uploadFileModal, setUploadFileModal] = React.useState(false);
  const [localFiles, setLocalFiles] = React.useState<LocalFile[]>([]);
  const [directoryName, setDirectoryName] = React.useState("");
  const { filesState } = state;

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

  return (
    <>
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
              Upload a folder
            </Button>
          </SplitItem>
        </Split>
      </section>

      {filesState && !filesState["feed"] && !filesState["services"] && (
        <section>
          <Split>
            <SplitItem>
              <h3>Uploaded Files</h3>
            </SplitItem>
            <SplitItem style={{ margin: "auto 1em" }} isFilled>
              <hr />
            </SplitItem>
          </Split>
          <UploadsBrowser />
        </section>
      )}

      {filesState && !filesState["uploads"] && !filesState["services"] && (
        <section>
          <Split>
            <SplitItem>
              <h3>Feed Files</h3>
            </SplitItem>
            <SplitItem style={{ margin: "auto 1em" }} isFilled>
              <hr />
            </SplitItem>
          </Split>
          <FeedsBrowser />
        </section>
      )}

      {filesState && !filesState["feed"] && !filesState["uploads"] && (
        <section>
          <Split>
            <SplitItem>
              <h3>Services Files</h3>
            </SplitItem>
            <SplitItem style={{ margin: "auto 1em" }} isFilled>
              <hr />
            </SplitItem>
          </Split>
          <ServicesBrowser />
        </section>
      )}
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
  const { dispatch } = useContext(LibraryContext);
  const [warning, setWarning] = React.useState("");
  const username = useTypedSelector((state) => state.user.username);
  const [count, setCount] = React.useState(0);

  const handleAddFolder = (directoryName: string) => {
    dispatch({
      type: Types.SET_ADD_FOLDER,
      payload: {
        folder: directoryName,
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
