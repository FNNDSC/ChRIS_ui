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
import { type ReactElement, useContext, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router";
import type * as DoDrawer from "../../reducers/drawer";
import { type Role, Roles, StaffRoles } from "../../reducers/types";
import * as DoUser from "../../reducers/user";
import { useSignUpAllowed } from "../../store/hooks";
import { ThemeContext } from "../DarkTheme/useTheme";
import FeedDetails from "../FeedDetails";
import CartNotify from "./CartNotify";
import styles from "./Toolbar.module.css";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;
type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

type Props = {
  showToolbar: boolean;
  title?: ReactElement;
  token?: string | null;

  useUser: UseThunk<DoUser.State, TDoUser>;
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
};

export default (props: Props) => {
  const isSmallerScreen = useMediaQuery({ maxWidth: 1224 });
  const { signUpAllowed } = useSignUpAllowed();
  const {
    token,
    title,
    useUser: [classStateUser, doUser],
    useDrawer,
  } = props;

  const navigate = useNavigate();
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);
  const user = getState(classStateUser) || DoUser.defaultState;
  const userID = getRootID(classStateUser);
  const { username, role, isStaff } = user;
  const [dropdownOpen, setIsDropdownOpen] = useState(false);
  const [roleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false); // State for tray visibility
  const roles = isStaff ? StaffRoles : Roles;

  const onChange = () => {
    toggleTheme();
  };

  const onLogout = () => {
    doUser.logout(userID);
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
        <FlexItem>{title}</FlexItem>
        {/* Center */}
        <FlexItem flex={{ default: "flex_1" }}>
          {props.showToolbar && !isSmallerScreen && (
            <FeedDetails useDrawer={useDrawer} />
          )}
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
                onChange={onChange}
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
                        `/login?redirectTo=${window.location.pathname}${window.location.search}`,
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
      <Modal
        isOpen={isSmallerScreen && trayOpen}
        onClose={toggleTray}
        aria-label="Data"
        variant="small"
      >
        <FeedDetails useDrawer={useDrawer} />
      </Modal>
    </>
  );
};
