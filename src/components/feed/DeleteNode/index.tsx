import React from "react";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { Feed, PluginInstance } from "@fnndsc/chrisapi";
import {
  clearDeleteState,
  deleteNode,
  deleteNodeError,
} from "../../../store/pluginInstance/actions";
import { FaTrash } from "react-icons/fa";
import { useTypedSelector } from "../../../store/hooks";
import { getNodeOperations } from "../../../store/plugin/actions";
import { LoadingErrorAlert } from "../../common/errorHandling";

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
      dispatch(deleteNodeError("Please wait for the plugin to finish running"));
    }
  };

  return (
    <React.Fragment>
      <ErrorBoundary FallbackComponent={FallBackComponent}>
        <Button
          disabled={!selectedPlugin}
          onClick={handleModalToggle}
          icon={<FaTrash />}
          type="button"
        >
          Delete Node{" "}
          <span style={{ padding: "2px", color: "#F5F5DC", fontSize: "11px" }}>
            ( D )
          </span>
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
          {deleteNodeState.error && (
            <LoadingErrorAlert error={deleteNodeState.error} />
          )}
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

export default connect(mapStateToProps, mapDispatchToProps)(DeleteNode);

const FallBackComponent = () => {
  return (
    <LoadingErrorAlert
      error={{
        value:
          "Delete a node can have some side effects that haven't been explored yet. Please try again",
      }}
    />
  );
};
