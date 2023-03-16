import React, { ReactElement } from "react";
import Moment from "react-moment";
import {
  Button,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
} from "@patternfly/react-core";
import { Popover } from "antd";
import { FaEdit } from "react-icons/fa";
import { useTypedSelector } from "../../../store/hooks";
import ShareFeed from "../ShareFeed/ShareFeed";
import FeedNote from "./FeedNote";
import { ButtonWithTooltip } from "../../common/button";
import { LoadingContent } from "../../common/loading/LoadingContent";
import { LoadingErrorAlert } from "../../common/errorHandling";
import { MdLibraryAdd } from "react-icons/md";
import "./FeedDetails.scss";
import { useDispatch } from "react-redux";
import { setShowToolbar } from "../../../store/feed/actions";

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

  const items = (
    <React.Fragment>
      <ToolbarItem spacer={spacer}>
        <span>{feed && feed.data.name}</span>
      </ToolbarItem>
      <ToolbarItem spacer={spacer}>
        <span>Feed ID: {feed && feed.data.id}</span>
      </ToolbarItem>
      <ToolbarItem spacer={spacer}>
        <span>Creator: {feed && feed.data.creator_username}</span>
      </ToolbarItem>
      <ToolbarItem spacer={spacer}>
        <span>
          Created:{" "}
          {
            <Moment format="DD MMM YYYY @ HH:mm">
              {feed && feed.data.creation_date}
            </Moment>
          }
        </span>
      </ToolbarItem>
      <div
        style={{
          display: "flex",
          marginLeft: "0 auto",
        }}
      >
        <ToolbarItem spacer={spacer}>
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
        </ToolbarItem>
        <ToolbarItem spacer={spacer}>
          <ShareFeed feed={feed} />
        </ToolbarItem>
      </div>

      <ToolbarItem spacer={spacer}>
        <Button
          variant="tertiary"
          onClick={() => {
            dispatch(setShowToolbar());
          }}
        >
          Close Toolbar
        </Button>
      </ToolbarItem>
    </React.Fragment>
  );

  if (feed) {
    return !showToolbar ? (
      <ButtonWithTooltip
        onClick={() => {
          dispatch(setShowToolbar());
        }}
        content={<span>Click to open the toolbar</span>}
        position="top"
        style={{
          position: "absolute",
          zIndex: "999",
          left: "0",
          width: "fit-content",
        }}
        variant="link"
        icon={
          <MdLibraryAdd
            style={{
              width: "24px",
              height: "24px",
              color: "white",
            }}
          />
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
          <ToolbarItem>
            <LoadingContent />
          </ToolbarItem>
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
