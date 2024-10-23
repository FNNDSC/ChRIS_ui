import { Page } from "@patternfly/react-core";
import type * as React from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import Header from "./Header";
import Sidebar, { AnonSidebar } from "./Sidebar";
import "./wrapper.css";
import { setIsNavOpen } from "../../store/ui/uiSlice";

type WrapperProps = {
  children: React.ReactElement[] | React.ReactElement;
  titleComponent?: React.ReactElement;
};

const Wrapper = (props: WrapperProps) => {
  const { children, titleComponent } = props;
  const dispatch = useAppDispatch();
  const { isNavOpen, sidebarActiveItem } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const niivueActive = sidebarActiveItem === "niivue";
  const onNavToggle = () => {
    dispatch(setIsNavOpen(!isNavOpen));
  };

  const onPageResize = (
    _event: MouseEvent | TouchEvent | React.KeyboardEvent<Element>,
    data: { mobileView: boolean; windowSize: number },
  ) => {
    if (data.mobileView) {
      dispatch(setIsNavOpen(false));
    }

    // The default setting of the niivue viewer is without a sidebar active. It explicitly set's it to false in it's component.
    if (!data.mobileView && !niivueActive) {
      dispatch(setIsNavOpen(true));
    }
  };

  const isLoggedIn = useAppSelector(({ user }) => user.isLoggedIn);
  const sidebar = isLoggedIn ? (
    <Sidebar isNavOpen={isNavOpen} />
  ) : (
    <AnonSidebar isNavOpen={isNavOpen} />
  );

  return (
    <Page
      onPageResize={onPageResize}
      header={
        <Header
          onNavToggle={onNavToggle}
          user={user}
          titleComponent={titleComponent}
        />
      }
      sidebar={sidebar}
    >
      {" "}
      {children}
    </Page>
  );
};

export default Wrapper;
