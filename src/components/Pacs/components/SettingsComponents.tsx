import { useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Popover } from "antd";
import { Checkbox, Button } from "@patternfly/react-core";
import ChrisApiClient from "../../../api/chrisapiclient";
import { useTypedSelector } from "../../../store/hooks";
import SettingsIcon from "@patternfly/react-icons/dist/esm/icons/cog-icon";
import "@patternfly/react-core/dist/styles/base.css";

export const CardHeaderComponent = ({
  resource,
  type,
}: {
  resource: any;
  type: string;
}) => {
  const [settingsModal, setSettingsModal] = useState(false);

  return (
    <div>
      <Popover
        content={
          <SettingsComponent
            resource={resource}
            type={type}
            handleModalClose={() => {
              setSettingsModal(!settingsModal);
            }}
          />
        }
        title="Study Card Configuration"
        trigger="click"
        open={settingsModal}
        onOpenChange={() => {
          setSettingsModal(!settingsModal);
        }}
      >
        <Button
          onClick={() => {
            setSettingsModal(!settingsModal);
          }}
          variant="link"
          icon={<SettingsIcon />}
        ></Button>
      </Popover>
    </div>
  );
};

export const SettingsComponent = ({
  resource,
  type,
  handleModalClose,
}: {
  type: string;
  resource: any;
  handleModalClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const username = useTypedSelector((state) => state.user.username);

  const [recordDict, setRecordDict] = useState<Record<string, boolean>>({});

  const handleChange = (key: string, checked: boolean) => {
    if (!recordDict[key]) {
      setRecordDict({
        ...recordDict,
        [key]: checked,
      });
    } else {
      const newState = { ...recordDict };
      delete newState[key];
      setRecordDict(newState);
    }
  };

  const saveUserData = async () => {
    const url = `${import.meta.env.VITE_CHRIS_UI_URL}uploadedfiles/`;

    const client = ChrisApiClient.getClient();
    await client.setUrls();
    const formData = new FormData();
    const fileName = "settings.json";

    const path = `${username}/uploads/config`;
    const pathList = await client.getFileBrowserPath(path);

    try {
      let existingContent: {
        [key: string]: Record<string, boolean>;
      } = {};
      if (pathList) {
        const files = await pathList.getFiles();
        const fileItems = files.getItems();

        if (fileItems) {
          // Use Promise.all to wait for all async operations to complete
          const fileContentArray = await Promise.all(
            fileItems.map(async (_file) => {
              const blob = await _file.getFileBlob();
              const reader = new FileReader();

              // Use a Promise to wait for the reader.onload to complete
              const readPromise = new Promise((resolve) => {
                reader.onload = function (e) {
                  const contents =
                    ((e.target && e.target.result) as string) || "{}";
                  resolve(JSON.parse(contents));
                };
              });

              reader.readAsText(blob);

              // Delete the file after processing
              await _file._delete();

              // Wait for the reader.onload to complete before moving to the next file
              return await readPromise;
            }),
          );

          existingContent = fileContentArray[0] as {
            [key: string]: Record<string, boolean>;
          };
        }
      }

      const dataTransformed = { [type]: recordDict };

      const data = JSON.stringify({
        ...existingContent,
        ...dataTransformed,
      });

      formData.append("upload_path", `${username}/uploads/config/${fileName}`);

      formData.append(
        "fname",
        new Blob([data], {
          type: "application/json",
        }),
        fileName,
      );

      const config = {
        headers: {
          Authorization: "Token " + client.auth.token,
        },
      };

      await axios.post(url, formData, config);

      queryClient.invalidateQueries({
        queryKey: ["metadata"],
      });

      setRecordDict({});
      handleModalClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      {Object.entries(resource).map(([key]) => {
        return (
          <div key={key} style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              id={key}
              isChecked={recordDict[key] ? true : false}
              onChange={(_event, checked: boolean) => {
                handleChange(key, checked);
              }}
              aria-label={`Study ${key} Checkbox`}
            />
            <div
              style={{
                flex: "1",
                display: "flex",
                alignItems: "center",
                marginLeft: "1rem",
                fontWeight: "bold",
              }}
            >
              {key}
            </div>
          </div>
        );
      })}

      <Button
        onClick={() => saveUserData()}
        variant="secondary"
        style={{
          marginTop: "1rem",
        }}
      >
        Submit
      </Button>

      <Button
        style={{
          marginLeft: "1rem",
        }}
        variant="secondary"
        onClick={async () => {
          setRecordDict({});
          await saveUserData();
        }}
      >
        Reset to Default
      </Button>
    </div>
  );
};
