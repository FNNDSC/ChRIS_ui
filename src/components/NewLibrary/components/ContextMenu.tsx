import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import type { DefaultError } from "@tanstack/react-query";
import { Alert, Dropdown, type MenuProps } from "antd";
import {
  ArchiveIcon,
  CodeBranchIcon,
  DeleteIcon,
  DownloadIcon,
  DuplicateIcon,
  MergeIcon,
} from "../../Icons";
import { useFolderOperations } from "../utils/useOperations";
import { AddModal } from "./Operations";

interface ContextMenuProps {
  children: React.ReactElement;
  computedPath?: string;
  inValidateFolders: () => void;
  folderList?: FileBrowserFolderList;
}

export const FolderContextMenu = (props: ContextMenuProps) => {
  const { children, inValidateFolders, folderList, computedPath } = props;
  const {
    modalInfo,
    userError,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder,
    setUserErrors,
    setModalInfo,
  } = useFolderOperations(inValidateFolders, computedPath, folderList);

  const items: MenuProps["items"] = [
    { key: "createFeed", label: "Create Feed", icon: <CodeBranchIcon /> },
    { key: "download", label: "Download", icon: <DownloadIcon /> },
    { key: "anonymize", label: "Anonymize", icon: <ArchiveIcon /> },
    { key: "merge", label: "Merge", icon: <MergeIcon /> },
    { key: "duplicate", label: "Copy", icon: <DuplicateIcon /> },
    { key: "delete", label: "Delete", icon: <DeleteIcon /> },
  ];

  return (
    <>
      <AddModal
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ isOpen: false, type: "" })}
        onSubmit={(inputValue) => handleModalSubmitMutation.mutate(inputValue)}
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
