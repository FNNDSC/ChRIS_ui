import React from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";
const MedviewPage = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "medview",
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
          src="https://fnndsc.github.io/medview/"
          title="Medview"
        ></iframe>
      </div>
    </Wrapper>
  );
};
export default MedviewPage;
