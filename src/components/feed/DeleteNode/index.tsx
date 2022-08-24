import React from 'react'
import { Dispatch } from 'redux'
import { Button, Modal, ModalVariant, Alert } from '@patternfly/react-core'
import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/root/applicationState'
import { PluginInstance } from '@fnndsc/chrisapi'
import { deleteNode } from '../../../store/pluginInstance/actions'
import { FaTrash } from 'react-icons/fa'

interface DeleteNodeProps {
  selectedPlugin?: PluginInstance
  deleteNode: (instance: PluginInstance) => void
  deleteNodeState: {
    error: string
    success: boolean
  }
}

const DeleteNode: React.FC<DeleteNodeProps> = ({
  selectedPlugin,
  deleteNode,
  deleteNodeState,
}: DeleteNodeProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen)
  }

  const handleDelete = async () => {
    if (selectedPlugin) deleteNode(selectedPlugin)

    if (deleteNodeState.success) {
      setIsModalOpen(!isModalOpen)
    }
  }

  return (
    <React.Fragment>
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
    </React.Fragment>
  )
}

const mapStateToProps = (state: ApplicationState) => ({
  selectedPlugin: state.instance.selectedPlugin,
  deleteNodeState: state.instance.deleteNode,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  deleteNode: (instance: PluginInstance) => dispatch(deleteNode(instance)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DeleteNode)
