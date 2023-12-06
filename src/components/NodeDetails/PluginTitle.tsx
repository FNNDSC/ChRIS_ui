import React from "react";
import { useDispatch } from "react-redux";
import { TextInput, Button, Title, Alert } from "@patternfly/react-core";
import { useTypedSelector } from "../../store/hooks";
import EditIcon from "@patternfly/react-icons/dist/esm/icons/edit-icon";
import { setPluginTitle } from "../../store/pluginInstance/actions";
import type { PluginInstance } from "@fnndsc/chrisapi";

function getDefaultTitle(selectedPlugin?: PluginInstance) {
  return selectedPlugin?.data.title || selectedPlugin?.data.plugin_name;
}

const PluginTitle = () => {
  const dispatch = useDispatch();
  const [showInput, setShowInput] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState();
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const [value, setValue] = React.useState(getDefaultTitle(selectedPlugin));

  React.useEffect(() => {
    const title = getDefaultTitle(selectedPlugin);
    setValue(title);
  }, [selectedPlugin]);

  if (selectedPlugin && selectedPlugin.data) {
    const { title, plugin_version, plugin_name } = selectedPlugin.data;
    const pluginName = `${
      title ? title : `${plugin_name} v.${plugin_version}`
    } `;

    const handleOnChange = (
      _event: React.FormEvent<HTMLInputElement>,
      value: string
    ) => {
      setValue(value);
    };

    const handleSubmit = async () => {
      try {
        setLoading(true);
        //@ts-ignore
        const pluginItem = await selectedPlugin?.put({
          title: value,
        });
        if (pluginItem) {
          dispatch(setPluginTitle(pluginItem));
        }

        setLoading(false);
        setShowInput(false);
      } catch (error) {
        //@ts-ignore
        setError(error);
      }
    };

    return (
      <>
        {showInput ? (
          <>
            <TextInput
              type="text"
              aria-label="Setting Plugin's Title"
              onChange={handleOnChange}
              value={value}
              className="node-details__title--formInput"
            />
            <Button
              onClick={handleSubmit}
              className="node-details__title--formButton"
            >
              {loading ? "Confirming" : "Confirm"}
            </Button>
            <Button
              onClick={() => {
                setShowInput(!showInput);
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Title headingLevel="h3" size="xl">
              <span>{pluginName}</span>
            </Title>
            <EditIcon
              onClick={() => {
                setShowInput(!showInput);
              }}
            />
            {error && <Alert variant="success" isInline title={error} />}
          </>
        )}
      </>
    );
  } else {
    return <span>No Plugin was selected</span>;
  }
};

export default PluginTitle;
