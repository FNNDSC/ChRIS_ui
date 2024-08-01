import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { clearSelectFolder } from "../../../store/cart/actions";
import type { SelectionPayload } from "../../../store/cart/types";
import { ErrorAlert } from "../../Common";

type DeletionErrors = { path: string; message: string }[];

const useDeletePayload = (computedPath: string, api: any) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [deletionErrors, setDeletionErrors] = useState<DeletionErrors>([]);

  const invalidateFolders = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["library_folders", computedPath],
    });
  };

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

    await invalidateFolders();
    successfulPaths.forEach((path) => dispatch(clearSelectFolder(path)));

    return errors.length > 0 ? errors : null;
  };

  const mutation = useMutation({
    mutationFn: (paths: SelectionPayload[]) => handleDelete(paths),
    onMutate: () => {
      api.info({
        message: "Deletion in Progress",
        description:
          "The deletion of selected files and folders is in progress.",
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
        api.success({
          message: "Deletion Successful",
          description: "Selected files and folders were successfully deleted.",
          duration: 2,
        });
      }
    },
    onError: (error) => {
      api.error({
        message: "Deletion Failed",
        description: error.message,
        duration: 2,
      });
    },
    onSettled: () => {
      setDeletionErrors([]);
      mutation.reset();
    },
  });

  return mutation;
};

export default useDeletePayload;
