import React from "react";
import { Dispatch } from "redux";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { PluginInstance} from "@fnndsc/chrisapi";
import { deleteNode } from "../../../store/pluginInstance/actions";
import { TrashIcon } from "@patternfly/react-icons";

interface DeleteNodeProps {
  selectedPlugin?: PluginInstance;
  deleteNode: (instance: PluginInstance) => void;
  deleteNodeSuccess:boolean;
}

const DeleteNode: React.FC<DeleteNodeProps> = ({
  selectedPlugin,
  deleteNode,
  deleteNodeSuccess,
}: DeleteNodeProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = async () => {
    if (selectedPlugin) deleteNode(selectedPlugin);

    if (deleteNodeSuccess) {
      setIsModalOpen(!isModalOpen);
    }
  };

  return (
    <React.Fragment>
      <Button
        disabled={!selectedPlugin}
        onClick={handleModalToggle}
        icon={<TrashIcon />}
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
        Deleting a node will delete all it&apos;s descendants as well. Please confirm
        if you are sure
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  selectedPlugin: state.instance.selectedPlugin,
  deleteNodeSuccess: state.instance.deleteNodeSuccess,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  deleteNode: (instance: PluginInstance) => dispatch(deleteNode(instance)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteNode);
