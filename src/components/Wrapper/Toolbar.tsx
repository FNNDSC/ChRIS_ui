import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  Modal,
  Switch,
  Tooltip,
} from "@patternfly/react-core";
import { BarsIcon } from "@patternfly/react-icons"; // Add a tools icon
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useCookies } from "react-cookie";
import { useMediaQuery } from "react-responsive";
import { useLocation, useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import { clearCartOnLogout } from "../../store/cart/cartSlice";
import {
  useAppDispatch,
  useAppSelector,
  useSignUpAllowed,
} from "../../store/hooks";
import { setLogoutSuccess } from "../../store/user/userSlice";
import { ThemeContext } from "../DarkTheme/useTheme";
import FeedDetails from "../FeedDetails";
import CartNotify from "./CartNotify";

type ToolbarComponentProps = {
  showToolbar: boolean;
  titleComponent?: React.ReactElement;
  token?: string | null;
};

const ToolbarComponent: React.FC<ToolbarComponentProps> = (
  props: ToolbarComponentProps,
) => {
  const isSmallerScreen = useMediaQuery({ maxWidth: 1224 });
  const { signUpAllowed } = useSignUpAllowed();
  const { token, titleComponent } = props;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [_, _setCookie, removeCookie] = useCookies();
  const { isDarkTheme, toggleTheme } = React.useContext(ThemeContext);
  const queryClient = useQueryClient();
  const username = useAppSelector((state) => state.user.username);
  const [dropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [trayOpen, setTrayOpen] = React.useState(false); // State for tray visibility

  const handleChange = () => {
    toggleTheme();
  };

  const onLogout = () => {
    queryClient.clear();
    ChrisAPIClient.resetClient();
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

  const toggleTray = () => {
    setTrayOpen(!trayOpen);
  };

  return (
    <>
      <Flex
        justifyContent={{ default: "justifyContentSpaceBetween" }}
        alignItems={{ default: "alignItemsCenter" }}
        style={{
          width: "100%",
        }}
      >
        <FlexItem>{titleComponent && titleComponent}</FlexItem>
        {/* Center */}
        <FlexItem flex={{ default: "flex_1" }}>
          {props.showToolbar && !isSmallerScreen && <FeedDetails />}
        </FlexItem>

        {/* Right section */}
        <FlexItem align={{ default: "alignRight" }}>
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            spaceItems={{ default: "spaceItemsMd" }}
          >
            {isSmallerScreen && (
              <FlexItem>
                <Tooltip position="bottom" content="Configure Panels">
                  <Button
                    variant="plain"
                    aria-label="Tools"
                    onClick={toggleTray}
                    icon={<BarsIcon />}
                  />
                </Tooltip>
              </FlexItem>
            )}
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
                  {signUpAllowed && (
                    <Button
                      style={{ padding: "0.25em" }}
                      variant="link"
                      onClick={() => navigate("/signup")}
                    >
                      Sign Up
                    </Button>
                  )}
                </>
              )}
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>

      {/* Modal tray for FeedDetails */}
      {isSmallerScreen && trayOpen && (
        <Modal isOpen={trayOpen} onClose={toggleTray} title="" variant="small">
          <FeedDetails />
        </Modal>
      )}
    </>
  );
};

export default ToolbarComponent;
