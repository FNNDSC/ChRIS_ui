import React, { useContext } from "react";
import { Radio } from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types } from "./types";

const ChooseConfig: React.FC = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { selectedConfig } = state;

  return (
    <div className="local-file-upload">
      <h1 className="pf-c-title pf-m-2xl">Data Configuration</h1>
      <br />
      <p className="data-configuration__subtitle">
        You may create the feed in one of two ways:
      </p>
      <br />
      <Radio
        value="fs_plugin"
        isChecked={selectedConfig === "fs_plugin"}
        onChange={(_, event) => {
          dispatch({
            type: Types.SelectedConfig,
            payload: {
              selectedConfig: event.currentTarget.value,
            },
          });
        }}
        label="Select a FS plugin from this ChRIS server"
        name="fs_plugin"
        id="fs_plugin"
        data-testid="fs_plugin"
      />{" "}
      <Radio
        value="file_select"
        isChecked={selectedConfig === "file_select"}
        onChange={(_, event) => {
          dispatch({
            type: Types.SelectedConfig,
            payload: {
              selectedConfig: event.currentTarget.value,
            },
          });
        }}
        label="Select files from your ChRIS storage and/or upload files from your local computer"
        name="file_select"
        id="file_select"
      />
    </div>
  );
};

export default ChooseConfig;
