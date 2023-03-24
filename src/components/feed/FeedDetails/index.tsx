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
  const note = drawerState["node"].currentlyActive === "note" ? true : false;
  const terminal =
    drawerState["node"].currentlyActive === "terminal" ? true : false;

  const preview =
    drawerState["preview"].currentlyActive === "preview" ? true : false;

  const NodeIcon = iconMap["node"];
  const PreviewIcon = iconMap["preview"];
  const BrainIcon = iconMap["brain"];
  const NoteIcon = iconMap["note"];
  const TerminalIcon = iconMap["terminal"];
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
          button={
            <ButtonContainer
              title="Graph"
              Icon={iconMap["graph"]}
              action="graph"
              dispatch={dispatch}
              drawerState={drawerState}
            />
          }
        />

        <DrawerActionsToolbar
          button={
            <ButtonContainer
              title="Node"
              Icon={
                node
                  ? iconMap["node"]
                  : note
                  ? iconMap["note"]
                  : iconMap["terminal"]
              }
              action="node"
              dispatch={dispatch}
              drawerState={drawerState}
            />
          }
        />

        <DrawerActionsToolbar
          button={
            <ButtonContainer
              title="Directory"
              Icon={iconMap["directory"]}
              action="directory"
              dispatch={dispatch}
              drawerState={drawerState}
            />
          }
        />

        <DrawerActionsToolbar
          button={
            <ButtonContainer
              title="Files"
              Icon={iconMap["files"]}
              action="files"
              dispatch={dispatch}
              drawerState={drawerState}
            />
          }
        />

        <DrawerActionsToolbar
          button={
            <ButtonContainer
              title="Preview"
              Icon={preview ? iconMap["preview"] : iconMap["brain"]}
              action="preview"
              dispatch={dispatch}
              drawerState={drawerState}
            />
          }
        />

        <DrawerActionsToolbar
          button={
            <ButtonWithTooltip
              //@ts-ignore
              style={buttonStyle}
              position="bottom"
              content={!node && terminal ? "Node Details" : "Terminal"}
              onClick={() => {
                if (terminal) {
                  dispatch(setDrawerCurrentlyActive("node", "node"));
                } else {
                  dispatch(setDrawerCurrentlyActive("node", "terminal"));
                }
              }}
              variant="primary"
              icon={
                !node && terminal ? (
                  <NodeIcon style={iconStyle} />
                ) : (
                  <TerminalIcon style={iconStyle} />
                )
              }
            />
          }
        />

        <DrawerActionsToolbar
          button={
            <ButtonWithTooltip
              //@ts-ignore
              style={buttonStyle}
              position="bottom"
              variant="primary"
              content={!note && note ? "Node Details" : "Feed Note"}
              onClick={() => {
                if (note) {
                  dispatch(setDrawerCurrentlyActive("node", "node"));
                } else {
                  dispatch(setDrawerCurrentlyActive("node", "note"));
                }
              }}
              icon={
                !node && note ? (
                  <NodeIcon style={iconStyle} />
                ) : (
                  <NoteIcon style={iconStyle} />
                )
              }
            />
          }
        />

        <DrawerActionsToolbar
          button={
            <ButtonWithTooltip
              //@ts-ignore
              style={buttonStyle}
              position="bottom"
              content={preview ? "Xtk Viewer" : "Preview"}
              variant="primary"
              onClick={() => {
                if (preview) {
                  dispatch(setDrawerCurrentlyActive("preview", "xtk"));
                } else {
                  dispatch(setDrawerCurrentlyActive("preview", "preview"));
                }
              }}
              icon={
                preview ? (
                  <BrainIcon style={iconStyle} />
                ) : (
                  <PreviewIcon style={iconStyle} />
                )
              }
            />
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

const DrawerActionsToolbar = ({ button }: { button: React.ReactNode }) => {
  return <ToolbarContainer childComponent={button} />;
};

export const ButtonContainer = ({
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
  );
};
