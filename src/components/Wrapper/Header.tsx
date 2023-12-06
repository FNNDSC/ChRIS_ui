import * as React from "react";
import {
  Masthead,
  MastheadToggle,
  MastheadMain,
  MastheadBrand,
  MastheadContent,
  PageToggleButton,
  Brand,
} from "@patternfly/react-core";

import brandImg from "../../assets/logo_chris_dashboard.png";
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon";
import ToolbarComponent from "./Toolbar";
import { IUserState } from "../../store/user/types";
import { useTypedSelector } from "../../store/hooks";
import FeedDetails from "../FeedDetails";

const brand = (
  <React.Fragment>
    <Brand src={brandImg} alt="ChRIS Logo" />
  </React.Fragment>
);

interface IHeaderProps {
  user: IUserState;
  onNavToggle: () => void;
}

export default function Header(props: IHeaderProps) {
  const showToolbar = useTypedSelector((state) => state.feed.showToolbar);

  const pageToolbar = <ToolbarComponent token={props.user.token} />;

  const iconToolbar = showToolbar && <FeedDetails />;

 

  return (
    <Masthead>
      <MastheadToggle>
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
      <MastheadMain>
        <MastheadBrand href="" target="_blank">
          {brand}
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginLeft: "30em",
          zIndex: "999",
        }}
      >
        {iconToolbar}
        {pageToolbar}
      </MastheadContent>
    </Masthead>
  );
}
