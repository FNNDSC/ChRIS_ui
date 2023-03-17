import React, { ReactElement, ReactNode } from "react";
import Moment from "react-moment";
import {
  Button,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
} from "@patternfly/react-core";
import { Popover, Badge } from "antd";
import { FaEdit } from "react-icons/fa";
import { useTypedSelector } from "../../../store/hooks";
import ShareFeed from "../ShareFeed/ShareFeed";
import FeedNote from "./FeedNote";
import { ButtonWithTooltip, handleOpen } from "../../common/button";
import { LoadingContent } from "../../common/loading/LoadingContent";
import { LoadingErrorAlert } from "../../common/errorHandling";
import { MdLibraryAdd } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setShowToolbar } from "../../../store/feed/actions";
import "./FeedDetails.scss";
import { IDrawerState } from "../../../store/drawer/types";

const FeedDetails = () => {
  const dispatch = useDispatch();
  const [note, setNote] = React.useState("");
  const [isNoteVisible, setIsNoteVisible] = React.useState(false);

  const { currentFeed: currentFeedPayload, showToolbar } = useTypedSelector(
    (state) => state.feed
  );

  const drawerState = useTypedSelector((state) => state.drawers);

  const { error, data: feed, loading } = currentFeedPayload;

  React.useEffect(() => {
    async function fetchNode() {
      if (feed) {
        const note = await feed.getNote();
        const { data: noteData } = note;
        setNote(noteData.content);
      }
    }
    fetchNode();
  }, [feed]);

  const handleEditNote = async (editedNote: string) => {
    const note = await feed?.getNote();
    await note?.put({
      title: "",
      content: editedNote,
    });
  };

  const items = (
    <React.Fragment>
      <ToolbarContainer
        childComponent={<span>{feed && feed.data.name}</span>}
      />
      <ToolbarContainer
        childComponent={<span>Feed ID: {feed && feed.data.id}</span>}
      />
      <ToolbarContainer
        childComponent={
          <span>Creator: {feed && feed.data.creator_username}</span>
        }
      />

      <ToolbarContainer
        childComponent={
          <span>
            Created:{" "}
            {
              <Moment format="DD MMM YYYY @ HH:mm">
                {feed && feed.data.creation_date}
              </Moment>
            }
          </span>
        }
      />

      <div
        style={{
          display: "flex",
          marginLeft: "0 auto",
        }}
      >
        <ToolbarContainer
          childComponent={
            <Popover
              content={<FeedNote handleEditNote={handleEditNote} note={note} />}
              placement="bottom"
              visible={isNoteVisible}
              trigger="click"
              onVisibleChange={(visible: boolean) => {
                setIsNoteVisible(visible);
              }}
            >
              <Button variant="tertiary" icon={<FaEdit />}>
                View Feed Note
              </Button>
            </Popover>
          }
        />
        <ToolbarContainer childComponent={<ShareFeed feed={feed} />} />

        {drawerState.files.open === false && (
          <DrawerActionsToolbar
            action="files"
            title="Files"
            dispatch={dispatch}
          />
        )}
        {drawerState.graph.open === false && (
          <DrawerActionsToolbar
            action="graph"
            title="Graph"
            dispatch={dispatch}
          />
        )}
        {drawerState.node.open === false && (
          <DrawerActionsToolbar
            action="node"
            title="Node"
            dispatch={dispatch}
          />
        )}
        {drawerState.directory.open === false && (
          <DrawerActionsToolbar
            action="directory"
            title="Directory"
            dispatch={dispatch}
          />
        )}

        {drawerState.preview.open === false && (
          <DrawerActionsToolbar
            action="preview"
            title="Preview"
            dispatch={dispatch}
          />
        )}
        <ToolbarContainer
          childComponent={
            <Button
              variant="tertiary"
              onClick={() => {
                dispatch(setShowToolbar());
              }}
            >
              Close Toolbar
            </Button>
          }
        />
      </div>
    </React.Fragment>
  );

  if (feed) {
    const count = getCurrentCount(drawerState);
    return !showToolbar ? (
      <ButtonWithTooltip
        onClick={() => {
          dispatch(setShowToolbar());
        }}
        content={<span>Click to open the toolbar</span>}
        position="bottom"
        style={{
          position: "absolute",
          top: "0.5rem",
          zIndex: "999",
          left: "0",
          width: "fit-content",
        }}
        variant="link"
        icon={
          <Badge count={count}>
            <MdLibraryAdd
              style={{
                width: "24px",
                height: "24px",
                color: "white",
              }}
            />
          </Badge>
        }
      />
    ) : (
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

const getCurrentCount = (drawerState: IDrawerState) => {
  const count = Object.values(drawerState).reduce((count: any, value: any) => {
    return value.open === false ? count + 1 : count;
  }, 0);
  return count;
};

const DrawerActionsToolbar = ({
  action,
  title,
  dispatch,
}: {
  action: string;
  title: string;
  dispatch: any;
}) => {
  return (
    <ToolbarContainer
      childComponent={
        <Button variant="tertiary" onClick={() => handleOpen(action, dispatch)}>
          Open {title}
        </Button>
      }
    />
  );
};
