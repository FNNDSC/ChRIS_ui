import type {
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
  clearAllPaths,
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

// This hook can be called on folders/files in the Library Table and also feeds on the Feed Table

// The createFeed flag is used to determine where this hook is called from.

// Get operation name for a specific operation type and operation state
const getOperationName = (
  operationType: string,
  additionalProps?: Record<string, any>,
): string => {
  switch (operationType) {
    case "share":
      return additionalProps?.share?.public
        ? "Resource made public"
        : "Resource shared";
    case "rename":
      return "Rename";
    case "createFeed":
      return "Feed created";
    case "folder":
      return "Folder created";
    default:
      return "Operation";
  }
};

export const useFolderOperations = (
  origin: OriginState,
  computedPath?: string,
  folderList?: FileBrowserFolderList,
  createFeed?: boolean,
) => {
  const { handleOrigin, invalidateQueries } = useOperationsContext();

  // perform operations on selected paths
  const { selectedPaths } = useAppSelector((state) => state.cart);
  const username = useAppSelector((state) => state.user.username) as string;
  const dispatch = useAppDispatch();

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "folder",
  });
  const [userRelatedError, setUserRelatedError] = useState<string>("");

  // Refs for <input type="file" /> elements
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification for error handling
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

  // handle file upload
  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isFolder: boolean,
    name?: string,
  ) => {
    const fileList = event.target.files;
    // Mark the origin
    handleOrigin(origin);

    console.info("handleUpload: origin:", origin);

    const files = Array.from(fileList || []);
    const uniqueName = name
      ? `${name}_${getCurrentTimestamp()}`
      : getCurrentTimestamp();

    const uploadPath = createFeed
      ? `home/${username}/uploads/${uniqueName}`
      : computedPath;

    console.info(
      "handleUpload: createFeed:",
      createFeed,
      "uploadPath:",
      uploadPath,
      "name:",
      name,
    );

    /*
    // If createFeed==true => place files in `home/username/uploads/<uniqueName>`
    // Otherwise, use the current `computedPath`.
    */
    // Dispatch startUpload through the store
    dispatch(
      startUpload({
        files,
        isFolder,
        currentPath: uploadPath as string,
        //when this function is called in the store, the page resets
        invalidateFunc: invalidateQueries,
        createFeed,
        nameForFeed: name,
      }),
    );
    // Reset input after uploading
    resetInputField(isFolder ? folderInputRef : fileInputRef);
  };

  // Create a folder under a given path
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

  //  Create Feed from a file/folder upload
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

  // ??
  const createFeedFromMenu = async (inputValue: string) => {
    handleOrigin(origin);
    const pathList = selectedPaths.map((payload) => payload.path);
    await createFeedSaga(pathList, inputValue, invalidateQueries);
  };

  // Share Folder
  const shareFolder = async (
    targetUsername: string,
    additionalValues?: AdditionalValues,
  ) => {
    for (const { payload } of selectedPaths) {
      try {
        if (createFeed) {
          // Make the feed public or set permissions on the feed
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
          if (additionalValues?.share.public) {
            await payload.put({ public: true });
          } else {
            // Otherwise, it's a normal folder -> addUserPermission
            await payload.addUserPermission(targetUsername, "w");
          }
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

  // Rename Folder
  const renameFolder = async (inputValue: string): Promise<void> => {
    handleOrigin(origin);

    for (const { payload, type } of selectedPaths) {
      try {
        if (createFeed) {
          // rename a feed by .put({name: newName})
          await handleFeedCreation(payload as FileBrowserFolder, inputValue);
        } else {
          // rename a file/folder in the library page.
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

  // Handle modal submit
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

  // Display a success notification for completed operations
  const showSuccessNotification = (
    operationType: string,
    additionalProps?: Record<string, any>,
  ) => {
    const operationName = getOperationName(operationType, additionalProps);

    notification.success({
      message: `${operationName} successfully`,
      description: `The ${operationType} operation was completed successfully.`,
      placement: "topRight",
      duration: 2,
    });
  };

  // Use a mutation to get loading, error, and success states
  const handleModalSubmitMutation = useMutation({
    mutationFn: async ({
      inputValue,
      additionalValues,
    }: {
      inputValue: string;
      additionalValues?: AdditionalValues;
    }) => handleModalSubmit(inputValue, additionalValues),
    onSuccess: () => {
      // Show success notification based on the operation that just completed
      showSuccessNotification(modalState.type, modalState.additionalProps);

      // Clear selected paths after success
      dispatch(clearAllPaths());
    },
  });

  // Function to clear all selections
  const clearAllSelections = () => {
    dispatch(clearAllPaths());
  };

  // Handle operations
  const handleOperations = (operationKey: string) => {
    console.info("useOperations.handleOperation: operationKey:", operationKey);
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
      rename: setRenameModalWithDefaultName,
      duplicate: handleDuplicateMutation.mutate,
    };

    operationsMap[operationKey]?.();
  };

  // Get the feed name for a single path
  const getFeedNameForSinglePath = (selectedPayload: SelectionPayload) => {
    const { payload } = selectedPayload;
    const name = payload.data.path || payload.data.fname;
    return getFileName(name);
  };

  // Set up the rename modal with an appropriate default name based on context
  const setRenameModalWithDefaultName = () => {
    if (selectedPaths.length === 0) return;
    // Assume rename is applied on the first selected resource.
    const { payload } = selectedPaths[0];

    if (createFeed) {
      const resourcePath = payload.data.path;
      // For feeds, expect resourcePath like "/home/username/feed_17"
      const parts = resourcePath.split("/");
      const feedSegment = parts[parts.length - 1]; // "feed_17"
      const idPart = feedSegment.split("_")[1]; // "17"
      const feedId = Number.parseInt(idPart, 10);
      (async () => {
        try {
          const feed = await ChrisAPIClient.getClient().getFeed(feedId);
          // Use the feed's title if available; otherwise fallback to the feedSegment.
          const defaultName = feed?.data.name || feedSegment;
          setModalState({
            type: "rename",
            isOpen: true,
            additionalProps: { defaultName },
          });
        } catch (error) {
          // Fallback: use the feed segment if the API call fails.
          setModalState({
            type: "rename",
            isOpen: true,
            additionalProps: { defaultName: feedSegment },
          });
        }
      })();
    } else {
      const resourcePath = payload.data.path || payload.data.fname;
      // For folders, simply use the last part of the path as the default name.
      const parts = resourcePath.split("/");
      const defaultName = parts[parts.length - 1];
      setModalState({
        type: "rename",
        isOpen: true,
        additionalProps: { defaultName },
      });
    }
  };

  // Return everything needed by the parent
  return {
    modalState,
    userRelatedError,
    setUserRelatedError,
    setModalState,
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
    clearAllSelections,
  };
};
