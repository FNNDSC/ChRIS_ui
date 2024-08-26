import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import {
  ActionGroup,
  Button,
  Checkbox,
  Chip,
  ChipGroup,
  Form,
  FormGroup,
  Modal,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import type { DefaultError } from "@tanstack/react-query";
import React, {
  Fragment,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router";
import { getFileName } from "../../../api/common";
import { removeSelectedPayload } from "../../../store/cart/cartSlice";
import { useTypedSelector } from "../../../store/hooks";
import { Alert, Dropdown, Spin } from "../../Antd";
import {
  AddIcon,
  ArchiveIcon,
  CodeBranchIcon,
  DeleteIcon,
  DownloadIcon,
  DuplicateIcon,
  MergeIcon,
  ShareIcon,
} from "../../Icons";
import type { OriginState } from "../context";
import { useFolderOperations } from "../utils/useOperations";
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

const items = [
  { key: "newFolder", label: "New Folder" },
  { key: "fileUpload", label: "File Upload" },
  { key: "folderUpload", label: "Folder Upload" },
];

const Operations = React.forwardRef((props: OperationProps, ref) => {
  const location = useLocation();
  const { origin, computedPath, folderList, customStyle, customClassName } =
    props;
  const dispatch = useDispatch();
  const {
    modalInfo,
    userError,
    folderInput,
    fileInput,
    handleFileChange,
    handleFolderChange,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder,
    setUserErrors,
    setModalInfo,
  } = useFolderOperations(
    origin,
    computedPath,
    folderList,
    location.pathname === "/feeds",
  );

  useImperativeHandle(ref, () => ({
    triggerFileUpload: () => {
      fileInput.current?.click();
    },
    triggerFolderUpload: () => {
      folderInput.current?.click();
    },
  }));

  const { selectedPaths } = useTypedSelector((state) => state.cart);
  const selectedPathsCount = selectedPaths.length;

  const renderOperationButton = (
    icon: React.ReactNode,
    operationKey: string,
    ariaLabel: string,
  ) => (
    <Tooltip content={ariaLabel}>
      <Button
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
              items,
              selectable: true,
              onClick: (info) => {
                handleOperations(info.key);
              },
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
          {userError && (
            <Alert
              style={{ marginLeft: "1rem" }}
              type="error"
              description={userError}
              closable
              onClose={() => setUserErrors("")}
            />
          )}
        </ToolbarItem>
        {selectedPathsCount > 0 && (
          <>
            <ToolbarItem>
              {renderOperationButton(
                <CodeBranchIcon />,
                "createFeed",
                "Create a new feed",
              )}
            </ToolbarItem>
            <ToolbarItem>
              {renderOperationButton(
                <DownloadIcon />,
                "download",
                "Download selected items",
              )}
            </ToolbarItem>
            <ToolbarItem>
              {renderOperationButton(
                <ArchiveIcon />,
                "anonymize",
                "Anonymize selected items",
              )}
            </ToolbarItem>
            <ToolbarItem>
              {renderOperationButton(
                <MergeIcon />,
                "merge",
                "Merge selected items",
              )}
            </ToolbarItem>
            <ToolbarItem>
              {renderOperationButton(
                <DuplicateIcon />,
                "duplicate",
                "Copy selected items",
              )}
            </ToolbarItem>
            <ToolbarItem>
              {renderOperationButton(
                <ShareIcon />,
                "share",
                "Share selected items",
              )}
            </ToolbarItem>
            <ToolbarItem>
              {renderOperationButton(
                <DeleteIcon />,
                "delete",
                "Delete selected items",
              )}
            </ToolbarItem>
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
      userError,
      selectedPaths,
      selectedPathsCount,
      dispatch,
      handleOperations,
      setUserErrors,
    ],
  );

  const modalTypeLabels: Record<
    string,
    { modalTitle: string; inputLabel: string }
  > = {
    group: {
      modalTitle: "Create a new Group",
      inputLabel: "Group Name",
    },
    share: {
      modalTitle: "Share this Folder",
      inputLabel: "User Name",
    },

    default: {
      modalTitle: "Create a new Folder",
      inputLabel: "Folder Name",
    },
  };

  return (
    <>
      <AddModal
        operationType={modalInfo.type}
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ isOpen: false, type: "" })}
        onSubmit={(inputValue, additionalValues) =>
          handleModalSubmitMutation.mutate({
            inputValue,
            additionalValues,
          })
        }
        modalTitle={
          modalTypeLabels[modalInfo.type]?.modalTitle ??
          modalTypeLabels.default.modalTitle
        }
        inputLabel={
          modalTypeLabels[modalInfo.type]?.inputLabel ??
          modalTypeLabels.default.inputLabel
        }
        indicators={{
          isPending: handleModalSubmitMutation.isPending,
          isError: handleModalSubmitMutation.isError,
          error: handleModalSubmitMutation.error as DefaultError,
          clearErrors: () => handleModalSubmitMutation.reset(),
        }}
      />
      <input
        ref={fileInput}
        multiple={true}
        type="file"
        hidden
        onChange={handleFileChange}
      />
      <input
        ref={folderInput}
        multiple={true}
        type="file"
        //@ts-ignore
        webkitdirectory="true"
        hidden
        onChange={handleFolderChange}
      />
      <Toolbar className={customClassName?.toolbar}>
        <ToolbarContent style={{ ...customStyle?.toolbarItem }}>
          {toolbarItems}
          {location.pathname.startsWith("/library/") && (
            <ToolbarItem
              align={{
                default: "alignRight",
              }}
            >
              <LayoutSwitch />
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>
    </>
  );
});

export default Operations;

interface AddModalProps {
  operationType: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inputValue: string, additionalValues?: AdditionalValues) => void;
  modalTitle: string;
  inputLabel: string;
  indicators: {
    isPending: boolean;
    isError: boolean;
    error: DefaultError | null;
    clearErrors: () => void;
  };
}

export const AddModal = (props: AddModalProps) => {
  const {
    isOpen,
    onClose,
    onSubmit,
    modalTitle,
    inputLabel,
    indicators,
    operationType,
  } = props;
  const [inputValue, setInputValue] = useState("");
  const [additionalValues, setAdditionalValues] = useState<AdditionalValues>({
    share: {
      read: false,
      write: true,
    },
  });

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  useEffect(() => {
    async function fetchUsers() {}
    if (modalTitle === "Share this Folder") {
      fetchUsers();
    }
  }, [modalTitle]);

  return (
    <Modal
      isOpen={isOpen}
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
        </FormGroup>
        {operationType === "share" && (
          <FormGroup>
            <Checkbox
              id="read"
              isChecked={additionalValues?.share.read}
              label="Read"
              onChange={(_event, checked) => {
                setAdditionalValues({
                  ...additionalValues,
                  share: {
                    ...additionalValues?.share,
                    read: checked,
                  },
                });
              }}
            />
            <Checkbox
              id="write"
              isChecked={additionalValues?.share.write}
              label="Write"
              onChange={(_event, checked) => {
                setAdditionalValues({
                  ...additionalValues,
                  share: {
                    ...additionalValues?.share,
                    write: checked,
                  },
                });
              }}
            />
          </FormGroup>
        )}

        <ActionGroup>
          <Button
            icon={indicators.isPending && <Spin />}
            onClick={() => onSubmit(inputValue)}
          >
            Confirm
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ActionGroup>
        {indicators.isError && (
          <Alert
            type="error"
            description={indicators.error?.message}
            closable
            onClose={indicators.clearErrors}
          />
        )}
      </Form>
    </Modal>
  );
};
