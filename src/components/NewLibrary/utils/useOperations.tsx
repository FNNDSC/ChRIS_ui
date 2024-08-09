import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
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
} from "../../../store/cart/actions";
import { useTypedSelector } from "../../../store/hooks";
import useDeletePayload from "../utils/useDeletePayload";
import useFeedOperations from "./useFeedOperations";

export const useFolderOperations = (
  inValidateFolders: () => void,
  computedPath?: string, // This path is passed to for file upload and folder uploads in the library
  folderList?: FileBrowserFolderList,
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
    inValidateFolders();
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
    inValidateFolders();
  };

  const handleModalSubmit = async (inputValue: string) => {
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
    }
    setModalInfo({ isOpen: false, type: "" });
  };

  const handleModalSubmitMutation = useMutation({
    mutationFn: (inputValue: string) => handleModalSubmit(inputValue),
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
        inValidateFolders();
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
