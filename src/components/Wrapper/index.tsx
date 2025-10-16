import { Page } from "@patternfly/react-core";
import type { FormEvent, KeyboardEvent, ReactElement } from "react";
import { useAppSelector } from "../../store/hooks";
import AnonSidebar from "./AnonSidebar";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./wrapper.css";

import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import * as DoUI from "../../reducers/ui";
import { OperationsProvider } from "../NewLibrary/context";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

type Props = {
  children: ReactElement[] | ReactElement;
  titleComponent?: ReactElement;

  useUI: UseThunk<DoUI.State, TDoUI>;
};

export default (props: Props) => {
  const {
    children,
    titleComponent,
    useUI: [stateUI, doUI],
  } = props;
  const ui = getState(stateUI) || DoUI.defaultState;
  const uiID = getRootID(stateUI);

  const { isNavOpen, sidebarActiveItem, isTagExpanded, isPackageTagExpanded } =
    ui;
  const user = useAppSelector((state) => state.user);
  const niivueActive = sidebarActiveItem === "niivue";
  const onNavToggle = () => {
    doUI.setIsNavOpen(uiID, !isNavOpen);
  };
  const onTagToggle = (e: FormEvent) => {
    doUI.setIsTagExpanded(uiID, !isTagExpanded);
  };
  const onPackageTagToggle = (e: FormEvent) => {
    doUI.setIsPackageTagExpanded(uiID, !isPackageTagExpanded);
  };
  const onPageResize = (
    _event: MouseEvent | TouchEvent | KeyboardEvent<Element>,
    data: { mobileView: boolean; windowSize: number },
  ) => {
    if (data.mobileView) {
      doUI.setIsNavOpen(uiID, false);
    }

    // The default setting of the niivue viewer is without a sidebar active. It explicitly set's it to false in it's component.
    if (!data.mobileView && !niivueActive) {
      doUI.setIsNavOpen(uiID, true);
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
          isNavOpen={isNavOpen}
        />
      }
      sidebar={sidebar}
    >
      {children}
    </Page>
  );
};
