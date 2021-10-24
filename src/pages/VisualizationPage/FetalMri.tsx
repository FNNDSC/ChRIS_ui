import React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";

const FetalMri = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "fetalmri",
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
          src="http://fetalmri.org/"
          title="FetalMri"
        ></iframe>
      </div>
    </Wrapper>
  );
};

export default FetalMri;
