import {
  Button,
  Modal,
  ModalVariant,
  TextInput,
  Title,
} from "@patternfly/react-core";
import EditIcon from "@patternfly/react-icons/dist/esm/icons/edit-icon";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "../../store/hooks";
import { setPluginTitle } from "../../store/pluginInstance/actions";
import { SpinContainer } from "../Common";

const PluginTitle = () => {
  const dispatch = useDispatch();
  const { selectedPlugin } = useTypedSelector((state) => state.instance);
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
      <Title headingLevel="h3" size="xl">
        <span>{value}</span>
      </Title>
      <EditIcon
        style={{ cursor: "pointer", marginLeft: "0.25em" }}
        onClick={() => setIsOpen(!isOpen)}
      />

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
