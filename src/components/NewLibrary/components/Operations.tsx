import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import {
  ActionGroup,
  Button,
  Chip,
  ChipGroup,
  Form,
  FormGroup,
  Modal,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import type { DefaultError } from "@tanstack/react-query";
import { Alert, Dropdown, Spin } from "antd";
import React, { Fragment, useImperativeHandle, useState } from "react";
import { useDispatch } from "react-redux";
import { getFileName } from "../../../api/common";
import { removeIndividualSelection } from "../../../store/cart/actions";
import { useTypedSelector } from "../../../store/hooks";

import {
  AddIcon,
  ArchiveIcon,
  CodeBranchIcon,
  DeleteIcon,
  DownloadIcon,
} from "../../Icons";
import { useFolderOperations } from "../utils/useOperations";

export const AddModal = ({
  isOpen,
  onClose,
  onSubmit,
  modalTitle,
  inputLabel,
  indicators,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inputValue: string) => void;
  modalTitle: string;
  inputLabel: string;
  indicators: {
    isPending: boolean;
    isError: boolean;
    error: DefaultError | null;
  };
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

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
          <Alert type="error" description={indicators.error?.message} />
        )}
      </Form>
    </Modal>
  );
};

const items = [
  { key: "newFolder", label: "New Folder" },
  { key: "fileUpload", label: "File Upload" },
  { key: "folderUpload", label: "Folder Upload" },
  { key: "createGroup", label: "Create a Group" },
];

const Operations = React.forwardRef(
  (
    {
      folderList,
      computedPath,
    }: { folderList?: FileBrowserFolderList; computedPath: string },
    ref,
  ) => {
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
    } = useFolderOperations(computedPath, folderList);

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

    const toolbarItems = (
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
              <Button
                icon={<CodeBranchIcon />}
                size="sm"
                onClick={() => handleOperations("createFeed")}
              >
                Create Feed
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                icon={<DownloadIcon />}
                size="sm"
                onClick={() => handleOperations("download")}
              >
                Download
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                icon={<ArchiveIcon />}
                size="sm"
                onClick={() => handleOperations("anonymize")}
              >
                Anonymize
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                icon={<DeleteIcon />}
                variant="danger"
                size="sm"
                onClick={() => handleOperations("delete")}
              >
                Delete
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <ChipGroup>
                {selectedPaths.map((selection) => (
                  <Chip
                    key={selection.path}
                    onClick={() =>
                      dispatch(removeIndividualSelection(selection))
                    }
                  >
                    {getFileName(selection.path)}
                  </Chip>
                ))}
              </ChipGroup>
            </ToolbarItem>
          </>
        )}
      </Fragment>
    );

    return (
      <>
        <AddModal
          isOpen={modalInfo.isOpen}
          onClose={() => setModalInfo({ isOpen: false, type: "" })}
          onSubmit={(inputValue) =>
            handleModalSubmitMutation.mutate(inputValue)
          }
          modalTitle={
            modalInfo.type === "group"
              ? "Create a new Group"
              : "Create a new Folder"
          }
          inputLabel={modalInfo.type === "group" ? "Group Name" : "Folder Name"}
          indicators={{
            isPending: handleModalSubmitMutation.isPending,
            isError: handleModalSubmitMutation.isError,
            error: handleModalSubmitMutation.error as DefaultError,
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
        <Toolbar>
          <ToolbarContent>{toolbarItems}</ToolbarContent>
        </Toolbar>
      </>
    );
  },
);

export default Operations;
