import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import type { DefaultError } from "@tanstack/react-query";
import { Alert, Dropdown, type MenuProps } from "antd";
import {
  ArchiveIcon,
  CodeBranchIcon,
  DeleteIcon,
  DownloadIcon,
} from "../../Icons";
import { useFolderOperations } from "../utils/useOperations";
import { AddModal } from "./Operations";

export const FolderContextMenu = ({
  children,
  folderPath,
  folderList,
}: {
  children: React.ReactElement;
  folderPath: string;
  folderList?: FileBrowserFolderList;
}) => {
  const {
    modalInfo,
    userError,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder,
    setUserErrors,
    setModalInfo,
  } = useFolderOperations(folderPath, folderList);

  const items: MenuProps["items"] = [
    { key: "createFeed", label: "Create Feed", icon: <CodeBranchIcon /> },
    { key: "download", label: "Download", icon: <DownloadIcon /> },
    { key: "anonymize", label: "Anonymize", icon: <ArchiveIcon /> },
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
