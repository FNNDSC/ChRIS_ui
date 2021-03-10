import * as React from "react";
import { Modal } from "@patternfly/react-core";
import OutputViewerContainer from "../../viewer/OutputViewerContainer";
import { Gotop } from "../../index";

type AllProps = {
  isModalOpen: boolean;
  handleModalToggle: () => void;
};

function getInitialState() {
  return {
    gotopActive: false,
    scrollDivId: " ",
  };
}

const PluginViewerModal = (props: AllProps) => {
  const [pluginModalState, setPluginModalState] = React.useState(
    getInitialState
  );
  const { gotopActive, scrollDivId } = pluginModalState;
  const { isModalOpen, handleModalToggle } = props;

  const handleScroll = (e: any) => {
    e.target.id.indexOf("pf-modal") >= 0 &&
      setPluginModalState({
        gotopActive: !!e.target.scrollTop && e.target.scrollTop > 0,
        scrollDivId: e.target.id,
      });
  };

  return (
    <React.Fragment>
      <Modal
        className="dicom-modal"
        title="ChRIS Output Viewer"
        isOpen={isModalOpen}
        onScroll={handleScroll}
        onClose={() => handleModalToggle()}
      >
        <OutputViewerContainer />
        <Gotop isActive={gotopActive} scrollable={scrollDivId} />
      </Modal>
    </React.Fragment>
  );
};

export default PluginViewerModal;
