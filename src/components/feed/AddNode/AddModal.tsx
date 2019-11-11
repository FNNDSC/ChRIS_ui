import React from "react";
import { Modal } from "@patternfly/react-core";

interface AddModalProps {
  handleModalClose: () => void;
  showOverlay: boolean;
  footer?: any;
  children?: any;
  step: number;
}

class AddModal extends React.Component<AddModalProps> {
  render() {
    const { children, handleModalClose, footer, showOverlay } = this.props;

    return (
      <Modal
        isLarge
        isOpen={showOverlay}
        title="Add Node"
        ariaDescribedById="custom-header-example"
        onClose={handleModalClose}
        footer={footer}
        isFooterLeftAligned
      >
        <span id="custom-header-example">{children}</span>
      </Modal>
    );
  }
}

export default AddModal;
