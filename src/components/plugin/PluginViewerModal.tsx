import * as React from "react";
import { Modal } from "@patternfly/react-core";
import OutputViewerContainer from "../viewer/OutputViewerContainer";

type AllProps = {
  isModalOpen: boolean;
  handleModalToggle: (open: boolean) => void;
};

class PluginViewerModal extends React.Component<AllProps> {
  render() {
    const { isModalOpen, handleModalToggle } = this.props;
    return (
      <React.Fragment>
        <Modal
          className="dicom-modal"
          title="ChRIS Output Viewer"
          isOpen={isModalOpen}
          onClose={() => handleModalToggle(false)} >
          <OutputViewerContainer />
        </Modal>
      </React.Fragment>
    );
  }
}

export default PluginViewerModal;
