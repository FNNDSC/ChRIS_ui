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
    const {
      children,
      handleModalClose,
      footer,
      showOverlay,
      step
    } = this.props;

    return (
      <Modal
        isOpen={showOverlay}
        title={step === 0 ? "Add Node" : "Choose the Parameters for your node"}
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
