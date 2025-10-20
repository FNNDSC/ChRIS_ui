import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import {
  ActionGroup,
  Button,
  Checkbox,
  Form,
  HelperText,
  HelperTextItem,
  Modal,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import type { DefaultError } from "@tanstack/react-query";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { Alert as AntdAlert } from "../../Antd";
import type { OriginState } from "../context";
import { type ModalState, useFolderOperations } from "../utils/useOperations";
import LayoutSwitch from "./LayoutSwitch";
import "./Operations.css";
import { AddNodeProvider } from "../../AddNode/context";
import { CreateFeedProvider } from "../../CreateFeed/context";
import { PipelineProvider } from "../../PipelinesCopy/context";
import CreateAnalysis from "./operations/CreateAnalysis";
import Delete from "./operations/Delete";
import Download from "./operations/Download";
import Merge from "./operations/Merge";
import PayloadList from "./operations/PayloadList";
import Rename from "./operations/Rename";
import Share from "./operations/Share";
import UploadData from "./operations/UploadData";

export type AdditionalValues = {
  share: {
    public?: boolean;
  };
};

type Props = {
  username: string;
  origin: OriginState;
  computedPath?: string;
  folderList?: FileBrowserFolderList;
  customStyle?: {
    [key: string]: React.CSSProperties;
  };
  customClassName?: {
    [key: string]: string;
  };
};

export default (props: Props) => {
  const {
    username,
    origin,
    computedPath,
    folderList,
    customStyle,
    customClassName,
  } = props;
  const location = useLocation();
  const dispatch = useAppDispatch();

  const isFeedsTable = true;

  const {
    modalState,
    userRelatedError,
    folderInputRef,
    fileInputRef,
    createFeedWithFile,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder,
    setUserRelatedError,
    setModalState,
  } = useFolderOperations(
    username,
    origin,
    computedPath,
    folderList,
    isFeedsTable,
  );

  console.info("Operations: modalState:", modalState);

  const selectedPaths = useAppSelector((state) => state.cart.selectedPaths);
  const selectedPathsCount = selectedPaths.length;

  const toolbarItems = useMemo(
    () => (
      <Fragment>
        {contextHolder}
        <ToolbarItem>
          <UploadData handleOperations={handleOperations} />
          {userRelatedError && (
            <AntdAlert
              style={{ marginLeft: "1rem" }}
              type="error"
              description={userRelatedError}
              closable
              onClose={() => setUserRelatedError("")}
            />
          )}
        </ToolbarItem>

        <ToolbarItem>
          <CreateFeedProvider>
            <PipelineProvider>
              <AddNodeProvider>
                <CreateAnalysis
                  handleOperations={handleOperations}
                  count={selectedPathsCount}
                />
              </AddNodeProvider>
            </PipelineProvider>
          </CreateFeedProvider>

          <Download
            handleOperations={handleOperations}
            count={selectedPathsCount}
          />

          <Merge
            handleOperations={handleOperations}
            count={selectedPathsCount}
          />

          <Share
            handleOperations={handleOperations}
            count={selectedPathsCount}
          />

          <Delete
            handleOperations={handleOperations}
            count={selectedPathsCount}
          />
        </ToolbarItem>

        <ToolbarItem>
          <Rename
            handleOperations={handleOperations}
            count={selectedPathsCount}
          />
        </ToolbarItem>

        <ToolbarItem>
          <PayloadList selectedPaths={selectedPaths} dispatch={dispatch} />
        </ToolbarItem>
      </Fragment>
    ),
    [
      contextHolder,
      userRelatedError,
      selectedPaths,
      selectedPathsCount,
      dispatch,
      handleOperations,
      setUserRelatedError,
    ],
  );

  return (
    <>
      <AddModal
        modalState={modalState}
        onClose={() => {
          handleModalSubmitMutation.reset();
          setModalState({ isOpen: false, type: "" });
        }}
        onSubmit={(inputValue, additionalValues) =>
          handleModalSubmitMutation.mutate({ inputValue, additionalValues })
        }
        indicators={{
          isPending: handleModalSubmitMutation.isPending,
          isError: handleModalSubmitMutation.isError,
          error: handleModalSubmitMutation.error as DefaultError,
          clearErrors: () => handleModalSubmitMutation.reset(),
        }}
      />

      {/* Hidden file/folder pickers */}
      <input
        ref={fileInputRef}
        multiple
        type="file"
        hidden
        onChange={(e) => {
          createFeedWithFile(e, "file");
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        hidden
        //@ts-ignore
        webkitdirectory=""
        directory=""
        onChange={(e) => {
          createFeedWithFile(e, "folder");
        }}
      />

      {/* The main toolbar */}
      <Toolbar
        style={customStyle?.toolbar}
        className={customClassName?.toolbar}
      >
        <ToolbarContent style={customStyle?.toolbarItem}>
          {toolbarItems}
          {location.pathname.startsWith("/library/") && (
            <ToolbarItem align={{ default: "alignRight" }}>
              <LayoutSwitch />
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>
    </>
  );
};

const MODAL_TYPE_LABELS: Record<
  string,
  { modalTitle: string; inputLabel: string; buttonLabel: string }
> = {
  group: {
    modalTitle: "Create a new Group",
    inputLabel: "Group Name",
    buttonLabel: "Create",
  },
  share: {
    modalTitle: "Share this Folder",
    inputLabel: "User Name (optional if making public)",
    buttonLabel: "Share",
  },
  rename: {
    modalTitle: "Rename",
    inputLabel: "Rename",
    buttonLabel: "Rename",
  },
  createFeed: {
    modalTitle: "Create Feed",
    inputLabel: "Feed Name",
    buttonLabel: "Create",
  },
  createFeedWithFile: {
    modalTitle: "Create Feed",
    inputLabel: "Feed Name",
    buttonLabel: "Create",
  },
  default: {
    modalTitle: "Create a new Folder",
    inputLabel: "Folder Name",
    buttonLabel: "Create",
  },
};

interface AddModalProps {
  modalState: ModalState;
  onClose: () => void;
  onSubmit: (inputValue: string, additionalValues?: AdditionalValues) => void;
  indicators: {
    isPending: boolean;
    isError: boolean;
    error: DefaultError | null;
    clearErrors: () => void;
  };
}

export const AddModal = ({
  modalState,
  onClose,
  onSubmit,
  indicators,
}: AddModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const [additionalValues, setAdditionalValues] = useState<AdditionalValues>({
    share: { public: false },
  });

  const { modalTitle, inputLabel, buttonLabel } = useMemo(() => {
    const modalType =
      MODAL_TYPE_LABELS[modalState.type] ?? MODAL_TYPE_LABELS.default;
    return {
      modalTitle: modalType.modalTitle,
      inputLabel: modalType.inputLabel,
      buttonLabel: modalType.buttonLabel,
    };
  }, [modalState.type]);

  const userIsTypingUsername =
    modalState.type === "share" && inputValue.length > 0;
  const userSelectedPublic =
    modalState.type === "share" && additionalValues.share.public;
  const showMutualExclusiveAlert = userIsTypingUsername || userSelectedPublic;

  useEffect(() => {
    if (modalState.additionalProps?.createFeedWithFile) {
      setInputValue(
        modalState.additionalProps.createFeedWithFile.defaultFeedName,
      );
    }
    if (modalState.additionalProps?.createFeed) {
      setInputValue(modalState.additionalProps.createFeed.defaultFeedName);
    }

    if (
      modalState.type === "rename" &&
      modalState.additionalProps?.defaultName
    ) {
      setInputValue(modalState.additionalProps.defaultName);
    }
  }, [modalState.additionalProps, modalState.type]);

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  const isShareModal = modalState.type === "share";

  const isDisabled = isShareModal
    ? !additionalValues.share.public && !inputValue
    : !inputValue;

  return (
    <Modal
      isOpen={modalState.isOpen}
      variant="small"
      aria-label={modalTitle}
      title={modalTitle}
      onClose={handleClose}
    >
      <Form>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <TextInput
              name="input"
              value={inputValue}
              onChange={(_e, value) => setInputValue(value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit(inputValue, additionalValues);
                }
              }}
              aria-label={inputLabel}
              placeholder={inputLabel}
              isDisabled={isShareModal && additionalValues.share.public}
            />
            {/* Reserved space for helper text to prevent layout shifts */}
            <div style={{ minHeight: "20px", marginTop: "2px" }}>
              {modalState.type === "createFeedWithFile" ||
              modalState.type === "createFeed" ? (
                <HelperText>
                  <HelperTextItem>
                    Please provide a name for your feed or hit 'Create' to use
                    the default name
                  </HelperTextItem>
                </HelperText>
              ) : isShareModal ? (
                <HelperText>
                  <HelperTextItem variant="warning">
                    You can either share with a specific user OR make the
                    resource public, not both.
                  </HelperTextItem>
                </HelperText>
              ) : (
                /* Empty space to maintain consistent layout */
                <div />
              )}
            </div>
          </div>

          {isShareModal && (
            <div style={{ marginTop: "0.5rem" }}>
              <Checkbox
                id="make-public"
                label="Make this resource public"
                isChecked={additionalValues.share.public}
                isDisabled={userIsTypingUsername}
                onChange={(_event, checked) => {
                  setAdditionalValues({
                    ...additionalValues,
                    share: { public: checked },
                  });
                }}
              />
            </div>
          )}

          {/* Reserved space for error alerts to prevent layout shifts */}
          <div style={{ minHeight: "20px", marginTop: "2px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid rgba(220, 53, 69, 0.5)",
                borderRadius: "3px",
                padding: "0 16px",
                backgroundColor: "rgba(220, 53, 69, 0.08)",
                color: "#dc3545",
                opacity: indicators.isError ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
              }}
            >
              <span style={{ fontWeight: "bold", marginRight: "8px" }}>
                Failed operation:
              </span>{" "}
              {indicators.error?.message || ""}
              {indicators.isError && (
                <Button
                  variant="plain"
                  style={{ marginLeft: "auto", padding: "0" }}
                  onClick={() => indicators.clearErrors()}
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          <ActionGroup>
            <Button
              onClick={() => onSubmit(inputValue, additionalValues)}
              isLoading={indicators.isPending}
              isDisabled={isDisabled}
            >
              {buttonLabel}
            </Button>
            <Button variant="link" onClick={handleClose}>
              Cancel
            </Button>
          </ActionGroup>
        </div>
      </Form>
    </Modal>
  );
};
