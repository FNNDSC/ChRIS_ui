import React from "react";
import { Dispatch } from "redux";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { PluginInstance, Feed } from "@fnndsc/chrisapi";
import { deleteNode } from "../../../store/feed/actions";
import { TrashIcon } from "@patternfly/react-icons";

interface DeleteNodeProps {
  currentFeed?: Feed;
  selectedPlugin?: PluginInstance;
  deleteNode: (feed:  Feed) => void;
  deleteNodeSuccess: boolean;
}

const DeleteNode: React.FC<DeleteNodeProps> = ({
  currentFeed,
  selectedPlugin,
  deleteNode,
  deleteNodeSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = async () => {
    
    if (selectedPlugin && currentFeed) {
      selectedPlugin._delete();
      deleteNode(currentFeed);
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
        icon={<TrashIcon />}
        type='button'
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
        Deleting a node will delete all it's descendants as well. Please confirm
        if you are sure
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  currentFeed: state.feed.currentFeed.data,
  selectedPlugin: state.feed.selectedPlugin,
  deleteNodeSuccess: state.feed.deleteNodeSuccess,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  deleteNode: (feed: Feed) => dispatch(deleteNode(feed)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteNode);
