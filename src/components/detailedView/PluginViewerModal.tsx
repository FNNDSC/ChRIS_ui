import * as React from "react";
import { Modal, Skeleton } from "@patternfly/react-core";
import Gotop from "../common/gotop/Gotop";


const OutputViewerContainer = React.lazy(
  () => import("./DetailedViewerContainer")
);

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
        <React.Suspense
          fallback={
            <div style={{ height: "100vh" }}>
              <Skeleton height="100%" screenreaderText="Fetching Resources" />
            </div>
          }
        >
          <OutputViewerContainer />
        </React.Suspense>

        <Gotop isActive={gotopActive} scrollable={scrollDivId} />
      </Modal>
    </React.Fragment>
  );
};

export default PluginViewerModal;
