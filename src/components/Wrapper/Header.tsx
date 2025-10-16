import {
  Masthead,
  MastheadContent,
  MastheadToggle,
  PageToggleButton,
} from "@patternfly/react-core";
import type React from "react";
import { useAppSelector } from "../../store/hooks";
import type { IUserState } from "../../store/user/userSlice";
import { BarsIcon } from "../Icons";
import ToolbarComponent from "./Toolbar";

type Props = {
  user: IUserState;
  onNavToggle: () => void;
  titleComponent?: React.ReactElement;

  isNavOpen?: boolean;
};

export default (props: Props) => {
  const { user, onNavToggle, titleComponent, isNavOpen } = props;

  const showToolbar = useAppSelector((state) => state.feed.showToolbar);

  // Apply margin-left to MastheadContent if sidebar is open
  const mastheadContentStyle = {
    marginLeft: isNavOpen ? "12rem" : "0", // Adjust based on sidebar state
  };

  const pageToolbar = (
    <ToolbarComponent
      showToolbar={showToolbar}
      token={user.token}
      titleComponent={titleComponent}
    />
  );

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
        {pageToolbar}
      </MastheadContent>
    </Masthead>
  );
};
