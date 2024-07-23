import Client, { type Plugin } from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import { Alert } from "antd";
import axios from "axios";
import { isEmpty } from "lodash";
import { useRef, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchPluginMetas, handleInstallPlugin } from "./utils";

// Function to extract plugin name and version from error message
const extractPluginInfo = (
  errorMessage: string,
): { name: string; version: string } | null => {
  // Regular expression to match plugin name and version
  const regex = /Couldn't find any plugin with name (\S+) and version (\S+)./;
  const match = errorMessage.match(regex);

  if (match) {
    const [, name, version] = match;
    return { name, version };
  }

  return null;
};

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
    const pluginMetas = await fetchPluginMetas(storeClient, {
      limit: 1,
      offset: 0,
      name_exact: name,
    });

    if (!pluginMetas || !pluginMetas.length) {
      throw new Error(`Failed to find ${name} in the store...`);
    }

    const pluginMeta = pluginMetas[0];
    const pluginList = await pluginMeta.getPlugins({ limit: 1000 });
    const plugins = pluginList.getItems();

    if (!plugins) {
      throw new Error(
        "Failed to fetch plugins assosciated with this plugin meta...",
      );
    }

    const selectedPlugin = plugins.find(
      (plugin: Plugin) => plugin.data.version === version,
    );
    if (!selectedPlugin) {
      throw new Error(`Failed to find the ${version} of ${name} in the store`);
    }

    // This feature is only available to logged in users
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

  const retryUpload = async (file: File) => {
    const client = ChrisAPIClient.getClient();
    const url = `${import.meta.env.VITE_CHRIS_UI_URL}pipelines/sourcefiles/`;
    const formData = new FormData();
    formData.append("fname", file, file.name);
    const config = {
      headers: { Authorization: `Token ${client.auth.token}` },
    };
    await axios.post(url, formData, config);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files) {
      for (const file of Array.from(files)) {
        let retryUploadFile = true;

        while (retryUploadFile) {
          try {
            // Attempt to upload the file
            await retryUpload(file);
            setNotification({
              type: "success",
              description: "Pipeline uploaded successfully",
            });
            fetchPipelinesAgain();
            retryUploadFile = false; // Exit loop if upload was successful
          } catch (error) {
            if (axios.isAxiosError(error)) {
              const errorDictionary = error.response?.data;

              if (errorDictionary) {
                const plugin_tree_errors = errorDictionary.plugin_tree;
                const extractedInfo = extractPluginInfo(plugin_tree_errors[0]);

                if (extractedInfo) {
                  const { name, version } = extractedInfo;

                  setNotification({
                    type: "error",
                    description: `Pipeline requires plugin:${name} with version:${version}`,
                  });

                  try {
                    // Attempt to install the plugin
                    await installPlugin(name, version);
                  } catch (installError: any) {
                    setNotification({
                      type: "error",
                      description: `${installError.message}. You can install this plugin by connecting to a different store`,
                    });
                    retryUploadFile = false; // Stop retrying if plugin installation fails
                  }
                }
              }
            }
          }
        }
      }
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
