import React, { useContext } from "react";
import { Radio } from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types } from "./types";


const ChooseConfig: React.FC = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { selectedConfig } = state;
  const { isDataSelected } = state.data;

  return (
    <div className="local-file-upload">
      <h1 className="pf-c-title pf-m-2xl">Feed Type Selection</h1>
      <br />
      <p>
        {isDataSelected
          ? "Creating feed from selected files."
          : "You may create the feed in one of the following ways:"}
      </p>
      <br />
      <Radio
        value="fs_plugin"
        isChecked={selectedConfig === "fs_plugin"}
        isDisabled={isDataSelected}
        onChange={(_: any, event: any) => {
          dispatch({
            type: Types.SelectedConfig,
            payload: {
              selectedConfig: event.currentTarget.value,
            },
          });
        }}
        label="Generate files from running an FS plugin from this ChRIS server"
        name="fs_plugin"
        id="fs_plugin"
        data-testid="fs_plugin"
      />
      <Radio
        value="swift_storage"
        isChecked={selectedConfig === "swift_storage"}
        isDisabled={isDataSelected}
        onChange={(_: any, event: any) => {
          dispatch({
            type: Types.SelectedConfig,
            payload: {
              selectedConfig: event.currentTarget.value,
            },
          });
        }}
        label="Choose existing files already registered to ChRIS"
        name="swift_storage"
        id="swift_storage"
      />
      <Radio
        value="local_select"
        isChecked={selectedConfig === "local_select"}
        isDisabled={isDataSelected}
        onChange={(_: any, event: any) => {
          dispatch({
            type: Types.SelectedConfig,
            payload: {
              selectedConfig: event.currentTarget.value,
            },
          });
        }}
        label="Upload new files from your local computer"
        name="local_select"
        id="local_select"
      />
      <Radio
        value="multiple_select"
        isChecked={selectedConfig === "multiple_select"}
        isDisabled={isDataSelected}
        onChange={(_: any, event: any) => {
          dispatch({
            type: Types.SelectedConfig,
            payload: {
              selectedConfig: event.currentTarget.value,
            },
          });
        }}
        label="Choose existing files AND upload new ones"
        name="multiple_select"
        id="multiple_select"
      />
    </div>
  );
};

export default ChooseConfig;
