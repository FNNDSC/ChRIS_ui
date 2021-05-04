import React from "react";
import Moment from "react-moment";
import { Skeleton } from "@patternfly/react-core";
import ShareFeed from "../ShareFeed/ShareFeed";

import {
  UserIcon,
  CodeBranchIcon,
  CalendarAltIcon,
  FileAltIcon,
} from "@patternfly/react-icons";
import { useTypedSelector } from "../../../store/hooks";
import "./FeedDetails.scss";

const FeedDetails = () => {
  const [feedDescription, setFeedDescription] = React.useState("");
  const currentFeedPayload = useTypedSelector(
    (state) => state.feed.currentFeed
  );

  const { data: feed, error, loading } = currentFeedPayload;

  React.useEffect(() => {
    async function fetchNode() {
      if (feed) {
        const note = await feed.getNote();
        const { data: noteData } = note;
        setFeedDescription(noteData.content);
      }
    }
    fetchNode();
  }, [feed]);

  if (feed) {
    return (
      <ul className="feed-details">
        <li>
          <CodeBranchIcon />
          {feed && <span> {feed.data.name} </span>}
        </li>
        <li>
          <small>Creator</small>
          <p>
            <UserIcon size="sm" />{" "}
            {feed && <span> {feed.data.creator_username} </span>}
          </p>
        </li>
        <li>
          <small>Created</small>
          <p>
            <CalendarAltIcon size="sm" />
            <Moment format="DD MMM YYYY @ HH:mm">
              {feed && feed.data.creation_date}
            </Moment>
          </p>
        </li>

        <li>
          <small>Feed Description</small>
          <p>
            <FileAltIcon />
            {!feedDescription ? (
              <span>None Provided</span>
            ) : (
              <span>{feedDescription}</span>
            )}
          </p>
        </li>
        <li
         
        >
          <ShareFeed feed={feed} />
        </li>
      </ul>
    );
  } else if (loading) {
    return <Skeleton />;
  } else if (error) {
    return <div>Error Found</div>;
  } else return null;
};

export default FeedDetails;
