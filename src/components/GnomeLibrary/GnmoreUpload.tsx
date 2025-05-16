import type React from "react";
import { useState, useRef } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from "@patternfly/react-core";
import { FileUploadIcon, FolderIcon, PlusIcon } from "@patternfly/react-icons";
import type { OriginState } from "../NewLibrary/context";
import {
  useFolderOperations,
  type ModalState,
} from "../NewLibrary/utils/useOperations";
import { AddModal } from "../NewLibrary/components/Operations";
import styles from "./gnome.module.css";
import type { FileBrowserFolderList } from "@fnndsc/chrisapi";

interface GnomeSidebarUploadButtonProps {
  computedPath: string;
  origin: OriginState;
  foldersList?: FileBrowserFolderList;
}

const GnomeSidebarUploadButton: React.FC<GnomeSidebarUploadButtonProps> = ({
  origin,
  computedPath,
  foldersList,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get file/folder upload functionality from the operations hook
  const {
    fileInputRef,
    folderInputRef,
    handleFileChange,
    handleFolderChange,
    modalState,
    handleOperations,
    handleModalSubmitMutation,
    contextHolder,
    setModalState,
  } = useFolderOperations(origin, computedPath || "", foldersList, false);

  const handleUploadFile = () => {
    fileInputRef.current?.click();
    setIsOpen(false);
  };

  const handleUploadFolder = () => {
    folderInputRef.current?.click();
    setIsOpen(false);
  };

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {contextHolder}
      <AddModal
        modalState={modalState as ModalState}
        onClose={() => {
          handleModalSubmitMutation.reset();
          setModalState({ isOpen: false, type: "" });
        }}
        onSubmit={(value, extra) =>
          handleModalSubmitMutation.mutate({
            inputValue: value,
            additionalValues: extra,
          })
        }
        indicators={{
          isPending: handleModalSubmitMutation.isPending,
          isError: handleModalSubmitMutation.isError,
          error: handleModalSubmitMutation.error,
          clearErrors: () => handleModalSubmitMutation.reset(),
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        onChange={handleFileChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        hidden
        //@ts-ignore
        webkitdirectory=""
        directory=""
        onChange={handleFolderChange}
      />

      <div className={styles.uploadButtonContainer} ref={menuRef}>
        <Dropdown
          isOpen={isOpen}
          onSelect={() => setIsOpen(false)}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              variant="primary"
              onClick={onToggle}
              isExpanded={isOpen}
              icon={<PlusIcon />}
            >
              New
            </MenuToggle>
          )}
        >
          <DropdownList>
            <DropdownItem
              icon={<FolderIcon />}
              key="new-folder"
              onClick={() => {
                handleOperations("newFolder");
                setIsOpen(false);
              }}
            >
              New Folder
            </DropdownItem>
            <DropdownItem
              icon={<FileUploadIcon />}
              onClick={handleUploadFile}
              key="file-upload"
            >
              File upload
            </DropdownItem>
            <DropdownItem
              icon={<FolderIcon />}
              onClick={handleUploadFolder}
              key="folder-upload"
            >
              Folder upload
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </div>
    </>
  );
};

export default GnomeSidebarUploadButton;
