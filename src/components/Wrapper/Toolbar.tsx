import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  Switch,
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
import TitleComponent from "./TitleComponent";

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

  const onLogout = () => {
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
    <Flex
      justifyContent={{ default: "justifyContentSpaceBetween" }}
      alignItems={{ default: "alignItemsCenter" }}
      style={{
        width: "100%",
      }}
    >
      <FlexItem>
        <TitleComponent />
      </FlexItem>
      {/* Center */}
      <FlexItem flex={{ default: "flex_1" }}>
        {props.showToolbar && !fullScreen && <FeedDetails />}
      </FlexItem>

      {/* Right section */}
      <FlexItem align={{ default: "alignRight" }}>
        <Flex
          alignItems={{ default: "alignItemsCenter" }}
          spaceItems={{ default: "spaceItemsMd" }}
        >
          <FlexItem>
            <CartNotify />
          </FlexItem>
          <FlexItem>
            <Switch
              id="simple-switch"
              label="Theme"
              isChecked={isDarkTheme}
              onChange={handleChange}
              ouiaId="Basic Switch"
            />
          </FlexItem>
          <FlexItem>
            {token ? (
              <Dropdown
                isPlain
                onSelect={onDropdownToggle}
                isOpen={dropdownOpen}
                toggle={(toggleRef) => (
                  <MenuToggle ref={toggleRef} onClick={onDropdownToggle}>
                    {username}
                  </MenuToggle>
                )}
              >
                <DropdownList>{userDropdownItems}</DropdownList>
              </Dropdown>
            ) : (
              <>
                <Button
                  style={{ padding: "0.25em" }}
                  variant="link"
                  onClick={() => {
                    navigate(
                      `/login?redirectTo=${location.pathname}${location.search}`,
                    );
                  }}
                >
                  Login
                </Button>
                <Button
                  style={{ padding: "0.25em" }}
                  variant="link"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </FlexItem>
        </Flex>
      </FlexItem>
    </Flex>
  );
};

export default ToolbarComponent;
