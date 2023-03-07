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
import { LoadingContent } from "../../common/loading/LoadingContent";
import "./FeedDetails.scss";
import { LoadingErrorAlert } from "../../common/errorHandling";

const FeedDetails = () => {
  const [note, setNote] = React.useState("");
  const [isNoteVisible, setIsNoteVisible] = React.useState(false);
  const [savingNote, setSavingNote] = React.useState(false);
  const currentFeedPayload = useTypedSelector(
    (state) => state.feed.currentFeed
  );

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
    setSavingNote(true);
    const note = await feed?.getNote();
    await note?.put({
      title: "",
      content: editedNote,
    });
    setSavingNote(false);
  };

  const handleClose = () => {
    setIsNoteVisible(!isNoteVisible);
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
            content={
              <FeedNote
                handleClose={handleClose}
                handleEditNote={handleEditNote}
                note={note}
                status={savingNote}
              />
            }
            placement="bottom"
            visible={isNoteVisible}
            trigger="click"
            onVisibleChange={(visible: boolean) => {
              setIsNoteVisible(visible);
            }}
          >
            <Button type="button" variant="tertiary" icon={<FaEdit />}>
              View Feed Note
            </Button>
          </Popover>
        </ToolbarItem>
        <ToolbarItem spacer={spacer}>
          <ShareFeed feed={feed} />
        </ToolbarItem>
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
