import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import type { DefaultError } from "@tanstack/react-query";
import { Alert, Dropdown, type MenuProps } from "../../Antd";
import {
  ArchiveIcon,
  CodeBranchIcon,
  DeleteIcon,
  DownloadIcon,
  DuplicateIcon,
  EditIcon,
  MergeIcon,
  ShareIcon,
} from "../../Icons";
import { useFolderOperations } from "../utils/useOperations";
import { AddModal, type ContextTypes } from "./Operations";

interface ContextMenuProps {
  children: React.ReactElement;
  computedPath?: string;
  inValidateFolders: () => void;
  folderList?: FileBrowserFolderList;
  context?: ContextTypes;
}

export const FolderContextMenu = (props: ContextMenuProps) => {
  const { children, inValidateFolders, folderList, computedPath, context } =
    props;
  const {
    modalInfo,
    userError,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder,
    setUserErrors,
    setModalInfo,
  } = useFolderOperations(inValidateFolders, computedPath, folderList, context);

  const items: MenuProps["items"] = [
    { key: "createFeed", label: "Create Feed", icon: <CodeBranchIcon /> },
    { key: "download", label: "Download", icon: <DownloadIcon /> },
    { key: "anonymize", label: "Anonymize", icon: <ArchiveIcon /> },
    { key: "merge", label: "Merge", icon: <MergeIcon /> },
    { key: "duplicate", label: "Copy", icon: <DuplicateIcon /> },
    { key: "share", label: "Share", icon: <ShareIcon /> },

    { key: "delete", label: "Delete", icon: <DeleteIcon /> },
  ];

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

  const { modalTitle, inputLabel } =
    modalTypeLabels[modalInfo.type] || modalTypeLabels.default;

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
        modalTitle={modalTitle}
        inputLabel={inputLabel}
        indicators={{
          isPending: handleModalSubmitMutation.isPending,
          isError: handleModalSubmitMutation.isError,
          error: handleModalSubmitMutation.error as DefaultError,
          clearErrors: () => handleModalSubmitMutation.reset(),
        }}
      />

      {contextHolder}
      <Dropdown
        menu={{ items, onClick: (info) => handleOperations(info.key) }}
        trigger={["contextMenu"]}
      >
        {children}
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
    </>
  );
};
