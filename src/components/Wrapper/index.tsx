import { Page } from "@patternfly/react-core";
import type * as React from "react";
import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import Header from "./Header";
import Sidebar, { AnonSidebar } from "./Sidebar";
import "./wrapper.css";
import {
  setIsNavOpen,
  setIsTagExpanded,
  setIsPackageTagExpanded,
} from "../../store/ui/uiSlice";
import { OperationsProvider } from "../NewLibrary/context";

type WrapperProps = {
  children: React.ReactElement[] | React.ReactElement;
  titleComponent?: React.ReactElement;
};

const Wrapper = (props: WrapperProps) => {
  const { children, titleComponent } = props;
  const dispatch = useAppDispatch();
  const { isNavOpen, sidebarActiveItem, isTagExpanded, isPackageTagExpanded } =
    useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const niivueActive = sidebarActiveItem === "niivue";
  const onNavToggle = () => {
    dispatch(setIsNavOpen(!isNavOpen));
  };
  const onTagToggle = (e: React.FormEvent) => {
    dispatch(setIsTagExpanded(!isTagExpanded));
  };
  const onPackageTagToggle = (e: React.FormEvent) => {
    dispatch(setIsPackageTagExpanded(!isPackageTagExpanded));
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
    <OperationsProvider>
      <Sidebar
        isNavOpen={isNavOpen}
        isTagExpanded={isTagExpanded}
        onTagToggle={onTagToggle}
        isPackageTagExpanded={isPackageTagExpanded}
        onPackageTagToggle={onPackageTagToggle}
      />
    </OperationsProvider>
  ) : (
    <AnonSidebar
      isNavOpen={isNavOpen}
      isTagExpanded={isTagExpanded}
      onTagToggle={onTagToggle}
      isPackageTagExpanded={isPackageTagExpanded}
      onPackageTagToggle={onPackageTagToggle}
    />
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
