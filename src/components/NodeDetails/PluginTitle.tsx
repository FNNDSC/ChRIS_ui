import {
  Button,
  Modal,
  ModalVariant,
  TextInput,
  Title,
} from "@patternfly/react-core";
import { EditIcon } from "../Icons";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "../Antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setPluginTitle } from "../../store/pluginInstance/pluginInstanceSlice";
import { SpinContainer } from "../Common";

const PluginTitle = () => {
  const dispatch = useAppDispatch();
  const { selectedPlugin } = useAppSelector((state) => state.instance);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    try {
      const pluginItem = await selectedPlugin?.put({
        title: value,
      });

      if (!pluginItem) throw new Error("Failed to set title...");
      dispatch(setPluginTitle(pluginItem));
    } catch (e) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
    }
  };

  const mutation = useMutation({
    mutationFn: () => handleSubmit(),
  });

  useEffect(() => {
    if (mutation.isSuccess) {
      setTimeout(() => {
        mutation.reset();
        setIsOpen(!isOpen);
      }, 500);
    }
  }, [mutation.isSuccess]);

  useEffect(() => {
    const pluginName =
      selectedPlugin?.data.title.length > 0
        ? selectedPlugin?.data.title
        : `${selectedPlugin?.data.plugin_name} v.${selectedPlugin?.data.plugin_version}`;
    setValue(pluginName);
  }, [selectedPlugin]);

  return (
    <>
      <div style={{ display: "flex" }}>
        <Title headingLevel="h3" size="md">
          <span>{value}</span>
        </Title>
        <EditIcon
          style={{
            marginLeft: "0.75rem",
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      <Modal
        title="Edit the Selected Node's Name"
        isOpen={isOpen}
        variant={ModalVariant.small}
        onClose={() => setIsOpen(!isOpen)}
        actions={[
          <>
            <Button
              key="confirm"
              onClick={() => {
                //mutate
                mutation.mutate();
              }}
              variant="primary"
            >
              Confirm
            </Button>
            <Button
              key="cancel"
              onClick={() => setIsOpen(!isOpen)}
              variant="link"
            >
              Cancel
            </Button>
          </>,
        ]}
      >
        <TextInput
          type="text"
          aria-label="Setting Plugin's Title"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              mutation.mutate();
            }
          }}
          onChange={(_e, value) => setValue(value)}
          value={value}
          className="node-details__title--formInput"
        />

        <div
          style={{
            marginTop: "1rem",
          }}
        >
          {mutation.isPending && <SpinContainer title="Editing the title..." />}
          {mutation.isError && (
            <Alert type="error" description={mutation.error.message} />
          )}
          {mutation.isSuccess && (
            <Alert type="success" description="Title changed successfully" />
          )}
        </div>
      </Modal>
    </>
  );
};

export default PluginTitle;
