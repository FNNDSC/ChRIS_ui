import { Button, Modal, ModalVariant, Spinner } from "@patternfly/react-core";
import { Fragment, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/pluginSlice";
import { deletePluginInstance } from "../../store/pluginInstance/pluginInstanceSlice";
import { Alert } from "../Antd";

const DeleteNode = () => {
  const dispatch = useAppDispatch();
  const isModalOpen = useAppSelector(
    (state) => state.plugin.nodeOperations.deleteNode,
  );
  const { selectedPlugin } = useAppSelector((state) => state.instance);

  // Local state for delete operation
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (selectedPlugin) {
      setLoading(true);
      setError(null);
      try {
        await dispatch(deletePluginInstance(selectedPlugin)).unwrap();
        setSuccess(true);
        // Close the modal after a short delay
        setTimeout(() => {
          handleModalClose();
        }, 1500);
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalClose = () => {
    // Reset local state when modal is closed
    setLoading(false);
    setSuccess(false);
    setError(null);
    dispatch(getNodeOperations("deleteNode"));
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title="Delete Selected Node"
      isOpen={isModalOpen}
      onClose={handleModalClose}
      actions={[
        <Fragment key="button-actions">
          <Button
            key="confirm"
            variant="primary"
            onClick={handleDelete}
            isDisabled={loading || success}
          >
            Confirm
          </Button>
          <Button key="cancel" variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
        </Fragment>,
      ]}
    >
      <span>
        Deleting a node will delete all of its descendants as well. Please
        confirm if you are sure.
      </span>

      {loading && (
        <div
          style={{ marginTop: "1rem", display: "flex", alignItems: "center" }}
        >
          <Spinner size="lg" />
          <span style={{ marginLeft: "0.5rem" }}>Deleting...</span>
        </div>
      )}
      {error && (
        <Alert type="error" description={error} style={{ marginTop: "1rem" }} />
      )}
      {success && (
        <Alert
          type="success"
          description="Deleted Successfully"
          style={{ marginTop: "1rem" }}
        />
      )}
    </Modal>
  );
};

export default DeleteNode;
