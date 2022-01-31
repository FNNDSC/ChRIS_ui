import React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";

const BrainBrowser = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "brainbrowser",
      })
    );
  }, [dispatch]);
  return (
    <Wrapper>
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
          src="https://brainbrowser.cbrain.mcgill.ca/surface-viewer#ct"
          title="Surface Viewer"
        ></iframe>
      </div>
    </Wrapper>
  );
};

export default BrainBrowser;
