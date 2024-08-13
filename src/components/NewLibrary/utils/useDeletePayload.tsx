import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { clearSelectedPaths } from "../../../store/cart/cartSlice";
import type { SelectionPayload } from "../../../store/cart/types";
import { ErrorAlert } from "../../Common";

type DeletionErrors = { path: string; message: string }[];

const useDeletePayload = (inValidateFolders: () => void, api: any) => {
  const dispatch = useDispatch();
  const [deletionErrors, setDeletionErrors] = useState<DeletionErrors>([]);
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
            const error_message = e.response ? e.response.data : e.message;
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
        onClose: () => {
          if (mutation.isSuccess) return true;
        },
      });
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        api.error({
          message: "Error",
          description: data.map((error) => (
            <ErrorAlert
              key={error.path}
              errors={error.message}
              cleanUpErrors={() => {
                const resetErrors = deletionErrors.filter(
                  (error_state) => error_state.path !== error.path,
                );
                setDeletionErrors(resetErrors);
              }}
            />
          )),
          closable: true,
        });
      } else {
        if (notificationKey) {
          api.destroy(notificationKey);
        }

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
      setDeletionErrors([]);
      api.destroy(notificationKey);
      mutation.reset();
    },
  });

  return mutation;
};

export default useDeletePayload;
