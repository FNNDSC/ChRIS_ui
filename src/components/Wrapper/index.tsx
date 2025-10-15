import { Page } from "@patternfly/react-core";
import type { FormEvent, KeyboardEvent, ReactElement } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import AnonSidebar from "./AnonSidebar";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./wrapper.css";
import {
  setIsNavOpen,
  setIsPackageTagExpanded,
  setIsTagExpanded,
} from "../../store/ui/uiSlice";
import { OperationsProvider } from "../NewLibrary/context";

type Props = {
  children: ReactElement[] | ReactElement;
  titleComponent?: ReactElement;
};

export default (props: Props) => {
  const { children, titleComponent } = props;
  const dispatch = useAppDispatch();
  const { isNavOpen, sidebarActiveItem, isTagExpanded, isPackageTagExpanded } =
    useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const niivueActive = sidebarActiveItem === "niivue";
  const onNavToggle = () => {
    dispatch(setIsNavOpen(!isNavOpen));
  };
  const onTagToggle = (e: FormEvent) => {
    dispatch(setIsTagExpanded(!isTagExpanded));
  };
  const onPackageTagToggle = (e: FormEvent) => {
    dispatch(setIsPackageTagExpanded(!isPackageTagExpanded));
  };
  const onPageResize = (
    _event: MouseEvent | TouchEvent | KeyboardEvent<Element>,
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
        sidebarActiveItem={sidebarActiveItem}
        isTagExpanded={isTagExpanded}
        onTagToggle={onTagToggle}
        isPackageTagExpanded={isPackageTagExpanded}
        onPackageTagToggle={onPackageTagToggle}
      />
    </OperationsProvider>
  ) : (
    <AnonSidebar isNavOpen={isNavOpen} sidebarActiveItem={sidebarActiveItem} />
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
      {children}
    </Page>
  );
};
