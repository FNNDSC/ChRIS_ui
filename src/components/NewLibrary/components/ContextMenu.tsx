import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import type { DefaultError } from "@tanstack/react-query";
import { matchPath } from "react-router";
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
import type { OriginState } from "../context";
import { useCallback, useEffect, useRef, useState } from "react";
import { AddModal } from "./Operations";
import { useFolderOperations } from "../utils/useOperations";

interface ContextMenuProps {
  children: React.ReactElement;
  computedPath?: string;
  origin: OriginState;
  folderList?: FileBrowserFolderList;
}

export const FolderContextMenu = (props: ContextMenuProps) => {
  const { children, origin, folderList, computedPath } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isFeedsTable =
    matchPath({ path: "/feeds", end: true }, location.pathname) !== null;
  const {
    modalState,
    userRelatedError,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder,
    setUserRelatedError,
    setModalState,
    clearAllSelections,
  } = useFolderOperations(origin, computedPath, folderList, isFeedsTable);

  // Handler for when menu is opened
  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsMenuOpen(open);
      if (!open) {
        // When menu is closed, clear selections
        clearAllSelections();
      }
    },
    [clearAllSelections],
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        isMenuOpen
      ) {
        clearAllSelections();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, clearAllSelections]);

  const items: MenuProps["items"] = [
    { key: "createFeed", label: "Create Feed", icon: <CodeBranchIcon /> },
    { key: "download", label: "Download", icon: <DownloadIcon /> },
    { key: "anonymize", label: "Anonymize", icon: <ArchiveIcon /> },
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
      {/* All the operations are managed through a modal */}
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
      <div ref={menuRef}>
        <Dropdown
          aria-role="menu"
          menu={{ items, onClick: (info) => handleOperations(info.key) }}
          trigger={["contextMenu"]}
          open={isMenuOpen}
          onOpenChange={onOpenChange}
          destroyPopupOnHide
        >
          {children}
        </Dropdown>
      </div>

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
