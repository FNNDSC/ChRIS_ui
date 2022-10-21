import React from "react";
import Wrapper from "../Layout/PageWrapper";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";

const SliceDropPage = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    document.title = "Slice Drop";
    dispatch(
      setSidebarActive({
        activeItem: "sliceDrop",
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
          src="https://slicedrop.com/"
          title="Slice Drop"
        ></iframe>
      </div>
    </Wrapper>
  );
};

export default SliceDropPage;
