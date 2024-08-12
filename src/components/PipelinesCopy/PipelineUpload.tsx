import Client from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import { Alert } from "../Antd";
import axios from "axios";
import { isEmpty } from "lodash";
import { useRef, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  fetchPluginMetasFromStore,
  handleInstallPlugin,
  uploadPipelineSourceFile,
  extractPluginInfo,
} from "./utils";

interface Notification {
  type: "warning" | "success" | "info" | "error" | undefined;
  description: string;
}

const PipelineUpload = ({
  fetchPipelinesAgain,
}: {
  fetchPipelinesAgain: () => void;
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<Notification>({
    type: undefined,
    description: "",
  });

  /**
   * Installs a specified plugin by its name and version.
   * @param {string} name - The name of the plugin to install.
   * @param {string} version - The version of the plugin to install.
   * @throws Will throw an error if the store URL is not set or if the plugin installation fails.
   */
  const installPlugin = async (name: string, version: string) => {
    setNotification({
      type: "info",
      description: `Installing plugin: ${name} version: ${version}`,
    });

    const storeUrl = import.meta.env.VITE_CHRIS_STORE_URL;
    if (!storeUrl) {
      throw new Error("Failed to connect to a remote store");
    }

    const storeClient = new Client(storeUrl);

    // Fetch plugin metadata from the store
    const selectedPlugin = await fetchPluginMetasFromStore(
      storeClient,
      name,
      version,
    );

    // This feature is only available to logged-in users with a valid token
    // If you have a token, install the plugin by making a request to the admin URL
    const client = ChrisAPIClient.getClient();
    const nonAdminCredentials = `Token ${client.auth.token}`;
    try {
      await handleInstallPlugin(nonAdminCredentials, selectedPlugin);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        throw new Error(e.response?.data);
      }
    }
  };

  /**
   * Handles file changes and attempts to upload the selected files.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const client = ChrisAPIClient.getClient();

    if (files) {
      for (const file of Array.from(files)) {
        let retryUploadFile = true;

        while (retryUploadFile) {
          try {
            // First attempt to upload the file
            await uploadPipelineSourceFile(client, file);

            // Pipeline uploaded successfully
            setNotification({
              type: "success",
              description: "Pipeline uploaded successfully",
            });

            // Reset the cache key to show the updated list
            fetchPipelinesAgain();

            retryUploadFile = false; // Exit the loop if the upload was successful
          } catch (error) {
            if (axios.isAxiosError(error)) {
              const errorDictionary = error.response?.data;

              // Handle specific errors returned by the server
              if (!isEmpty(errorDictionary?.name)) {
                // This handles the case where a pipeline with the same name has been registered before
                const message = errorDictionary.name[0];
                setNotification({
                  type: "error",
                  description: `Error: ${message}.`,
                });
                retryUploadFile = false;
              }

              if (!isEmpty(errorDictionary?.plugin_tree)) {
                // This handles the case when the pipeline has plugins with versions missing in the store. CUBE throws missing plugin errors one at a time, so we reattempt the upload and install the missing plugins until the pipeline is uploaded successfully.
                const plugin_tree_errors = errorDictionary.plugin_tree;
                // Extract the missing plugin's name and version from the error message
                const extractedInfo = extractPluginInfo(plugin_tree_errors[0]);
                if (extractedInfo) {
                  const { name, version } = extractedInfo;

                  setNotification({
                    type: "error",
                    description: `Error: Pipeline requires plugin "${name}" with version "${version}". Attempting to install the required plugin.`,
                  });

                  try {
                    // Attempt to install the plugin from the registered store
                    await installPlugin(name, version);
                  } catch (installError: any) {
                    setNotification({
                      type: "error",
                      description: `Failed to install plugin "${name}" version "${version}". ${installError.message}. You may need to connect to a different store to install this plugin.`,
                    });
                    retryUploadFile = false; // Stop retrying if plugin installation fails
                  }
                }
              }
            } else {
              // Handle unexpected errors
              setNotification({
                type: "error",
                description: "An unexpected error occurred",
              });
              retryUploadFile = false;
            }
          }
        }
      }
    }

    // Reset the file input value to allow re-uploading the same file
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <Button
        size="sm"
        variant="secondary"
        style={{
          marginLeft: "0.5rem",
        }}
        onClick={async () => {
          alert("This file picker only accepts yaml, yml or json file formats");
          fileInput.current?.click();
        }}
      >
        Upload a Pipeline
      </Button>

      {!isEmpty(notification.type) && (
        <Alert
          closable
          style={{ marginTop: "1rem" }}
          type={notification.type}
          description={notification.description}
        />
      )}

      <input
        ref={fileInput}
        style={{ display: "none" }}
        multiple
        onChange={handleFileChange}
        type="file"
        accept=".json, .yml, .yaml"
      />
    </div>
  );
};

export default PipelineUpload;
