import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import type { DefaultError } from "@tanstack/react-query";
import { matchPath } from "react-router";
import { useLocation } from "react-router-dom";
import { Alert, Dropdown, type MenuProps } from "antd";
import {
  CodeBranchIcon,
  DeleteIcon,
  DownloadIcon,
  DuplicateIcon,
  EditIcon,
  MergeIcon,
  ShareIcon,
} from "../Icons";
import type { OriginState } from "../NewLibrary/context";
import { useCallback, useRef, useState } from "react";
import { AddModal } from "../NewLibrary/components/Operations";
import { useFolderOperations } from "../NewLibrary/utils/useOperations";

interface GnomeContextMenuProps {
  children: React.ReactNode;
  origin: OriginState;
  computedPath: string;
  folderList?: FileBrowserFolderList;
}

export const GnomeContextMenu: React.FC<GnomeContextMenuProps> = ({
  children,
  origin,
  computedPath,
  folderList,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Check if we're in the feeds page to adjust behavior
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
  } = useFolderOperations(origin, computedPath, folderList, isFeedsTable);

  // Handler for when menu is opened/closed - Google Drive-like behavior
  // Don't clear selections when menu is closed
  const onOpenChange = useCallback((open: boolean) => {
    setIsMenuOpen(open);
  }, []);

  // Menu items for the context menu - Exact match with Library context menu
  const items: MenuProps["items"] = [
    { key: "createFeed", label: "Create Feed", icon: <CodeBranchIcon /> },
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
