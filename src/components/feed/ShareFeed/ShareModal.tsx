import React from 'react'
import { Modal, ModalVariant } from '@patternfly/react-core'

interface ShareModalProps {
  handleModalClose: () => void
  showOverlay: boolean
  children?: any
}

const ShareModal: React.FC<ShareModalProps> = ({
  showOverlay,
  handleModalClose,
  children,
}) => (
    <Modal
      variant={ModalVariant.small}
      title="Share with others"
      isOpen={showOverlay}
      onClose={handleModalClose}
      disableFocusTrap
    >
      {children}
    </Modal>
  )

export default ShareModal
