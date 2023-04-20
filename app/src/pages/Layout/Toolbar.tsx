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
  DropdownToggle,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";

import ChrisAPIClient from "../../api/chrisapiclient";

interface IPropsFromDispatch {
  onDropdownSelect: typeof onDropdownSelect;
  setUserLogout: typeof setUserLogout;
}
type AllProps = IUserState & IUiState & IPropsFromDispatch;

const ToolbarComponent: React.FC<AllProps> = (props: AllProps) => {
  const { setUserLogout }: IPropsFromDispatch = props;
  const { username, isDropdownOpen }: AllProps = props;
  const onDropdownToggle = (isOpened: boolean) => {
    const { onDropdownSelect } = props;
    onDropdownSelect(isOpened);
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
          <Dropdown
            isPlain
            position="right"
            isOpen={isDropdownOpen}
            toggle={
              <DropdownToggle onToggle={onDropdownToggle}>
                {username}
              </DropdownToggle>
            }
            dropdownItems={userDropdownItems}
          />
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
