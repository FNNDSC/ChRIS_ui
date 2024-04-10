import { PluginInstance } from "@fnndsc/chrisapi";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "antd";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchResource } from "../../api/common";
import { useTypedSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/actions";
import {
  getPluginInstancesSuccess,
  getSelectedPlugin,
} from "../../store/pluginInstance/actions";
import { getPluginInstanceStatusRequest } from "../../store/resources/actions";
import { SpinContainer } from "../Common";

const DeleteNode = () => {
  const dispatch = useDispatch();
  const { deleteNode: isModalOpen } = useTypedSelector(
    (state) => state.plugin.nodeOperations,
  );
  const { selectedPlugin } = useTypedSelector((state) => state.instance);
  const currentFeed = useTypedSelector((state) => state.feed.currentFeed.data);

  const handleDelete = async () => {
    if (selectedPlugin) {
      try {
        const statuses = [
          "finishedSuccessfully",
          "finishedWithError",
          "cancelled",
        ];
        const status = selectedPlugin.data.status;

        if (!statuses.includes(status)) {
          // Always cancel an active node first to avoid side effects
          await selectedPlugin.put({
            status: "cancelled",
          });
        }

        await selectedPlugin.delete();
        //Fetch Resources again because I don't understand how delete works in cube. It's highly inconsistent
        if (currentFeed) {
          const params = { limit: 15, offset: 0 };

          const fn = currentFeed.getPluginInstances;
          const boundFn = fn.bind(currentFeed);
          const { resource: pluginInstances } =
            await fetchResource<PluginInstance>(params, boundFn);

          const selected = pluginInstances[pluginInstances.length - 1];
          const pluginInstanceObj = {
            selected,
            pluginInstances,
          };

          dispatch(getSelectedPlugin(selected));
          dispatch(getPluginInstancesSuccess(pluginInstanceObj));
          dispatch(getPluginInstanceStatusRequest(pluginInstanceObj));
        }
      } catch (e) {
        throw e;
      }
    } else {
      throw new Error("Please select a node to delete");
    }
  };

  const mutation = useMutation({
    mutationFn: () => handleDelete(),
  });

  const handleModalToggle = () => {
    dispatch(getNodeOperations("deleteNode"));
  };

  useEffect(() => {
    if (mutation.isSuccess) {
      setTimeout(() => {
        mutation.reset();
        dispatch(getNodeOperations("deleteNode"));
      }, 1000);
    }
  }, [mutation.isSuccess]);

  return (
    <Modal
      variant={ModalVariant.small}
      title="Delete Selected Node"
      isOpen={isModalOpen}
      onClose={handleModalToggle}
      actions={[
        <>
          <Button
            key="confirm"
            variant="primary"
            onClick={() => mutation.mutate()}
          >
            Confirm
          </Button>
          <Button key="cancel" variant="primary" onClick={handleModalToggle}>
            Cancel
          </Button>
        </>,
      ]}
    >
      <span>
        {" "}
        Deleting a node will delete all it&apos;s descendants as well. Please
        confirm if you are sure
      </span>

      {mutation.isPending && <SpinContainer title="Deleting..." />}
      {mutation.isError && (
        <Alert type="error" description={mutation.error.message} />
      )}
      {mutation.isSuccess && (
        <Alert type="success" description="Deleted Successfully" />
      )}
    </Modal>
  );
};

export default DeleteNode;
