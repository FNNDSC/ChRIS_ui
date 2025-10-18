import type { KeyboardEvent, ReactElement } from "react";
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
import { Page } from "@patternfly/react-core";
import * as DoUI from "../../reducers/ui";
import * as DoUser from "../../reducers/user";
import { OperationsProvider } from "../NewLibrary/context";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;
type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  children: ReactElement[] | ReactElement;
  titleComponent?: ReactElement;

  useUI: UseThunk<DoUI.State, TDoUI>;
  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { children, titleComponent, useUI, useUser } = props;
  const [classStateUI, doUI] = useUI;
  const ui = getState(classStateUI) || DoUI.defaultState;
  const uiID = getRootID(classStateUI);
  const { isNavOpen, sidebarActiveItem } = ui;

  const [classStateUser, _] = useUser;
  const user = getState(classStateUser) || DoUser.defaultState;
  const { isLoggedIn } = user;
  const niivueActive = sidebarActiveItem === "niivue";

  const onNavToggle = () => {
    doUI.setIsNavOpen(uiID, !isNavOpen);
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

  const sidebar = isLoggedIn ? (
    <OperationsProvider>
      <Sidebar useUI={useUI} useUser={useUser} />
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
          useUser={useUser}
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
