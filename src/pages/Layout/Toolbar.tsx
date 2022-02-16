import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import {
  onDropdownSelect,
} from "../../store/ui/actions";
import { setUserLogout } from "../../store/user/actions";
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { pf4UtilityStyles } from "../../lib/pf4-styleguides";
import ChrisAPIClient from "../../api/chrisapiclient";

interface IPropsFromDispatch {
  onDropdownSelect: typeof onDropdownSelect;
  setUserLogout: typeof setUserLogout;
}
type AllProps = IUserState & IUiState & IPropsFromDispatch;

const ToolbarComponent: React.FC<AllProps> = (props: AllProps) => {
  const { setUserLogout }: IPropsFromDispatch = props 
  const { username, isDropdownOpen }: AllProps = props
  const onDropdownToggle = (isOpened: boolean) => {
    const { onDropdownSelect } = props;
    onDropdownSelect(isOpened);
  };

  /*

  const onDropdownSelect = () => {
    const { onDropdownSelect, isDropdownOpen } = props;
    !!isDropdownOpen && onDropdownSelect(!isDropdownOpen); // NOTES: Toggle menu ****** to be determined, depending on actions (duplicate call for right now - stub)
  };

  */

  // Description: Logout user
  const onLogout = () => {
    ChrisAPIClient.setIsTokenAuthorized(false);
    setUserLogout();
  }

    const userDropdownItems = [
      <DropdownItem key="dd5" component="a" onClick={onLogout}>
        Sign out
      </DropdownItem>,
    ];
    return (
      <Toolbar>
        <ToolbarGroup
          className={`${pf4UtilityStyles.accessibleStyles.screenReader} ${pf4UtilityStyles.accessibleStyles.visibleOnLg}`}
        >
          <ToolbarItem
            className={`${pf4UtilityStyles.accessibleStyles.screenReader} ${pf4UtilityStyles.accessibleStyles.visibleOnMd}`}
          >
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
  }

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onDropdownSelect: (isOpened: boolean) => dispatch(onDropdownSelect(isOpened)),
  setUserLogout: () => dispatch(setUserLogout()),
});

const mapStateToProps = ({ ui, user }: ApplicationState) => ({
  isDropdownOpen: ui.isDropdownOpen,
  username: user.username,
});

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarComponent);
