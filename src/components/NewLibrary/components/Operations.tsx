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
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { matchPath, useLocation } from "react-router";
import { getFileName } from "../../../api/common";
import { removeSelectedPayload } from "../../../store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
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

// -------------- 1) AdditionalValues interface --------------
export type AdditionalValues = {
  share: {
    public?: boolean; // If true => Make resource public
    write?: boolean; // If true => Grant write permission
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
  const dispatch = useAppDispatch();

  // If path is exactly /feeds, we treat it as "feed table"
  const isFeedsTable =
    matchPath({ path: "/feeds", end: true }, location.pathname) !== null;

  // By default, show “New Folder”, “File Upload”, “Folder Upload”
  // If user is at /feeds, disable "New Folder"
  const OPERATION_ITEMS = useMemo(() => {
    const baseItems = [
      { key: "newFolder", label: "New Folder", disabled: false },
      { key: "fileUpload", label: "File Upload", disabled: false },
      { key: "folderUpload", label: "Folder Upload", disabled: false },
    ];

    if (isFeedsTable) {
      // Can't create new folder in /feeds
      baseItems[0].disabled = true;
    }
    return baseItems;
  }, [isFeedsTable]);

  // -------------- 2) Hook for all folder/file operations --------------
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

  // -------------- 3) Redux cart: selectedPaths --------------
  const selectedPaths = useAppSelector((state) => state.cart.selectedPaths);
  const selectedPathsCount = selectedPaths.length;

  // -------------- 4) Render Buttons (Download, Anonymize, etc.) --------------
  const renderOperationButton = useCallback(
    (icon: React.ReactNode, operationKey: string, ariaLabel: string) => (
      <Tooltip content={ariaLabel}>
        <Button
          style={{ marginRight: "1em" }}
          icon={icon}
          size="sm"
          onClick={() => handleOperations(operationKey)}
          variant="tertiary"
          aria-label={ariaLabel}
          isDisabled={operationKey === "duplicate"}
        />
      </Tooltip>
    ),
    [handleOperations],
  );

  // -------------- 5) Build the set of items in the Toolbar --------------
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
      OPERATION_ITEMS,
      renderOperationButton,
    ],
  );

  // -------------- 6) Return the final JSX --------------
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

export default Operations;

// -------------------- 7) Modal Label definitions --------------------
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

// -------------- 8) AddModal: share with optional username if “Make Public” is checked --------------
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
    share: { write: false, public: false },
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
  }, [modalState.type, modalState.additionalProps]);

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  // We allow an empty username if “Make resource public” is checked
  const isShareModal = modalState.type === "share";

  // If user is in "share" mode, we only disable if both conditions are false:
  // - user hasn't typed a name
  // - user didn't check “Make public”
  const isDisabled =
    !inputValue && !additionalValues.share.public && isShareModal
      ? true
      : // For all other modes, disable if no input
        !inputValue && !isShareModal;

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
                onSubmit(inputValue, additionalValues);
              }
            }}
            aria-label={inputLabel}
            placeholder={inputLabel}
          />
          {modalState.type === "createFeedWithFile" ||
          modalState.type === "createFeed" ? (
            <HelperText>
              <HelperTextItem>
                Please provide a name for your feed or hit 'Create' to use the
                default name
              </HelperTextItem>
            </HelperText>
          ) : null}
        </FormGroup>

        {modalState.type === "share" && (
          <Fragment>
            <FormGroup fieldId="share-checkbox-group">
              <Checkbox
                label="Grant the user permission to edit this resource"
                id="share-checkbox-write"
                isChecked={additionalValues.share.write}
                onChange={(_e, checked) =>
                  setAdditionalValues((prevState) => ({
                    share: { ...prevState.share, write: checked },
                  }))
                }
              />
            </FormGroup>
            <FormGroup fieldId="share-checkbox-public">
              <Checkbox
                label="Make this resource public"
                id="share-checkbox-public"
                isChecked={additionalValues.share.public}
                onChange={(_e, checked) =>
                  setAdditionalValues((prevState) => ({
                    share: { ...prevState.share, public: checked },
                  }))
                }
              />
            </FormGroup>
          </Fragment>
        )}

        {indicators.isError && (
          <Alert
            message="Failed operation"
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
            isDisabled={isDisabled}
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
