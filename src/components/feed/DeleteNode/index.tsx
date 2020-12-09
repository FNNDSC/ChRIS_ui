import React from "react";
import { Dispatch } from "redux";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { PluginInstance } from "@fnndsc/chrisapi";
import { deleteNode } from "../../../store/feed/actions";
import { InfrastructureIcon } from "@patternfly/react-icons";

interface DeleteNodeProps {
  selectedPlugin?: PluginInstance;
  deleteNode: (pluginItem: PluginInstance) => void;
  deleteNodeSuccess: boolean;
}

const DeleteNode: React.FC<DeleteNodeProps> = ({
  selectedPlugin,
  deleteNode,
  deleteNodeSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = async () => {
    if (selectedPlugin) {
      deleteNode(selectedPlugin);
    }
    if (deleteNodeSuccess) {
      setIsModalOpen(!isModalOpen);
    }
  };

  return (
    <React.Fragment>
      <Button
        disabled={!selectedPlugin}
        onClick={handleModalToggle}
        variant="primary"
        style={{
          marginTop: "20px",
        }}
      >
        <InfrastructureIcon style={{ marginRight: "4px" }} />
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
        Deleting a node will delete all it's descendants as well. Please confirm
        if you are sure
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  selectedPlugin: state.feed.selectedPlugin,
  deleteNodeSuccess: state.feed.deleteNodeSuccess,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  deleteNode: (pluginItem: PluginInstance) => dispatch(deleteNode(pluginItem)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteNode);
