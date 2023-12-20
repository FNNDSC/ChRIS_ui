import React from "react";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { Feed, PluginInstance } from "@fnndsc/chrisapi";
import {
  clearDeleteState,
  deleteNode,
  deleteNodeError,
} from "../../store/pluginInstance/actions";
import TrashIcon from "@patternfly/react-icons/dist/esm/icons/trash-icon";

import { useTypedSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/actions";

interface DeleteNodeProps {
  selectedPlugin?: PluginInstance;
  deleteNode: (instance: PluginInstance, feed: Feed) => void;
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
  const feed = useTypedSelector((state) => state.feed.currentFeed);
  const { deleteNode: isModalOpen } = useTypedSelector(
    (state) => state.plugin.nodeOperations
  );
  const { data } = feed;
  const handleModalToggle = React.useCallback(() => {
    dispatch(getNodeOperations("deleteNode"));
    if (isModalOpen) {
      dispatch(clearDeleteState());
    }
  }, [dispatch, isModalOpen]);

  const handleDelete = async () => {
    if (selectedPlugin && data) {
      deleteNode(selectedPlugin, data);
      handleModalToggle();
    } else {
      dispatch(
        deleteNodeError({
          error_message: "Please wait for the plugin to finish running",
        })
      );
    }
  };

  return (
    <React.Fragment>
      <ErrorBoundary fallback={<FallbackComponent />}>
        <Button
          disabled={!selectedPlugin}
          onClick={handleModalToggle}
          icon={<TrashIcon />}
          type="button"
        >
          Delete Node{" "}
          <span style={{ padding: "2px", color: "#F5F5DC" }}>( D )</span>
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
              <Button
                key="cancel"
                variant="primary"
                onClick={handleModalToggle}
              >
                Cancel
              </Button>
            </React.Fragment>,
          ]}
        >
          Deleting a node will delete all it&apos;s descendants as well. Please
          confirm if you are sure
          {deleteNodeState.error && <span>{deleteNodeState.error}</span>}
        </Modal>
      </ErrorBoundary>
    </React.Fragment>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  selectedPlugin: state.instance.selectedPlugin,
  deleteNodeState: state.instance.deleteNode,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  deleteNode: (instance: PluginInstance, feed: Feed) =>
    dispatch(deleteNode(instance, feed)),
});

const DeleteNodeConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteNode);

export default DeleteNodeConnect;

function FallbackComponent() {
  return <div>Oops ! Delete was not successful. Please try again.</div>;
}
