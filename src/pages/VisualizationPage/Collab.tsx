import React from "react";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";
import Wrapper from "../../containers/Layout/PageWrapper";

const Collab = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "collab",
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
          src="https://app.chrisproject.org/login?then=/"
          title="Medview"
        ></iframe>
      </div>
    </Wrapper>
  );
};

export default Collab;
