import React from "react";
import { Dispatch } from "redux";
import { useDispatch , connect } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { Button, Modal, ModalVariant, Alert } from "@patternfly/react-core";

import { PluginInstance } from "@fnndsc/chrisapi";
import { FaTrash } from "react-icons/fa";
import { ApplicationState } from "../../../store/root/applicationState";
import {
  clearDeleteState,
  deleteNode,
  deleteNodeError,
} from "../../../store/pluginInstance/actions";

interface DeleteNodeProps {
  selectedPlugin?: PluginInstance;
  deleteNode: (instance: PluginInstance) => void;
  deleteNodeState: {
    error: string;
    success: boolean;
  };
}

const DeleteNode: React.FC<DeleteNodeProps> = ({
  selectedPlugin,
  deleteNode,
  deleteNodeState,
}: DeleteNodeProps) => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);

    if (isModalOpen) {
      dispatch(clearDeleteState());
    }
  };

  const handleDelete = async () => {
    const statuses = ["finishedSuccessfully", "cancelled", "finishedWithError"];

    if (statuses.includes(selectedPlugin?.data.status)) {
      if (selectedPlugin) deleteNode(selectedPlugin);
    } else {
      dispatch(deleteNodeError("Please wait for the plugin to finish running"));
    }
  };

  return (
    <>
      <ErrorBoundary FallbackComponent={FallBackComponent}>
        <Button
          disabled={!selectedPlugin}
          onClick={handleModalToggle}
          icon={<FaTrash />}
          type="button"
        >
          Delete Node
        </Button>
        <Modal
          variant={ModalVariant.small}
          title="Delete Node Confirmation"
          isOpen={isModalOpen}
          onClose={handleModalToggle}
          actions={[
            <React.Fragment key="modal-action">
              <Button key="confirm" variant="primary" onClick={handleDelete}>
                Confirm
              </Button>
              <Button key="cancel" variant="link" onClick={handleModalToggle}>
                Cancel
              </Button>
            </React.Fragment>,
          ]}
        >
          Deleting a node will delete all it&apos;s descendants as well. Please
          confirm if you are sure
          {deleteNodeState.error && (
            <Alert variant="danger" title={deleteNodeState.error} />
          )}
        </Modal>
      </ErrorBoundary>
    </>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  selectedPlugin: state.instance.selectedPlugin,
  deleteNodeState: state.instance.deleteNode,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  deleteNode: (instance: PluginInstance) => dispatch(deleteNode(instance)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteNode);

const FallBackComponent = () => (
    <span>
      Deleting a plugin instance can have some side effects. Could you please
      try again?
    </span>
  );
