import Client from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import axios from "axios";
import { isEmpty } from "lodash";
import { useRef, useState } from "react";
import { Cookies } from "react-cookie";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppSelector } from "../../store/hooks";
import { Alert } from "../Antd";
import {
  fetchPluginMetasFromStore,
  handleInstallPlugin,
} from "../PipelinesCopy/utils";
import { uploadPipelineSourceFile } from "./utils";
import { extractPluginInfo } from "./utils";

interface Notification {
  type: "warning" | "success" | "info" | "error" | undefined;
  description: string;
}

const PipelineUpload = ({
  fetchPipelinesAgain,
}: {
  fetchPipelinesAgain: () => void;
}) => {
  const isStaff = useAppSelector((state) => state.user.isStaff);
  const cookies = new Cookies();
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
    const selectedPlugin = await fetchPluginMetasFromStore(
      storeClient,
      name,
      version,
    );
    const admin_username = cookies.get("admin_username");
    const admin_password = cookies.get("admin_password");
    const compute_resource = cookies.get("compute_resource") || "host";
    const client = ChrisAPIClient.getClient();
    let authorization: string;
    if (isStaff) {
      authorization = `Token ${client.auth.token}`;
    } else if (admin_username && admin_password) {
      const adminCredentials = btoa(
        `${admin_username.trim()}:${admin_password.trim()}`,
      );
      authorization = `Basic ${adminCredentials}`;
    } else {
      throw new Error(
        "Please log in or provide admin credentials to install the plugin.",
      );
    }
    await handleInstallPlugin(authorization, selectedPlugin, compute_resource);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const client = ChrisAPIClient.getClient();
    if (files) {
      for (const file of Array.from(files)) {
        let retryUploadFile = true;
        while (retryUploadFile) {
          try {
            await uploadPipelineSourceFile(client, file);
            setNotification({
              type: "success",
              description: "Pipeline uploaded successfully",
            });
            fetchPipelinesAgain();
            retryUploadFile = false;
          } catch (error) {
            retryUploadFile = false;
            if (axios.isAxiosError(error)) {
              const errorDictionary = error.response?.data;
              if (!isEmpty(errorDictionary?.name)) {
                const message = errorDictionary.name[0];
                setNotification({
                  type: "error",
                  description: `Error: ${message}.`,
                });
              } else if (!isEmpty(errorDictionary?.plugin_tree)) {
                const plugin_tree_errors = errorDictionary.plugin_tree;
                const extractedInfo = extractPluginInfo(plugin_tree_errors[0]);
                if (extractedInfo) {
                  const { name, version } = extractedInfo;
                  setNotification({
                    type: "error",
                    description: `Error: Pipeline requires plugin "${name}" with version "${version}". Attempting to install the required plugin.`,
                  });
                  try {
                    await installPlugin(name, version);
                    retryUploadFile = true;
                  } catch (installError: any) {
                    setNotification({
                      type: "error",
                      description: `Failed to install plugin "${name}" version "${version}". ${installError.message}. You may need to connect to a different store to install this plugin.`,
                    });
                  }
                } else {
                  setNotification({
                    type: "error",
                    description: `${plugin_tree_errors[0]}`,
                  });
                }
              } else {
                setNotification({
                  type: "error",
                  description: "An unexpected error occurred",
                });
              }
            } else {
              setNotification({
                type: "error",
                description: "An unexpected error occurred",
              });
            }
          }
        }
      }
    }
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <Button
        size="sm"
        variant="secondary"
        style={{ marginLeft: "0.5rem" }}
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
