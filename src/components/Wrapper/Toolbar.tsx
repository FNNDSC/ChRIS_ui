import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
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
import { type Role, Roles, StaffRoles } from "../../reducers/types";
import * as DoUser from "../../reducers/user";
import { clearCartOnLogout } from "../../store/cart/cartSlice";
import { useAppDispatch, useSignUpAllowed } from "../../store/hooks";
import { ThemeContext } from "../DarkTheme/useTheme";
import FeedDetails from "../FeedDetails";
import CartNotify from "./CartNotify";
import styles from "./Toolbar.module.css";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  showToolbar: boolean;
  titleComponent?: React.ReactElement;
  token?: string | null;

  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const isSmallerScreen = useMediaQuery({ maxWidth: 1224 });
  const { signUpAllowed } = useSignUpAllowed();
  const {
    token,
    titleComponent,
    useUser: [classStateUser, doUser],
  } = props;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [_, _setCookie, removeCookie] = useCookies();
  const { isDarkTheme, toggleTheme } = React.useContext(ThemeContext);
  const queryClient = useQueryClient();
  const user = getState(classStateUser) || DoUser.defaultState;
  const userID = getRootID(classStateUser);
  const { username, role, isStaff } = user;
  const [dropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [roleDropdownOpen, setIsRoleDropdownOpen] = React.useState(false);
  const [trayOpen, setTrayOpen] = React.useState(false); // State for tray visibility
  const roles = isStaff ? StaffRoles : Roles;

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
    doUser.setUserLogout(userID);
  };

  const onDropdownToggle = () => {
    setIsDropdownOpen(!dropdownOpen);
  };

  const onRoleDropdownToggle = () => {
    setIsRoleDropdownOpen(!roleDropdownOpen);
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

  const renderRoleDropdownItem = (role: Role, idx: number) => {
    return (
      <DropdownItem
        key={`role-${idx}`}
        onClick={() => doUser.setRole(userID, role)}
      >
        {role}
      </DropdownItem>
    );
  };

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
              <span className={styles["role-prompt"]}>I am: </span>
              <Dropdown
                onSelect={onRoleDropdownToggle}
                isOpen={roleDropdownOpen}
                toggle={(toggleRef) => (
                  <MenuToggle ref={toggleRef} onClick={onRoleDropdownToggle}>
                    {role}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {roles.map((each, idx) => renderRoleDropdownItem(each, idx))}
                </DropdownList>
              </Dropdown>
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
