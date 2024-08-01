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
import {
  type DefaultError,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { MenuProps } from "antd";
import { Alert, Dropdown, Spin, notification } from "antd";
import { isEmpty, isEqual } from "lodash";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { catchError, getFileName } from "../../../api/common";
import { MainRouterContext } from "../../../routes";
import {
  clearCart,
  removeIndividualSelection,
  startAnonymize,
  startDownload,
  startUpload,
  clearSelectFolder,
} from "../../../store/cart/actions";
import { useTypedSelector } from "../../../store/hooks";
import { AddIcon } from "../../Icons";
import type { SelectionPayload } from "../../../store/cart/types";
import { ErrorAlert } from "../../Common";
import axios from "axios";
import useDeletePayload from "../utils/useDeletePayload";

const AddModal = ({
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

const items: MenuProps["items"] = [
  {
    key: "1",
    label: "New Folder",
  },
  {
    key: "2",
    label: "File Upload",
  },
  {
    key: "3",
    label: "Folder Upload",
  },
  {
    key: "4",
    label: "Create a Group",
  },
];

const Operations = ({
  folderList,
  computedPath,
}: { folderList?: FileBrowserFolderList; computedPath: string }) => {
  const queryClient = useQueryClient();
  const router = useContext(MainRouterContext);
  const { selectedPaths } = useTypedSelector((state) => state.cart);
  const username = useTypedSelector((state) => state.user.username);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, type: "" });
  const [userError, setUserErrors] = useState("");
  const dispatch = useDispatch();
  const folderInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const selectedPathsCount = selectedPaths.length;
  const [api, contextHolder] = notification.useNotification();

  const deleteMutation = useDeletePayload(computedPath, api); // Pass the notification API

  const invalidateFolders = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["library_folders", computedPath],
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const files = Array.from(fileList);
    dispatch(
      startUpload({ files, isFolder: false, currentPath: `${computedPath}` }),
    );
    if (fileInput.current) {
      fileInput.current.value = "";
    }
    await invalidateFolders();
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const files = Array.from(fileList);
    dispatch(startUpload({ files, isFolder: true, currentPath: computedPath }));
    if (folderInput.current) {
      folderInput.current.value = "";
    }
    await invalidateFolders();
  };

  const handleModalSubmit = async (inputValue: string) => {
    if (modalInfo.type === "group") {
      const client = ChrisAPIClient.getClient();
      await client.adminCreateGroup({ name: inputValue });
    } else if (modalInfo.type === "folder") {
      const finalPath = `${computedPath}/${inputValue}`;
      try {
        await folderList?.post({ path: finalPath });
      } catch (error: any) {
        const path = error?.response?.data?.path;
        const message = !isEmpty(path) ? path[0] : "Failed to create a folder.";
        throw new Error(message);
      }
    }
    setModalInfo({ isOpen: false, type: "" });
  };

  const handleModalSubmitMutation = useMutation({
    mutationFn: (inputValue: string) => handleModalSubmit(inputValue),
    onSuccess: async () => {
      await invalidateFolders();
    },
  });

  const isDisabled = computedPath === "/" || computedPath === "home";

  const toolbarItems = (
    <Fragment>
      {contextHolder}
      <ToolbarItem>
        <Dropdown
          menu={{
            items,
            selectable: true,
            onClick: (info) => {
              if (info.key === "1") {
                setModalInfo({ isOpen: true, type: "folder" });
              }

              if (info.key === "3") {
                folderInput.current?.click();
              }
              if (info.key === "2") {
                fileInput.current?.click();
              }

              if (info.key === "4") {
                setModalInfo({ isOpen: true, type: "group" });
              }
            },
          }}
        >
          <Button
            isDisabled={isDisabled}
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
      {selectedPaths.length > 0 && (
        <>
          <ToolbarItem>
            <Button
              size="sm"
              onClick={() => {
                const paths = selectedPaths.map((payload) => payload.path);
                router.actions.createFeedWithData(paths);
              }}
            >
              Create Feed
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              size="sm"
              onClick={() => {
                dispatch(
                  startDownload({
                    paths: selectedPaths,
                    username: username as string,
                  }),
                );
              }}
            >
              Download
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              size="sm"
              onClick={() => {
                dispatch(
                  startAnonymize({
                    paths: selectedPaths,
                    username: username as string,
                  }),
                );
              }}
            >
              Anonymize
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              onClick={() => {
                deleteMutation.mutate(selectedPaths);
              }}
              size="sm"
              variant="danger"
            >
              Delete
            </Button>
          </ToolbarItem>
        </>
      )}

      {selectedPathsCount > 0 && (
        <ToolbarItem
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ChipGroup
            numChips={3}
            isClosable
            onClick={() => {
              dispatch(clearCart());
            }}
            className="chip-group-for-paths"
            expandedText="Show Less"
          >
            {selectedPaths.map((payload) => (
              <Chip
                onClick={() => {
                  dispatch(removeIndividualSelection(payload));
                }}
                key={payload.payload.data.id}
              >
                {getFileName(payload.path)}
              </Chip>
            ))}
          </ChipGroup>
        </ToolbarItem>
      )}
    </Fragment>
  );

  return (
    <>
      <Toolbar style={{ paddingLeft: "0" }} id="action-tray">
        <ToolbarContent style={{ paddingInlineStart: "0" }}>
          {toolbarItems}
        </ToolbarContent>
      </Toolbar>

      <input
        type="file"
        ref={fileInput}
        onChange={handleFileChange}
        multiple
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={folderInput}
        onChange={handleFolderChange}
        //@ts-ignore
        webkitdirectory="true"
        mozdirectory="true"
        msdirectory="true"
        odirectory="true"
        directory="true"
        style={{ display: "none" }}
      />

      <AddModal
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ isOpen: false, type: "" })}
        onSubmit={handleModalSubmit}
        modalTitle={
          modalInfo.type === "folder" ? "Create Folder" : "Create Group"
        }
        inputLabel={modalInfo.type === "folder" ? "Folder Name" : "Group Name"}
        indicators={{
          isPending: handleModalSubmitMutation.isPending,
          isError: handleModalSubmitMutation.isError,
          error: handleModalSubmitMutation.error,
        }}
      />
    </>
  );
};

export default Operations;
