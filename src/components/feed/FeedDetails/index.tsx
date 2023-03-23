import React, { ReactElement, ReactNode } from "react";
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  Button,
} from "@patternfly/react-core";
import { useTypedSelector } from "../../../store/hooks";
import { ButtonWithTooltip, handleToggle } from "../../common/button";
import { useDispatch } from "react-redux";
import { IDrawerState } from "../../../store/drawer/types";
import { iconMap } from "../../../api/models/file-viewer.model";
import "./FeedDetails.scss";
import { FaTerminal } from "react-icons/fa";

import { setDrawerCurrentlyActive } from "../../../store/drawer/actions";

const getButtonStyle = (open: boolean) => {
  return {
    borderRadius: "50%",
    padding: "0.5em",
    textAlign: "center",
    backgroundColor: !open ? "#8a8d90" : "#06c",
  };
};

const iconStyle = {
  color: "white",
  width: "24px",
  height: "24px",
};

const FeedDetails = () => {
  const dispatch = useDispatch();
  const drawerState = useTypedSelector((state) => state.drawers);

  const node = drawerState["node"].currentlyActive === "node" ? true : false;
  const terminal =
    drawerState["node"].currentlyActive === "terminal" ? true : false;

  const NodeIcon = iconMap["node"];
  const buttonStyle = getButtonStyle(false);

  const items = (
    <React.Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <DrawerActionsToolbar
          title="Graph"
          Icon={iconMap["graph"]}
          action="graph"
          dispatch={dispatch}
          drawerState={drawerState}
        />

        <DrawerActionsToolbar
          title="Node"
          Icon={node ? iconMap["node"] : iconMap["terminal"]}
          action="node"
          dispatch={dispatch}
          drawerState={drawerState}
        />

        <DrawerActionsToolbar
          title="Directory"
          Icon={iconMap["directory"]}
          action="directory"
          dispatch={dispatch}
          drawerState={drawerState}
        />

        <DrawerActionsToolbar
          title="Files"
          Icon={iconMap["files"]}
          action="files"
          dispatch={dispatch}
          drawerState={drawerState}
        />

        <DrawerActionsToolbar
          title="Preview"
          Icon={iconMap["preview"]}
          action="preview"
          dispatch={dispatch}
          drawerState={drawerState}
        />

        <Button
          //@ts-ignore
          style={buttonStyle}
          onClick={() => {
            if (terminal) {
              dispatch(setDrawerCurrentlyActive("node", "node"));
            } else dispatch(setDrawerCurrentlyActive("node", "terminal"));
          }}
          variant="primary"
          icon={
            node ? (
              <FaTerminal style={iconStyle} />
            ) : (
              <NodeIcon style={iconStyle} />
            )
          }
        />
      </div>
    </React.Fragment>
  );

  return (
    <ToolbarComponent>
      <ToolbarContent>{items}</ToolbarContent>
    </ToolbarComponent>
  );
};

export default FeedDetails;

export const ToolbarComponent = ({ children }: { children: ReactElement }) => {
  return (
    <Toolbar isFullHeight className="feed-details">
      {children}
    </Toolbar>
  );
};

const ToolbarContainer = ({
  childComponent,
}: {
  childComponent: ReactNode;
}) => {
  const spacer: {
    xl?: "spacerLg";
    lg?: "spacerLg";
    md?: "spacerMd";
    sm?: "spacerSm";
  } = {
    xl: "spacerLg",
    lg: "spacerLg",
    md: "spacerMd",
    sm: "spacerSm",
  };
  return <ToolbarItem spacer={spacer}>{childComponent}</ToolbarItem>;
};

const DrawerActionsToolbar = ({
  action,
  dispatch,
  Icon,
  title,
  drawerState,
}: {
  action: string;
  dispatch: any;
  Icon: any;
  title: string;
  drawerState: IDrawerState;
}) => {
  return (
    <ToolbarContainer
      childComponent={
        <ButtonWithTooltip
          position="bottom"
          style={getButtonStyle(drawerState[action].open)}
          content={<span>{title}</span>}
          icon={<Icon style={iconStyle} />}
          variant="primary"
          onClick={() => {
            handleToggle(action, drawerState, dispatch);
          }}
        />
      }
    />
  );
};
