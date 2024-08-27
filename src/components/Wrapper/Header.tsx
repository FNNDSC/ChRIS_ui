import {
  Masthead,
  MastheadContent,
  MastheadToggle,
  PageToggleButton,
} from "@patternfly/react-core";
import { useTypedSelector } from "../../store/hooks";
import type { IUserState } from "../../store/user/userSlice";
import { BarsIcon } from "../Icons";
import ToolbarComponent from "./Toolbar";

interface IHeaderProps {
  user: IUserState;
  onNavToggle: () => void;
}

export default function Header(props: IHeaderProps) {
  const showToolbar = useTypedSelector((state) => state.feed.showToolbar);
  const isNavOpen = useTypedSelector((state) => state.ui.isNavOpen); // Get the sidebar open state

  // Apply margin-left to MastheadContent if sidebar is open
  const mastheadContentStyle = {
    marginLeft: isNavOpen ? "12rem" : "0", // Adjust based on sidebar state
  };

  const pageToolbar = (
    <ToolbarComponent showToolbar={showToolbar} token={props.user.token} />
  );

  return (
    <Masthead display={{ default: "inline" }}>
      <MastheadToggle style={{ width: "3em" }}>
        <PageToggleButton
          variant="plain"
          aria-label="Global navigation"
          isSidebarOpen={true}
          onSidebarToggle={props.onNavToggle}
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
}
