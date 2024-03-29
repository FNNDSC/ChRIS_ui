import * as React from "react";
import { connect } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch } from "redux";
import FeedDetails from "../FeedDetails";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import { onDropdownSelect } from "../../store/ui/actions";
import { setLogoutSuccess } from "../../store/user/actions";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Switch,
  Button,
} from "@patternfly/react-core";
import ChrisAPIClient from "../../api/chrisapiclient";
import { ThemeContext } from "../DarkTheme/useTheme";
import { useCookies } from "react-cookie";
import { useTypedSelector } from "../../store/hooks";

interface IPropsFromDispatch {
  onDropdownSelect: typeof onDropdownSelect;
  setLogoutSuccess: typeof setLogoutSuccess;
  token?: string | null;
}

interface ComponentProps {
  showToolbar: boolean;
}
type AllProps = IUserState & IUiState & IPropsFromDispatch & ComponentProps;

const ToolbarComponent: React.FC<AllProps> = (props: AllProps) => {
  const drawerState = useTypedSelector((state) => state.drawers);

  const fullScreen = drawerState?.preview.open && drawerState.preview.maximized;
  const navigate = useNavigate();
  const location = useLocation();
  const [_, _setCookie, removeCookie] = useCookies();
  const { isDarkTheme, toggleTheme } = React.useContext(ThemeContext);
  const queryClient = useQueryClient();
  const { setLogoutSuccess, token }: IPropsFromDispatch = props;
  const { username, isDropdownOpen }: AllProps = props;
  const onDropdownToggle = () => {
    const { onDropdownSelect } = props;
    onDropdownSelect(!props.isDropdownOpen);
  };

  const handleChange = () => {
    toggleTheme();
  };

  // Description: Logout user
  const onLogout = () => {
    queryClient.clear();
    ChrisAPIClient.setIsTokenAuthorized(false);
    removeCookie("username", {
      path: "/",
    });

    removeCookie(`${username}_token`, {
      path: "/",
    });

    setLogoutSuccess();
  };

  const copyLoginCommand = () => {
    const url = `${window.location.protocol}://${window.location.host}`;
    const command = `chrs login --ui "${url}" --cube "${
      import.meta.env.VITE_CHRIS_UI_URL
    }" --username "${username}" --token "${token}"`;
    navigator.clipboard.writeText(command);
    onDropdownToggle();
  };

  const userDropdownItems = [
    <DropdownItem key="copy-chrs-login" onClick={copyLoginCommand}>
      CLI login
    </DropdownItem>,
    <DropdownItem key="dd5" component="a" onClick={onLogout}>
      Sign out
    </DropdownItem>,
  ];
  return (
    <Toolbar className="toolbar">
      <ToolbarGroup className="feed-details">
        {props.showToolbar && !fullScreen && <FeedDetails />}
      </ToolbarGroup>
      <ToolbarGroup className="authentication">
        <ToolbarItem>
          <Switch
            id="simple switch"
            label="Theme"
            isChecked={isDarkTheme}
            onChange={handleChange}
            ouiaId="Basic Switch"
          />
        </ToolbarItem>

        {token ? (
          <ToolbarItem>
            <Dropdown
              isPlain
              onSelect={() => onDropdownToggle()}
              isOpen={isDropdownOpen}
              toggle={(toggleRef) => {
                return (
                  <MenuToggle ref={toggleRef} onClick={onDropdownToggle}>
                    {username}
                  </MenuToggle>
                );
              }}
            >
              <DropdownList>{userDropdownItems}</DropdownList>
            </Dropdown>
          </ToolbarItem>
        ) : (
          <>
            <ToolbarItem>
              <Button
                style={{ padding: "0" }}
                variant="link"
                onClick={() => {
                  navigate(
                    `/login?redirectTo=${location.pathname}${location.search}`,
                  );
                }}
              >
                Login
              </Button>
            </ToolbarItem>

            <ToolbarItem>
              <Button
                style={{ padding: "0" }}
                variant="link"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </ToolbarItem>
          </>
        )}
      </ToolbarGroup>
    </Toolbar>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onDropdownSelect: (isOpened: boolean) => dispatch(onDropdownSelect(isOpened)),
  setLogoutSuccess: () => dispatch(setLogoutSuccess()),
});

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  isDropdownOpen: ui.isDropdownOpen,
  username: user.username,
});

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarComponent);
