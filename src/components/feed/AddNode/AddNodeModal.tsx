import React from "react";

import {
  ModelessOverlay,
  Modal as PF3Modal,
  Button as PF3Button
} from "patternfly-react";
import { CloseIcon } from "@patternfly/react-icons";

interface AddNodeModalProps {
  open: boolean;
  children?: any;
  footer?: any;
  handleModalClose: () => void;
}

class AddNodeModal extends React.Component<AddNodeModalProps> {
  render() {
    const { open, handleModalClose, children, footer } = this.props;

    return (
      <ModelessOverlay show={open}>
        <PF3Modal.Header>
          <PF3Modal.Title className="modal-font-color">
            Add new node(s)
          </PF3Modal.Title>
          <CloseIcon onClick={handleModalClose} className="modal-close" />
        </PF3Modal.Header>
        <PF3Modal.Body className="modal-font-color">{children}</PF3Modal.Body>
        <PF3Modal.Footer>{footer}</PF3Modal.Footer>
      </ModelessOverlay>
    );
  }
}
export default AddNodeModal;
