import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import { useContext, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { MainRouterContext } from "../../../routes";
import {
  setToggleCart,
  startAnonymize,
  startDownload,
  startUpload,
} from "../../../store/cart/cartSlice";
import { useTypedSelector } from "../../../store/hooks";
import { notification } from "../../Antd";
import type { AdditionalValues } from "../components/Operations";
import { type OriginState, useOperationsContext } from "../context";
import useDeletePayload from "../utils/useDeletePayload";
import useFeedOperations from "./useFeedOperations";

export interface ModalState {
  type: string;
  isOpen: boolean;
  additionalProps?: Record<string, any>;
}

export const getCurrentTimestamp = () => {
  return new Date()
    .toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/[^a-zA-Z0-9]/g, "_");
};

export const useFolderOperations = (
  origin: OriginState,
  computedPath?: string,
  folderList?: FileBrowserFolderList,
  createFeed?: boolean,
) => {
  const { handleOrigin, invalidateQueries } = useOperationsContext();
  const router = useContext(MainRouterContext);
  const { selectedPaths } = useTypedSelector((state) => state.cart);
  const username = useTypedSelector((state) => state.user.username);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "folder",
  });
  const [userRelatedError, setUserRelatedError] = useState<string>("");
  const dispatch = useDispatch();
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationAPI, notificationContextHolder] =
    notification.useNotification();

  const deleteMutation = useDeletePayload(origin, notificationAPI);
  const { handleDuplicateMutation, handleMergeMutation } = useFeedOperations(
    origin,
    notificationAPI,
  );

  const resetInputField = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    name?: string,
  ) => {
    handleOrigin(origin);
    const files = Array.from(event.target.files || []);
    const uniqueName = name
      ? `${name}_${getCurrentTimestamp()}`
      : getCurrentTimestamp();
    const uploadPath = createFeed
      ? `home/${username}/uploads/${uniqueName}`
      : computedPath;

    dispatch(
      startUpload({
        files,
        isFolder: false,
        currentPath: uploadPath as string,
        invalidateFunc: invalidateQueries,
        createFeed,
        nameForFeed: name,
      }),
    );
    resetInputField(fileInputRef);
  };

  const handleFolderChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    name?: string,
  ) => {
    handleOrigin(origin);
    const files = Array.from(event.target.files || []);
    const uniqueName = name
      ? `${name}_${getCurrentTimestamp()}`
      : getCurrentTimestamp();
    const uploadPath = createFeed
      ? `home/${username}/uploads/${uniqueName}`
      : computedPath;

    dispatch(
      startUpload({
        files,
        isFolder: true,
        currentPath: uploadPath as string,
        invalidateFunc: invalidateQueries,
        createFeed,
        nameForFeed: name,
      }),
    );
    resetInputField(folderInputRef);
  };

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

  const createFeedWithFile = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    let defaultFeedName = "";
    const files = Array.from(event.target.files || []);
    if (type === "folder") {
      const name = files[0].webkitRelativePath;
      const fileName = name.split("/")[0];
      defaultFeedName = `Feed for ${fileName}`;
    } else {
      defaultFeedName =
        files.length < 2 ? `Feed for ${files[0].name}` : "Multiple File Upload";
    }

    setModalState({
      type: "createFeedWithFile",
      isOpen: true,
      additionalProps: {
        createFeedWithFile: {
          event,
          type,
          defaultFeedName: defaultFeedName,
        },
      },
    });
  };

  const shareFolder = async (
    username: string,
    additionalValues?: AdditionalValues,
  ) => {
    const permissions =
      additionalValues?.share.read && additionalValues?.share.write
        ? "rw"
        : additionalValues?.share.read
          ? "r"
          : "w";

    for (const selectedItem of selectedPaths) {
      const { payload } = selectedItem;
      try {
        await payload.addUserPermission(username, permissions);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.username?.[0] ||
          error?.response?.data?.non_field_errors?.[0] ||
          "Failed to share this folder.";
        throw new Error(errorMessage);
      }
    }
  };

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

      case "createFeedWithFile": {
        const { event, type } =
          modalState.additionalProps?.createFeedWithFile || {};
        if (type === "file") {
          handleFileChange(event, inputValue);
        } else if (type === "folder") {
          handleFolderChange(event, inputValue);
        }
        break;
      }

      default:
        break;
    }

    setModalState({ isOpen: false, type: "" });
  };

  const handleModalSubmitMutation = useMutation({
    mutationFn: async ({
      inputValue,
      additionalValues,
    }: {
      inputValue: string;
      additionalValues?: AdditionalValues;
    }) => handleModalSubmit(inputValue, additionalValues),
  });

  const handleMerge = () => {
    handleMergeMutation.mutate();
  };

  const handleDuplicate = () => {
    handleDuplicateMutation.mutate();
  };

  const handleOperations = (operationKey: string) => {
    switch (operationKey) {
      case "createFeed": {
        const paths = selectedPaths.map((payload) => payload.path);
        router.actions.createFeedWithData(paths);
        break;
      }

      case "download":
        handleOrigin(origin);
        dispatch(setToggleCart());
        dispatch(
          startDownload({ paths: selectedPaths, username: username as string }),
        );
        invalidateQueries();
        break;

      case "anonymize":
        handleOrigin(origin);
        dispatch(setToggleCart());
        dispatch(
          startAnonymize({
            paths: selectedPaths,
            username: username as string,
          }),
        );
        break;

      case "delete":
        deleteMutation.mutate(selectedPaths);
        break;

      case "newFolder":
        setModalState({ isOpen: true, type: "folder" });
        break;

      case "fileUpload":
        fileInputRef.current?.click();
        break;

      case "folderUpload":
        folderInputRef.current?.click();
        break;

      case "createGroup":
        setModalState({ isOpen: true, type: "group" });
        break;

      case "merge":
        handleMerge();
        break;

      case "share":
        setModalState({ isOpen: true, type: "share" });
        break;

      case "duplicate":
        handleDuplicate();
        break;

      default:
        break;
    }
  };

  return {
    modalState,
    userRelatedError,
    folderInputRef,
    fileInputRef,
    handleFileChange,
    createFeedWithFile,
    handleFolderChange,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder: notificationContextHolder,
    setUserRelatedError,
    setModalState,
  };
};
