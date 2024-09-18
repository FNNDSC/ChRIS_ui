import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import {
  ActionGroup,
  Button,
  Checkbox,
  Chip,
  ChipGroup,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  Modal,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import type { DefaultError } from "@tanstack/react-query";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { matchPath, useLocation } from "react-router";
import { getFileName } from "../../../api/common";
import { removeSelectedPayload } from "../../../store/cart/cartSlice";
import { useTypedSelector } from "../../../store/hooks";
import { Alert, Dropdown } from "../../Antd";
import {
  AddIcon,
  ArchiveIcon,
  CodeBranchIcon,
  DeleteIcon,
  DownloadIcon,
  DuplicateIcon,
  EditIcon,
  MergeIcon,
  ShareIcon,
} from "../../Icons";
import type { OriginState } from "../context";
import { type ModalState, useFolderOperations } from "../utils/useOperations";
import LayoutSwitch from "./LayoutSwitch";
import "./Operations.css";

export type AdditionalValues = {
  share: {
    read?: boolean;
    write?: boolean;
  };
};

interface OperationProps {
  origin: OriginState;
  computedPath?: string;
  folderList?: FileBrowserFolderList;
  customStyle?: {
    [key: string]: React.CSSProperties;
  };
  customClassName?: {
    [key: string]: string;
  };
}

const Operations = ({
  origin,
  computedPath,
  folderList,
  customStyle,
  customClassName,
}: OperationProps) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isFeedsTable =
    matchPath({ path: "/feeds", end: true }, location.pathname) !== null; // This checks if the path matches and returns true or false
  const OPERATION_ITEMS = useMemo(
    () => [
      { key: "newFolder", label: "New Folder", disabled: false },
      { key: "fileUpload", label: "File Upload", disabled: false },
      { key: "folderUpload", label: "Folder Upload", disabled: false },
    ],
    [],
  );

  if (isFeedsTable) {
    OPERATION_ITEMS[0].disabled = true;
  }

  const {
    modalState,
    userRelatedError,
    folderInputRef,
    fileInputRef,
    handleFileChange,
    createFeedWithFile,
    handleFolderChange,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder,
    setUserRelatedError,
    setModalState,
  } = useFolderOperations(origin, computedPath, folderList, isFeedsTable);

  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const selectedPathsCount = selectedPaths.length;

  const renderOperationButton = (
    icon: React.ReactNode,
    operationKey: string,
    ariaLabel: string,
  ) => (
    <Tooltip content={ariaLabel}>
      <Button
        style={{ marginRight: "1em" }}
        icon={icon}
        size="sm"
        onClick={() => handleOperations(operationKey)}
        variant="tertiary"
        aria-label={ariaLabel}
      />
    </Tooltip>
  );

  const toolbarItems = useMemo(
    () => (
      <Fragment>
        {contextHolder}
        <ToolbarItem>
          <Dropdown
            menu={{
              items: OPERATION_ITEMS,
              selectable: true,
              onClick: (info) => handleOperations(info.key),
            }}
          >
            <Button
              size="sm"
              icon={
                <AddIcon
                  style={{ color: "inherit", height: "1em", width: "1em" }}
                />
              }
            >
              New
            </Button>
          </Dropdown>
          {userRelatedError && (
            <Alert
              style={{ marginLeft: "1rem" }}
              type="error"
              description={userRelatedError}
              closable
              onClose={() => setUserRelatedError("")}
            />
          )}
        </ToolbarItem>
        {selectedPathsCount > 0 && (
          <>
            {renderOperationButton(
              <CodeBranchIcon />,
              "createFeed",
              "Create a new feed",
            )}
            {renderOperationButton(
              <DownloadIcon />,
              "download",
              "Download selected items",
            )}
            {renderOperationButton(
              <ArchiveIcon />,
              "anonymize",
              "Anonymize selected items",
            )}
            {renderOperationButton(
              <MergeIcon />,
              "merge",
              "Merge selected items",
            )}
            {renderOperationButton(
              <DuplicateIcon />,
              "duplicate",
              "Copy selected items",
            )}
            {renderOperationButton(
              <ShareIcon />,
              "share",
              "Share selected items",
            )}

            {renderOperationButton(<EditIcon />, "rename", "Rename")}
            {renderOperationButton(
              <DeleteIcon />,
              "delete",
              "Delete selected items",
            )}
            <ToolbarItem>
              <ChipGroup>
                {selectedPaths.map((selection) => (
                  <Chip
                    key={selection.path}
                    onClick={() => dispatch(removeSelectedPayload(selection))}
                  >
                    {getFileName(selection.path)}
                  </Chip>
                ))}
              </ChipGroup>
            </ToolbarItem>
          </>
        )}
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
      <input
        ref={fileInputRef}
        multiple
        type="file"
        hidden
        onChange={(e) => {
          if (matchPath({ path: "/feeds", end: true }, location.pathname)) {
            createFeedWithFile(e, "file");
          } else {
            handleFileChange(e);
          }
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
          if (matchPath({ path: "/feeds", end: true }, location.pathname)) {
            createFeedWithFile(e, "folder");
          } else {
            handleFolderChange(e);
          }
        }}
      />
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

export default Operations;

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
    inputLabel: "User Name",
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
    share: { read: false, write: true },
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

  useEffect(() => {
    if (modalState.additionalProps?.createFeedWithFile) {
      setInputValue(
        modalState.additionalProps.createFeedWithFile.defaultFeedName,
      );
    }
    if (modalState.additionalProps?.createFeed) {
      setInputValue(modalState.additionalProps.createFeed.defaultFeedName);
    }
  }, [modalState.type]);

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  return (
    <Modal
      isOpen={modalState.isOpen}
      variant="small"
      aria-label={modalTitle}
      title={modalTitle}
      onClose={handleClose}
    >
      <Form>
        <FormGroup>
          <TextInput
            name="input"
            value={inputValue}
            onChange={(_e, value) => setInputValue(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit(inputValue);
              }
            }}
            aria-label={inputLabel}
            placeholder={inputLabel}
          />
          {modalState.type === "createFeedWithFile" ||
            (modalState.type === "createFeed" && (
              <HelperText>
                <HelperTextItem>
                  Please provide a name for your feed or hit 'Create' to use the
                  default name
                </HelperTextItem>
              </HelperText>
            ))}
        </FormGroup>
        {modalState.type === "share" && (
          <Fragment>
            <FormGroup fieldId="share-checkbox-group">
              <Checkbox
                label="Read"
                id="share-checkbox-1"
                isChecked={additionalValues.share.read}
                onChange={(_e, checked) =>
                  setAdditionalValues((prevState) => ({
                    share: { ...prevState.share, read: checked },
                  }))
                }
              />
              <Checkbox
                label="Write"
                id="share-checkbox-2"
                isChecked={additionalValues.share.write}
                onChange={(_e, checked) =>
                  setAdditionalValues((prevState) => ({
                    share: { ...prevState.share, write: checked },
                  }))
                }
              />
            </FormGroup>
          </Fragment>
        )}
        {indicators.isError && (
          <Alert
            message="Failed to create a new folder"
            description={indicators.error?.message}
            type="error"
            showIcon
            closable
            afterClose={() => indicators.clearErrors()}
          />
        )}
        <ActionGroup>
          <Button
            onClick={() => onSubmit(inputValue, additionalValues)}
            isLoading={indicators.isPending}
            isDisabled={!inputValue}
          >
            {buttonLabel}
          </Button>
          <Button variant="link" onClick={handleClose}>
            Cancel
          </Button>
        </ActionGroup>
      </Form>
    </Modal>
  );
};
