import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import type { DefaultError } from "@tanstack/react-query";
import { Alert, Dropdown, type MenuProps } from "../../Antd";
import {
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
import { AddModal } from "./Operations";

interface ContextMenuProps {
  children: React.ReactElement;
  computedPath?: string;
  origin: OriginState;
  folderList?: FileBrowserFolderList;
}

export const FolderContextMenu = (props: ContextMenuProps) => {
  const { children, origin, folderList, computedPath } = props;
  const {
    modalInfo,
    userError,
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
