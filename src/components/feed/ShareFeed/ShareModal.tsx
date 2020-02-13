import React from "react";
import { Modal } from "@patternfly/react-core";

interface ShareModalProps {
  handleModalClose: () => void;
  showOverlay: boolean;
  children?: any;
}

class ShareModal extends React.Component<ShareModalProps> {
  render() {
    const { children, showOverlay, handleModalClose } = this.props;
    return (
      <Modal
        isSmall
        title="Share with others"
        isOpen={showOverlay}
        onClose={handleModalClose}
      >
        {children}
      </Modal>
    );
  }
}

export default ShareModal;
