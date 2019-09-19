import React from "react";
import { ModelessOverlay, Modal } from "patternfly-react";

import { CloseIcon } from "@patternfly/react-icons";

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
      <ModelessOverlay show={showOverlay}>
        <Modal.Header>
          <Modal.Title className="modal-font-color">Add A Node</Modal.Title>
          <CloseIcon
            className="modal-close"
            onClick={() => handleModalClose()}
          />
        </Modal.Header>

        <Modal.Body className="modal-font-color">{children}</Modal.Body>

        {step === 0 && <Modal.Footer>{footer}</Modal.Footer>}
      </ModelessOverlay>
    );
  }
}

export default AddModal;
