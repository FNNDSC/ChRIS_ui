import * as React from "react";
import { Modal } from "@patternfly/react-core";
import OutputViewerContainer from "../viewer/OutputViewerContainer";
import { Gotop } from "../index";

type AllProps = {
  isModalOpen: boolean;
  handleModalToggle: (open: boolean) => void;
};

type ModalState = {
  gotopActive: boolean;
  scrollDivId: string;
};

class PluginViewerModal extends React.Component<AllProps, ModalState> {
  state = {
    gotopActive: false,
    scrollDivId: "",
  };
  handleScroll = (e: any) => {
    e.target.id.indexOf("pf-modal") >= 0 &&
      this.setState({
        gotopActive: !!e.target.scrollTop && e.target.scrollTop > 0,
        scrollDivId: e.target.id,
      });
  };
  render() {
    const { isModalOpen, handleModalToggle } = this.props;
    return (
      <React.Fragment>
        <Modal
          className="dicom-modal"
          title="ChRIS Output Viewer"
          isOpen={isModalOpen}
          onScroll={this.handleScroll}
          onClose={() => handleModalToggle(false)}
        >
          <OutputViewerContainer />
          <Gotop
            isActive={this.state.gotopActive}
            scrollable={this.state.scrollDivId}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

export default PluginViewerModal;
