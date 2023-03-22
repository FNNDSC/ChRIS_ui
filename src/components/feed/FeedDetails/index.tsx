import React, { ReactElement, ReactNode } from "react";
import { Toolbar, ToolbarItem, ToolbarContent } from "@patternfly/react-core";
import { Badge } from "antd";
import { useTypedSelector } from "../../../store/hooks";
import { ButtonWithTooltip, handleToggle } from "../../common/button";
import { LoadingContent } from "../../common/loading/LoadingContent";
import { LoadingErrorAlert } from "../../common/errorHandling";
import { useDispatch } from "react-redux";
import { IDrawerState } from "../../../store/drawer/types";
import { iconMap } from "../../../api/models/file-viewer.model";
import "./FeedDetails.scss";

const FeedDetails = () => {
  const dispatch = useDispatch();
  const { currentFeed: currentFeedPayload, showToolbar } = useTypedSelector(
    (state) => state.feed
  );

  const drawerState = useTypedSelector((state) => state.drawers);

  const { error, data: feed, loading } = currentFeedPayload;

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
          title="Files"
          Icon={iconMap["files"]}
          action="files"
          dispatch={dispatch}
          drawerState={drawerState}
        />

        <DrawerActionsToolbar
          title="Graph"
          Icon={iconMap["graph"]}
          action="graph"
          dispatch={dispatch}
          drawerState={drawerState}
        />

        <DrawerActionsToolbar
          title="Node"
          Icon={iconMap["node"]}
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
          title="Preview"
          Icon={iconMap["preview"]}
          action="preview"
          dispatch={dispatch}
          drawerState={drawerState}
        />
      </div>
    </React.Fragment>
  );

  if (feed) {
    return (
      <ToolbarComponent>
        <ToolbarContent>{items}</ToolbarContent>
      </ToolbarComponent>
    );
  } else if (loading) {
    return (
      <ToolbarComponent>
        <ToolbarContent>
          <ToolbarContainer childComponent={<LoadingContent />} />
        </ToolbarContent>
      </ToolbarComponent>
    );
  } else if (error) {
    return (
      <ToolbarComponent>
        <LoadingErrorAlert error={error} />
      </ToolbarComponent>
    );
  } else return null;
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
        <Badge offset={[0, 15]} dot={!drawerState[action].open}>
          <ButtonWithTooltip
            style={{
              padding: "0",
            }}
            content={<span>{title}</span>}
            icon={
              <Icon
                style={{
                  color: "white",
                  width: "32px",
                  height: "32px",
                }}
              />
            }
            variant="link"
            onClick={() => handleToggle(action, drawerState, dispatch)}
          />
        </Badge>
      }
    />
  );
};
