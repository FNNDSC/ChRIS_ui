import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { clearSelectedPaths } from "../../../store/cart/cartSlice";
import type { SelectionPayload } from "../../../store/cart/types";

type DeletionErrors = { path: string; message: string }[];

const useDeletePayload = (inValidateFolders: () => void, api: any) => {
  const dispatch = useDispatch();
  const [notificationKey, setNotificationKey] = useState<string | null>(null);

  const handleDelete = async (paths: SelectionPayload[]) => {
    const errors: DeletionErrors = [];
    const successfulPaths: string[] = [];

    await Promise.all(
      paths.map(async (path) => {
        const { payload, path: pathToClear } = path;
        try {
          const urlForDeletion = payload.url;
          const client = ChrisAPIClient.getClient();
          await axios.delete(urlForDeletion, {
            headers: {
              Authorization: `Token ${client.auth.token}`,
            },
          });

          successfulPaths.push(pathToClear);
        } catch (e) {
          if (axios.isAxiosError(e)) {
            const error_message = e.response?.data.non_field_errors
              ? e.response.data.non_field_errors[0]
              : e.message;

            errors.push({ path: path.path, message: error_message });
          }
        }
      }),
    );

    inValidateFolders();
    successfulPaths.forEach((path) => dispatch(clearSelectedPaths(path)));

    return errors.length > 0 ? errors : null;
  };

  const mutation = useMutation({
    mutationFn: (paths: SelectionPayload[]) => handleDelete(paths),
    onMutate: () => {
      const key = `open${Date.now()}`;
      setNotificationKey(key);
      api.info({
        message: "Deletion in progress...",
        key,
        type: "info",
        duration: 0, // Keep the notification open until manually closed
      });
    },
    onSuccess: (data) => {
      if (notificationKey) {
        api.destroy(notificationKey);
      }
      if (data && data.length > 0) {
        api.error({
          message: "Error",
          description: data.map((error) => (
            <div key={error.message}>{error.message}</div>
          )),
          closable: true,
          onClose: () => {
            mutation.reset();
          },
          duration: 4,
          placement: "topRight",
        });
      } else {
        api.success({
          message: "Deletion Successful",
          description: "Selected files and folders were successfully deleted.",
          duration: 2,
        });
      }
    },
    onError: (error) => {
      if (notificationKey) {
        api.destroy(notificationKey);
      }
      api.error({
        message: "Deletion Failed",
        description: error.message,
        duration: 2,
      });
    },
    onSettled: () => {
      // Remove the in-progress notification
      if (notificationKey) {
        api.destroy(notificationKey);
        setNotificationKey(null); // Clear the notification key
      }
      mutation.reset();
    },
  });

  return mutation;
};

export default useDeletePayload;
