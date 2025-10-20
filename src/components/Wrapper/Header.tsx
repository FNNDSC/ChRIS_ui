import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import {
  Masthead,
  MastheadContent,
  MastheadToggle,
  PageToggleButton,
} from "@patternfly/react-core";
import type React from "react";
import * as DoUser from "../../reducers/user";
import { useAppSelector } from "../../store/hooks";
import { BarsIcon } from "../Icons";
import Toolbar from "./Toolbar";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  onNavToggle: () => void;
  titleComponent?: React.ReactElement;

  isNavOpen?: boolean;

  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { useUser, onNavToggle, titleComponent, isNavOpen } = props;

  const [classStateUser, _] = useUser;

  const user = getState(classStateUser) || DoUser.defaultState;

  const showToolbar = useAppSelector((state) => state.feed.showToolbar);

  // Apply margin-left to MastheadContent if sidebar is open
  const mastheadContentStyle = {
    marginLeft: isNavOpen ? "12rem" : "0", // Adjust based on sidebar state
  };

  return (
    <Masthead display={{ default: "inline" }}>
      <MastheadToggle style={{ width: "3em" }}>
        <PageToggleButton
          variant="plain"
          aria-label="Global navigation"
          isSidebarOpen={true}
          onSidebarToggle={onNavToggle}
          id="multiple-sidebar-body-nav-toggle"
        >
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadContent style={mastheadContentStyle}>
        <Toolbar
          showToolbar={showToolbar}
          token={user.token}
          titleComponent={titleComponent}
          useUser={useUser}
        />
      </MastheadContent>
    </Masthead>
  );
};
