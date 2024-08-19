import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import { isEmpty } from "lodash";
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
import type { AdditionalValues, ContextTypes } from "../components/Operations";
import useDeletePayload from "../utils/useDeletePayload";
import useFeedOperations from "./useFeedOperations";

export const useFolderOperations = (
  inValidateFolders: () => void,
  computedPath?: string, // This path is passed to for file upload and folder uploads in the library
  folderList?: FileBrowserFolderList,
  _context?: ContextTypes,
) => {
  const router = useContext(MainRouterContext);
  const { selectedPaths } = useTypedSelector((state) => state.cart);
  const username = useTypedSelector((state) => state.user.username);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, type: "" });
  const [userError, setUserErrors] = useState("");
  const dispatch = useDispatch();
  const folderInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [api, contextHolder] = notification.useNotification();

  const deleteMutation = useDeletePayload(inValidateFolders, api);
  const { handleDuplicateMutation, handleMergeMutation } = useFeedOperations(
    inValidateFolders,
    api,
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const files = Array.from(fileList);
    dispatch(
      startUpload({ files, isFolder: false, currentPath: `${computedPath}` }),
    );
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files || [];
    const files = Array.from(fileList);
    dispatch(
      startUpload({
        files,
        isFolder: true,
        currentPath: computedPath as string,
      }),
    );
    if (folderInput.current) {
      folderInput.current.value = "";
    }
  };

  const handleModalSubmit = async (
    inputValue: string,
    additionalValues?: AdditionalValues,
  ) => {
    if (modalInfo.type === "group") {
      const client = ChrisAPIClient.getClient();
      await client.adminCreateGroup({ name: inputValue });
      // Todo: Error Handling
    } else if (modalInfo.type === "folder") {
      const finalPath = `${computedPath}/${inputValue}`;
      try {
        await folderList?.post({ path: finalPath });
        inValidateFolders();
      } catch (error: any) {
        const path = error?.response?.data?.path;
        const message = !isEmpty(path) ? path[0] : "Failed to create a folder.";
        throw new Error(message);
      }
    } else if (modalInfo.type === "share") {
      const permissions =
        additionalValues?.share.read && additionalValues?.share.write
          ? "rw"
          : additionalValues?.share.read
            ? "r"
            : "w";
      for (const selectedPayload of selectedPaths) {
        const { payload } = selectedPayload;

        try {
          await payload.addUserPermission(inputValue, permissions);
        } catch (e: any) {
          const username = e?.response?.data?.username;
          const non_field_errors = e?.response?.data?.non_field_errors;
          const message = !isEmpty(username)
            ? username[0]
            : !isEmpty(non_field_errors)
              ? non_field_errors[0]
              : "Failed to share this folder.";
          throw new Error(message);
        }
      }
    }
    setModalInfo({ isOpen: false, type: "" });
  };

  const handleModalSubmitMutation = useMutation({
    mutationFn: ({
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

  const handleOperations = (key: string) => {
    switch (key) {
      case "createFeed": {
        const paths = selectedPaths.map((payload) => payload.path);
        router.actions.createFeedWithData(paths);
        break;
      }

      case "download":
        dispatch(setToggleCart());
        dispatch(
          startDownload({
            paths: selectedPaths,
            username: username as string,
          }),
        );
        // Invalidate the folders after a time limit. This is poorly designed, as this part of the UI assumes
        // that a feed will be created within a certain time frame. Mixing Redux and React Query isn't effective.
        // A better design needs to be considered.
        setTimeout(() => {
          inValidateFolders();
        }, 2000);
        break;
      case "anonymize":
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
        setModalInfo({ isOpen: true, type: "folder" });
        break;
      case "fileUpload":
        fileInput.current?.click();
        break;
      case "folderUpload":
        folderInput.current?.click();
        break;
      case "createGroup":
        setModalInfo({ isOpen: true, type: "group" });
        break;
      case "merge": {
        handleMerge();
        break;
      }
      case "share": {
        setModalInfo({ isOpen: true, type: "share" });
        break;
      }
      case "duplicate": {
        handleDuplicate();
        break;
      }
    }
  };

  return {
    modalInfo,
    userError,
    folderInput,
    fileInput,
    handleFileChange,
    handleFolderChange,
    handleModalSubmitMutation,
    handleOperations,
    contextHolder,
    setUserErrors,
    setModalInfo,
  };
};
