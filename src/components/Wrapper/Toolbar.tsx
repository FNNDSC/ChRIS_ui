import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import { onDropdownSelect } from "../../store/ui/actions";
import { setUserLogout } from "../../store/user/actions";
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

interface IPropsFromDispatch {
  onDropdownSelect: typeof onDropdownSelect;
  setUserLogout: typeof setUserLogout;
  token?: string | null;
}
type AllProps = IUserState & IUiState & IPropsFromDispatch;

const ToolbarComponent: React.FC<AllProps> = (props: AllProps) => {
  const { isDarkTheme, toggleTheme } = React.useContext(ThemeContext);
  const { setUserLogout, token }: IPropsFromDispatch = props;
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
    ChrisAPIClient.setIsTokenAuthorized(false);
    if (username) {
      setUserLogout(username);
    }
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
            <Link to="/login">Login</Link>
          )}
        </ToolbarItem>
      </ToolbarGroup>
    </Toolbar>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onDropdownSelect: (isOpened: boolean) => dispatch(onDropdownSelect(isOpened)),
  setUserLogout: (username: string) => dispatch(setUserLogout(username)),
});

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  isDropdownOpen: ui.isDropdownOpen,
  username: user.username,
});

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarComponent);
