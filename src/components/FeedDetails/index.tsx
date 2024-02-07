import React, { ReactNode, useState } from "react";
import { ToolbarItem } from "@patternfly/react-core";
import { Badge } from "antd";
import { useTypedSelector } from "../../store/hooks";
import { ButtonWithTooltip } from "../Feeds/DrawerUtils";
import { handleToggle } from "../Feeds/utilties";
import { useDispatch } from "react-redux";
import { IDrawerState } from "../../store/drawer/types";
import FaFileIcon from "@patternfly/react-icons/dist/esm/icons/file-icon";
import FaCodeBranch from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";
import FaBrainIcon from "@patternfly/react-icons/dist/esm/icons/brain-icon";
import CommandLineIcon from "@patternfly/react-icons/dist/esm/icons/terminal-icon";
import {
  FolderOpenIcon,
  PencilSquareIcon,
  PhotoIcon,
  EllipsisHorizontalCircleIcon,
} from "@heroicons/react/24/solid";
import { setDrawerCurrentlyActive } from "../../store/drawer/actions";
import { fetchNote } from "../../api/common";
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
            title="Graph"
            Icon={<FaCodeBranch />}
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
            title="Node"
            Icon={
              node ? (
                <EllipsisHorizontalCircleIcon className="pf-v5-svg" />
              ) : note ? (
                <>
                  <PencilSquareIcon className="pf-v5-svg" />
                </>
              ) : (
                <CommandLineIcon className="pf-v5-svg" />
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
            title="Directory"
            Icon={<FolderOpenIcon className="pf-v5-svg" />}
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
            title="Files"
            Icon={<FaFileIcon />}
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
            title="Preview"
            Icon={
              preview ? <PhotoIcon className="pf-v5-svg" /> : <FaBrainIcon />
            }
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
            content={!node && terminal ? "Node Details" : "Terminal"}
            onClick={() => {
              if (terminal) {
                dispatch(setDrawerCurrentlyActive("node", "node"));
              } else {
                dispatch(setDrawerCurrentlyActive("node", "terminal"));
              }
            }}
            Icon={
              !node && terminal ? (
                <EllipsisHorizontalCircleIcon className="pf-v5-svg" />
              ) : (
                <CommandLineIcon className="pf-v5-svg" />
              )
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
              content={!note ? "Feed Note" : "Node Details"}
              onClick={() => {
                if (note) {
                  dispatch(setDrawerCurrentlyActive("node", "node"));
                } else {
                  dispatch(setDrawerCurrentlyActive("node", "note"));
                }
              }}
              Icon={
                !node && note ? (
                  <EllipsisHorizontalCircleIcon className="pf-v5-svg" />
                ) : (
                  <>
                    <PencilSquareIcon className="pf-v5-svg" />
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
            content={preview ? "Xtk Viewer" : "Preview"}
            onClick={() => {
              if (preview) {
                dispatch(setDrawerCurrentlyActive("preview", "xtk"));
              } else {
                dispatch(setDrawerCurrentlyActive("preview", "preview"));
              }
            }}
            Icon={
              preview ? <FaBrainIcon /> : <PhotoIcon className="pf-v5-svg" />
            }
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
