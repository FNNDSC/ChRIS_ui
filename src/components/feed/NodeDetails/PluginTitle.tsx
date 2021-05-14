import React from "react";
import { useDispatch } from "react-redux";
import { TextInput, Button, Title, Alert } from "@patternfly/react-core";
import { useTypedSelector } from "../../../store/hooks";
import { EditIcon } from "@patternfly/react-icons";
import { setPluginTitle } from "../../../store/pluginInstance/actions";

const PluginTitle = () => {
  const dispatch = useDispatch();
  const [value, setValue] = React.useState("");
  const [showInput, setShowInput] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState();
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );

  const title = selectedPlugin?.data.title || selectedPlugin?.data.plugin_name;

  const handleOnChange = (value: string) => {
    setValue(value);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      //@ts-ignore
      const pluginItem = await selectedPlugin?.put({
        title: value,
      });
      dispatch(setPluginTitle(pluginItem));
      setLoading(false);
      setShowInput(false);
    } catch (error) {
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
          <Button onClick={handleSubmit}>
            {loading ? "Confirming" : "Confirm"}
          </Button>
        </>
      ) : (
        <>
          <Title headingLevel="h3" size="xl">
            <span>{title}</span>
            <span className="node-details__version">
              {selectedPlugin?.data.plugin_version}
            </span>
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
};

export default PluginTitle;

<PluginTitle />;
