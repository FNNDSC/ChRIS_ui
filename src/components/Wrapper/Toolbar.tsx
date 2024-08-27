import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Switch,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";
import { setLogoutSuccess } from "../../store/user/userSlice";
import { ThemeContext } from "../DarkTheme/useTheme";
import FeedDetails from "../FeedDetails";
import CartNotify from "./CartNotify";
import { clearCartOnLogout } from "../../store/cart/cartSlice";

type ToolbarComponentProps = {
  showToolbar: boolean;
  token?: string | null;
};

const ToolbarComponent: React.FC<ToolbarComponentProps> = (
  props: ToolbarComponentProps,
) => {
  const { token } = props;
  const dispatch = useDispatch();
  const drawerState = useTypedSelector((state) => state.drawers);
  const fullScreen = drawerState?.preview.open && drawerState.preview.maximized;
  const navigate = useNavigate();
  const location = useLocation();
  const [_, _setCookie, removeCookie] = useCookies();
  const { isDarkTheme, toggleTheme } = React.useContext(ThemeContext);
  const queryClient = useQueryClient();
  const username = useTypedSelector((state) => state.user.username);
  const [dropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleChange = () => {
    toggleTheme();
  };
  // Description: Logout user
  const onLogout = () => {
    // Some additional cleanup of active resources before logging out
    queryClient.clear();
    ChrisAPIClient.setIsTokenAuthorized(false);
    removeCookie("username", {
      path: "/",
    });
    removeCookie(`${username}_token`, {
      path: "/",
    });
    removeCookie("isStaff", {
      path: "/",
    });
    dispatch(clearCartOnLogout());
    dispatch(setLogoutSuccess());
  };

  const onDropdownToggle = () => {
    setIsDropdownOpen(!dropdownOpen);
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
        {/* The Feeds View Page shows additional contents in the navigation bar */}
        {props.showToolbar && !fullScreen && <FeedDetails />}
      </ToolbarGroup>
      <ToolbarGroup className="authentication">
        <ToolbarItem>
          <CartNotify />
        </ToolbarItem>
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
              isOpen={dropdownOpen}
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

export default ToolbarComponent;
