import { ToolbarItem } from "@patternfly/react-core";
import { Badge } from "antd";
import React, { ReactNode, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchNote } from "../../api/common";
import { setDrawerCurrentlyActive } from "../../store/drawer/actions";
import { IDrawerState } from "../../store/drawer/types";
import { useTypedSelector } from "../../store/hooks";
import { ButtonWithTooltip } from "../Feeds/DrawerUtils";
import { handleToggle } from "../Feeds/utilties";
import {
  BrainIcon,
  CodeBranchIcon,
  FeedBrowserIcon,
  DuplicateIcon as FolderTreeIcon,
  NodeDetailsPanelIcon,
  NoteEditIcon,
  PreviewIcon,
  TerminalIcon,
} from "../Icons";
import "./feed-details.css";

const FeedDetails = () => {
  const currentFeed = useTypedSelector((state) => state.feed.currentFeed.data);

  const dispatch = useDispatch();
  const drawerState = useTypedSelector((state) => state.drawers);

  const node = drawerState["node"].currentlyActive === "node" ? true : false;
  const note = drawerState["node"].currentlyActive === "note" ? true : false;
  const [showNoteBadge, setShowNoteBadge] = useState(false);
  const terminal =
    drawerState["node"].currentlyActive === "terminal" ? true : false;

  const preview =
    drawerState["preview"].currentlyActive === "preview" ? true : false;

  React.useEffect(() => {
    fetchNote(currentFeed).then((feedNote) => {
      feedNote && feedNote.data.content.length > 0 && !note
        ? setShowNoteBadge(true)
        : setShowNoteBadge(false);
    });
  }, [note, currentFeed]);

  const items = (
    <React.Fragment>
      <DrawerActionsToolbar
        button={
          <ButtonContainer
            title="Feed Tree Panel"
            Icon={<CodeBranchIcon />}
            action="graph"
            dispatch={dispatch}
            drawerState={drawerState}
            isDisabled={drawerState["graph"].open}
          />
        }
      />

      <DrawerActionsToolbar
        button={
          <ButtonContainer
            title={
              node ? "Configuration Panel" : note ? "Feed Note" : "Terminal"
            }
            Icon={
              node ? (
                <NodeDetailsPanelIcon />
              ) : note ? (
                <>
                  <NoteEditIcon />
                </>
              ) : (
                <TerminalIcon />
              )
            }
            action="node"
            dispatch={dispatch}
            drawerState={drawerState}
            isDisabled={drawerState["node"].open}
          />
        }
      />

      <DrawerActionsToolbar
        button={
          <ButtonContainer
            title="Folder Directory Panel"
            Icon={<FolderTreeIcon />}
            action="directory"
            dispatch={dispatch}
            drawerState={drawerState}
            isDisabled={drawerState["directory"].open}
          />
        }
      />

      <DrawerActionsToolbar
        button={
          <ButtonContainer
            title="Files Table Panel"
            Icon={<FeedBrowserIcon />}
            action="files"
            dispatch={dispatch}
            drawerState={drawerState}
            isDisabled={drawerState["files"].open}
          />
        }
      />

      <DrawerActionsToolbar
        button={
          <ButtonContainer
            title="Preview Panel"
            Icon={preview ? <PreviewIcon /> : <BrainIcon />}
            action="preview"
            dispatch={dispatch}
            drawerState={drawerState}
            isDisabled={drawerState["preview"].open}
          />
        }
      />

      <DrawerActionsToolbar
        button={
          <ButtonWithTooltip
            className="button-style large-button"
            position="bottom"
            content={!node && terminal ? "Configuration Panel" : "Terminal"}
            onClick={() => {
              if (terminal) {
                dispatch(setDrawerCurrentlyActive("node", "node"));
              } else {
                dispatch(setDrawerCurrentlyActive("node", "terminal"));
              }
            }}
            Icon={
              !node && terminal ? <NodeDetailsPanelIcon /> : <TerminalIcon />
            }
            isDisabled={false}
          />
        }
      />

      <DrawerActionsToolbar
        button={
          <Badge dot={showNoteBadge && !note ? true : false} offset={[-5, 0]}>
            <ButtonWithTooltip
              className="button-style large-button"
              position="bottom"
              content={!note ? "Feed Note" : "Configuration Panel"}
              onClick={() => {
                if (note) {
                  dispatch(setDrawerCurrentlyActive("node", "node"));
                } else {
                  dispatch(setDrawerCurrentlyActive("node", "note"));
                }
              }}
              Icon={
                !node && note ? (
                  <NodeDetailsPanelIcon />
                ) : (
                  <>
                    <NoteEditIcon />
                  </>
                )
              }
              isDisabled={false}
            />
          </Badge>
        }
      />

      <DrawerActionsToolbar
        button={
          <ButtonWithTooltip
            className="button-style large-button"
            position="bottom"
            content={preview ? "Visualization Panel" : "Preview Panel"}
            onClick={() => {
              if (preview) {
                dispatch(setDrawerCurrentlyActive("preview", "xtk"));
              } else {
                dispatch(setDrawerCurrentlyActive("preview", "preview"));
              }
            }}
            Icon={preview ? <BrainIcon /> : <PreviewIcon />}
            isDisabled={false}
          />
        }
      />
    </React.Fragment>
  );

  return <>{items}</>;
};

export default FeedDetails;

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
  isDisabled,
}: {
  action: string;
  dispatch: any;
  Icon: React.ReactNode;
  title: string;
  drawerState: IDrawerState;
  isDisabled: boolean;
}) => {
  return (
    <ButtonWithTooltip
      position="bottom"
      className="button-style large-button"
      content={<span>{title}</span>}
      Icon={Icon}
      variant="primary"
      onClick={() => {
        handleToggle(action, drawerState, dispatch);
      }}
      isDisabled={isDisabled}
    />
  );
};
