import * as React from "react";
import { connect } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch } from "redux";
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
} from "@patternfly/react-core";

import ChrisAPIClient from "../../api/chrisapiclient";
import { Link } from "react-router-dom";
import { ThemeContext } from "../DarkTheme/useTheme";
import { useCookies } from "react-cookie";

interface IPropsFromDispatch {
  onDropdownSelect: typeof onDropdownSelect;
  setLogoutSuccess: typeof setLogoutSuccess;
  token?: string | null;
}
type AllProps = IUserState & IUiState & IPropsFromDispatch;

const ToolbarComponent: React.FC<AllProps> = (props: AllProps) => {
  const [_, _setCookie, removeCookie] = useCookies();
  const { isDarkTheme, toggleTheme } = React.useContext(ThemeContext);
  const queryClient = useQueryClient();
  const { setLogoutSuccess, token }: IPropsFromDispatch = props;
  const { username, isDropdownOpen }: AllProps = props;
  const onDropdownToggle = () => {
    const { onDropdownSelect } = props;
    onDropdownSelect(!props.isDropdownOpen);
  };

  const handleChange = (_event: React.FormEvent<HTMLInputElement>) => {
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

  const userDropdownItems = [
    <DropdownItem key="dd5" component="a" onClick={onLogout}>
      Sign out
    </DropdownItem>,
  ];
  return (
    <Toolbar>
      <ToolbarGroup>
        <ToolbarItem>
          <Switch
            id="simple switch"
            label="Dark Theme"
            isChecked={isDarkTheme}
            onChange={handleChange}
            ouiaId="Basic Switch"
          />
        </ToolbarItem>
        <ToolbarItem>
          {token ? (
            <Dropdown
              isPlain
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
          ) : (
            <>
              <Link style={{ marginRight: "1rem" }} to="/login">
                Login
              </Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </ToolbarItem>
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
