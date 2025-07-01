import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import type { DefaultError } from "@tanstack/react-query";
import { matchPath } from "react-router";
import { Alert, Dropdown, type MenuProps } from "../../Antd";
import {
  ArchiveIcon,
  AnalysisIcon,
  DeleteIcon,
  DownloadIcon,
  DuplicateIcon,
  EditIcon,
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
  const isFeedsTable =
    matchPath({ path: "/feeds", end: true }, location.pathname) !== null; // This checks if the path matches and returns true or false
  const {
    modalState,
    userRelatedError,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder,
    setUserRelatedError,
    setModalState,
  } = useFolderOperations(origin, computedPath, folderList, isFeedsTable);

  const items: MenuProps["items"] = [
    { key: "createFeed", label: "Create Feed", icon: <AnalysisIcon /> },
    { key: "download", label: "Download", icon: <DownloadIcon /> },
    { key: "merge", label: "Merge", icon: <MergeIcon /> },
    {
      key: "duplicate",
      label: "Copy",
      icon: <DuplicateIcon />,
      disabled: !isFeedsTable,
    },
    {
      key: "share",
      label: "Share",
      icon: <ShareIcon />,
    },
    {
      key: "rename",
      label: "Rename",
      icon: <EditIcon />,
    },
    { key: "delete", label: "Delete", icon: <DeleteIcon /> },
  ];

  return (
    <>
      <AddModal
        modalState={modalState}
        onClose={() => {
          handleModalSubmitMutation.reset();
          setModalState({ isOpen: false, type: "" });
        }}
        onSubmit={(inputValue, additionalValues) =>
          handleModalSubmitMutation.mutate({
            inputValue,
            additionalValues,
          })
        }
        indicators={{
          isPending: handleModalSubmitMutation.isPending,
          isError: handleModalSubmitMutation.isError,
          error: handleModalSubmitMutation.error as DefaultError,
          clearErrors: () => handleModalSubmitMutation.reset(),
        }}
      />

      {contextHolder}
      <Dropdown
        aria-role="menu"
        menu={{ items, onClick: (info) => handleOperations(info.key) }}
        trigger={["contextMenu"]}
      >
        {children}
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
    </>
  );
};
