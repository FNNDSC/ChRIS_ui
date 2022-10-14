import React from "react";
import { useDispatch } from "react-redux";
import Wrapper from "../Layout/PageWrapper";
import { setSidebarActive } from "../../store/ui/actions";

const BrainBrowser = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    document.title = "Brain Browser";
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
         />
      </div>
    </Wrapper>
  );
};

export default BrainBrowser;
