import React from "react";
import { Modal, ModalVariant } from "@patternfly/react-core";
import Wrapper from "../../containers/Layout/PageWrapper";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";

const MedviewPage = () => {
  const dispatch = useDispatch();
  const [modalVariant, setModalVariant] = React.useState(true);

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "medview",
      })
    );
  }, [dispatch]);

  const handleModalClose = () => {
    setModalVariant(false);
  };

  return (
    <Wrapper>
      {
        <Modal
          variant={ModalVariant.small}
          title="Warning"
          isOpen={modalVariant}
          onClose={handleModalClose}
        >
          <p>
            For a directory upload, make sure that <i>only</i> DICOM, NIFTI, or
            mgz files are contained in the directory. Any non-medical format
            files will cause an error
          </p>
        </Modal>
      }
      <div
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <iframe
          style={{
            height: "100%",
            width: "100%",
          }}
          allowFullScreen
          src="https://fnndsc.github.io/medview/"
          title="Medview"
        ></iframe>
      </div>
    </Wrapper>
  );
};
export default MedviewPage;
