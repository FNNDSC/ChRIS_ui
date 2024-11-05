import type { Feed, FileBrowserFolderFile } from "@fnndsc/chrisapi";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { App } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChrisAPIClient from "../api/chrisapiclient";
import { getFileName } from "../api/common";
import type { AppDispatch } from "./configureStore.ts";
import type { RootState } from "./root/applicationState";

// See https://react-redux.js.org/tutorials/typescript-quick-start#define-typed-hooks
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export const createLinkAndDownload = (url: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.target = "blank";
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadPublicFile = async (file: FileBrowserFolderFile) => {
  const fileName = getFileName(file.data.fname);
  const url = file.collection.items[0].links[0].href;
  if (!url) {
    throw new Error("Failed to construct the URL");
  }
  createLinkAndDownload(url, fileName);
  return file;
};

export const downloadFile = async (file: FileBrowserFolderFile) => {
  const fileName = getFileName(file.data.fname);
  const client = ChrisAPIClient.getClient();
  const response = await client.createDownloadToken();
  const url = file.collection.items[0].links[0].href;
  if (!url) {
    throw new Error("Failed to construct the URL");
  }
  if (!response) {
    throw new Error("Failed to fetch the token...");
  }
  const token = response.data.token;
  const authorizedUrl = `${url}?download_token=${token}`; // Adjust token assignment
  createLinkAndDownload(authorizedUrl, fileName);
  return file;
};

const useDownload = (feed?: Feed) => {
  const handleDownload = async (file: FileBrowserFolderFile) => {
    try {
      if (feed?.data.public) {
        await downloadPublicFile(file);
      } else {
        await downloadFile(file);
      }
      return file;
    } catch (e) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  };

  const handleDownloadMutation = useMutation({
    mutationFn: (file: FileBrowserFolderFile) => handleDownload(file),
  });

  return handleDownloadMutation;
};

export default useDownload;

// src/hooks/useSignUpAllowed.ts

export const useSignUpAllowed = () => {
  // Use the message API from Ant Design
  const { message } = App.useApp();

  const fetchSignUpAllowed = async (): Promise<boolean> => {
    const apiUrl = import.meta.env.VITE_CHRIS_UI_USERS_URL;

    if (!apiUrl) {
      throw new Error("URL for fetching the users is not set correctly");
    }

    // Make an unauthenticated GET request to api/v1/users/
    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    // Get the Allow header from the response
    const allowHeader = response.headers.get("Allow");

    return allowHeader?.includes("POST") || false;
  };

  // Explicitly define the type for options
  const queryOptions: UseQueryOptions<
    boolean,
    Error,
    boolean,
    ["signUpAllowed"]
  > = {
    queryKey: ["signUpAllowed"],
    queryFn: fetchSignUpAllowed,
    retry: false,
  };

  const {
    data: signUpAllowed,
    isLoading,
    isError,
    error,
  } = useQuery<boolean, Error, boolean, ["signUpAllowed"]>(queryOptions);

  // Handle errors using useEffect
  useEffect(() => {
    if (isError && error) {
      message.error(
        error.message ||
          "Failed to check sign-up availability. Please try again later.",
        3, // Duration in seconds
      );
    }
  }, [isError, error, message]);

  return { signUpAllowed, isLoading, isError, error };
};
