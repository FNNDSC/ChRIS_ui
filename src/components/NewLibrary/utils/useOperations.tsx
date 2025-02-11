import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  FileBrowserFolderList,
} from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { getFileName } from "../../../api/common";
import {
  clearSelectedPaths,
  setToggleCart,
  startAnonymize,
  startDownload,
  startUpload,
} from "../../../store/cart/cartSlice";
import { createFeed as createFeedSaga } from "../../../store/cart/downloadSaga";
import type { SelectionPayload } from "../../../store/cart/types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { notification } from "../../Antd";
import { getFolderName } from "../components/FolderCard";
import type { AdditionalValues } from "../components/Operations";
import { type OriginState, useOperationsContext } from "../context";
import useDeletePayload from "../utils/useDeletePayload";
import { fetchFeedForPath } from "./longpress";
import useFeedOperations from "./useFeedOperations";
import { isEmpty } from "lodash";

export interface ModalState {
  type: string;
  isOpen: boolean;
  additionalProps?: Record<string, any>;
}

// Utility to generate a unique timestamp-based string
export const getCurrentTimestamp = () =>
  new Date()
    .toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/[^a-zA-Z0-9]/g, "_");

export const useFolderOperations = (
  origin: OriginState,
  computedPath?: string,
  folderList?: FileBrowserFolderList,
  createFeed?: boolean,
) => {
  const { handleOrigin, invalidateQueries } = useOperationsContext();
  const { selectedPaths } = useAppSelector((state) => state.cart);
  const username = useAppSelector((state) => state.user.username) as string;
  const dispatch = useAppDispatch();

  // Local states
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "folder",
  });
  const [userRelatedError, setUserRelatedError] = useState<string>("");

  // Refs for <input type="file" /> elements
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification
  const [notificationAPI, notificationContextHolder] =
    notification.useNotification();

  // Delete + merge/duplicate hooks
  const deleteMutation = useDeletePayload(origin, notificationAPI);
  const { handleDuplicateMutation, handleMergeMutation } = useFeedOperations(
    origin,
    notificationAPI,
  );

  // For resetting file inputs after each upload
  const resetInputField = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // -------------- Upload --------------
  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isFolder: boolean,
    name?: string,
  ) => {
    const fileList = event.target.files;
    // Mark the origin
    handleOrigin(origin);

    const files = Array.from(fileList || []);
    const uniqueName = name
      ? `${name}_${getCurrentTimestamp()}`
      : getCurrentTimestamp();

    // If createFeed==true => place files in `home/username/uploads/<uniqueName>`
    // Otherwise, use the current `computedPath`.
    const uploadPath = createFeed
      ? `home/${username}/uploads/${uniqueName}`
      : computedPath;

    // Dispatch startUpload
    dispatch(
      startUpload({
        files,
        isFolder,
        currentPath: uploadPath as string,
        invalidateFunc: invalidateQueries,
        createFeed,
        nameForFeed: name,
      }),
    );

    // Reset input after uploading
    resetInputField(isFolder ? folderInputRef : fileInputRef);
  };

  // -------------- Create a subfolder --------------
  const createFolder = async (folderName: string) => {
    handleOrigin(origin);
    const finalPath = `${computedPath}/${folderName}`;

    try {
      await folderList?.post({ path: finalPath });
      invalidateQueries();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.path?.[0] || "Failed to create a folder.";
      throw new Error(errorMessage);
    }
  };

  // -------------- Create feed from file input --------------
  const createFeedWithFile = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const files = Array.from(event.target.files || []);
    const defaultFeedName =
      type === "folder"
        ? `Feed for ${files[0].webkitRelativePath.split("/")[0]}`
        : files.length < 2
          ? `Feed for ${files[0].name}`
          : "Multiple File Upload";

    setModalState({
      type: "createFeedWithFile",
      isOpen: true,
      additionalProps: {
        createFeedWithFile: { event, type, defaultFeedName },
      },
    });
  };

  // -------------- Create feed from menu --------------
  const createFeedFromMenu = async (inputValue: string) => {
    handleOrigin(origin);
    const pathList = selectedPaths.map((payload) => payload.path);
    await createFeedSaga(pathList, inputValue, invalidateQueries);
  };

  // -------------- Share Folder / Feed --------------
  // UPDATED: If createFeed===true => if feed found and additionalValues?.share.public===true,
  // just do feed.put({ type: "public" }). Skip user permission logic.
  const shareFolder = async (
    targetUsername: string,
    additionalValues?: AdditionalValues,
  ) => {
    const permissions = additionalValues?.share.write ? "w" : "r";

    for (const { payload } of selectedPaths) {
      try {
        if (createFeed) {
          // If we're dealing with a feed, fetch it:
          const feed = await fetchFeedForPath(payload.data.path);
          if (feed) {
            if (additionalValues?.share.public) {
              await feed.put({ public: true });
            } else {
              await feed.addUserPermission(targetUsername);
            }
          }
        } else {
          // Otherwise, it's a normal folder -> addUserPermission
          await payload.addUserPermission(targetUsername, permissions);
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.username?.[0] ||
          error?.response?.data?.non_field_errors?.[0] ||
          "Failed to share this folder.";
        throw new Error(errorMessage);
      }
    }
  };

  // -------------- Rename folder --------------
  const renameFolder = async (inputValue: string): Promise<void> => {
    handleOrigin(origin);

    for (const { payload, type } of selectedPaths) {
      try {
        if (createFeed) {
          // rename a feed by .put({name: newName})
          await handleFeedCreation(payload as FileBrowserFolder, inputValue);
        } else {
          // rename a path in CUBE
          await handlePathRename(payload, type, inputValue);
        }
      } catch (error) {
        handleRenameError(error);
      }
    }

    invalidateQueries();
  };

  // Renaming a feed
  const handleFeedCreation = async (
    payload: FileBrowserFolder,
    inputValue: string,
  ): Promise<void> => {
    const fileName = getFolderName(payload, payload.data.path);
    const feed = await fetchFeedForPath(fileName);
    if (feed) {
      await feed.put({ name: inputValue });
    }
  };

  // Renaming a path in CUBE
  const handlePathRename = async (
    payload:
      | FileBrowserFolder
      | FileBrowserFolderFile
      | FileBrowserFolderLinkFile,
    type: string,
    inputValue: string,
  ): Promise<void> => {
    const newPath = `${computedPath}/${inputValue}`;
    const oldPath = type === "folder" ? payload.data.path : payload.data.fname;

    switch (type) {
      case "folder":
        await (payload as FileBrowserFolder).put({
          //@ts-ignore
          path: newPath,
        });
        break;
      case "file":
        await (payload as FileBrowserFolderFile).put({
          new_file_path: newPath,
        });
        break;
      case "link":
        await (payload as FileBrowserFolderLinkFile).put({
          new_link_file_path: newPath,
        });
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
    dispatch(clearSelectedPaths(oldPath));
  };

  const handleRenameError = (error: any): void => {
    if (error.response?.data) {
      const { path, new_link_file_path, new_file_path } = error.response.data;
      if (path) throw new Error(path[0]);
      if (new_link_file_path) throw new Error(new_link_file_path[0]);
      if (new_file_path) throw new Error(new_file_path[0]);
    }
    throw new Error("Failed to rename this folder");
  };

  // -------------- Submit Modal --------------
  const handleModalSubmit = async (
    inputValue: string,
    additionalValues?: AdditionalValues,
  ) => {
    switch (modalState.type) {
      case "group": {
        const client = ChrisAPIClient.getClient();
        await client.adminCreateGroup({ name: inputValue });
        break;
      }
      case "folder":
        await createFolder(inputValue);
        break;
      case "share":
        await shareFolder(inputValue, additionalValues);
        break;
      case "rename": {
        await renameFolder(inputValue);
        break;
      }
      case "createFeedWithFile": {
        const { event, type } =
          modalState.additionalProps?.createFeedWithFile || {};
        await handleUpload(event, type === "folder", inputValue);
        break;
      }
      case "createFeed": {
        await createFeedFromMenu(inputValue);
        break;
      }
      default:
        break;
    }

    setModalState({ isOpen: false, type: "" });
  };

  // -------------- React Query Mutation --------------
  const handleModalSubmitMutation = useMutation({
    mutationFn: async ({
      inputValue,
      additionalValues,
    }: {
      inputValue: string;
      additionalValues?: AdditionalValues;
    }) => handleModalSubmit(inputValue, additionalValues),
  });

  // -------------- Utility --------------
  const getFeedNameForSinglePath = (selectedPayload: SelectionPayload) => {
    const { payload } = selectedPayload;
    const name = payload.data.path || payload.data.fname;
    return getFileName(name);
  };

  // -------------- Main "operations" map --------------
  const handleOperations = (operationKey: string) => {
    const operationsMap: Record<string, () => void> = {
      createFeed: () => {
        const defaultFeedName =
          selectedPaths.length > 1
            ? "Feed created from your Library"
            : `Feed created for ${getFeedNameForSinglePath(selectedPaths[0])}`;
        setModalState({
          type: "createFeed",
          isOpen: true,
          additionalProps: {
            createFeed: {
              defaultFeedName,
            },
          },
        });
      },
      download: () => {
        handleOrigin(origin);
        dispatch(setToggleCart());
        dispatch(startDownload({ paths: selectedPaths, username: username }));
        invalidateQueries();
      },
      anonymize: () => {
        handleOrigin(origin);
        dispatch(setToggleCart());
        dispatch(startAnonymize({ paths: selectedPaths, username }));
      },
      delete: () => deleteMutation.mutate(selectedPaths),
      newFolder: () => setModalState({ isOpen: true, type: "folder" }),
      fileUpload: () => fileInputRef.current?.click(),
      folderUpload: () => folderInputRef.current?.click(),
      createGroup: () => setModalState({ isOpen: true, type: "group" }),
      merge: handleMergeMutation.mutate,
      share: () => setModalState({ isOpen: true, type: "share" }),
      rename: () => setModalState({ isOpen: true, type: "rename" }),
      duplicate: handleDuplicateMutation.mutate,
    };

    operationsMap[operationKey]?.();
  };

  // Return everything needed by the parent
  return {
    modalState,
    userRelatedError,
    folderInputRef,
    fileInputRef,
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, name?: string) =>
      handleUpload(e, false, name),
    createFeedWithFile,
    handleFolderChange: (
      e: React.ChangeEvent<HTMLInputElement>,
      name?: string,
    ) => handleUpload(e, true, name),
    handleModalSubmitMutation,
    handleOperations,
    contextHolder: notificationContextHolder,
    setUserRelatedError,
    setModalState,
  };
};
