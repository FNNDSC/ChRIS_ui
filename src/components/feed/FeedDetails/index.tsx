import React from "react";
import Moment from "react-moment";
import { Skeleton } from "@patternfly/react-core";
import ShareFeed from "../ShareFeed/ShareFeed";
import { FeedPayload, PluginInstancePayload } from "../../../store/feed/types";
import { ApplicationState } from "../../../store/root/applicationState";
import "./FeedDetails.scss";
import {
  UserIcon,
  CodeBranchIcon,
  CalendarAltIcon,
  FileAltIcon,
} from "@patternfly/react-icons";
import { useTypedSelector } from "../../../store/hooks";

interface INoteState {
  feedDescription?: string;
}

const FeedDetails = () => {
  const [feedDescription, setFeedDescription] = React.useState("");
  const currentFeedPayload = useTypedSelector(
    (state) => state.feed.currentFeed
  );
  const instancesPayload = useTypedSelector(
    (state) => state.feed.pluginInstances
  );
  const { data: feed, error, loading } = currentFeedPayload;
  const { data: plugins } = instancesPayload;

  const calculateTotalRuntime = () => {
    if (!plugins) {
      return "";
    } else {
      let runtime = 0;
      for (const plugin of plugins) {
        const start = new Date(plugin.data.start_date);
        const end = new Date(plugin.data.end_date);
        const elapsed = end.getTime() - start.getTime(); // milliseconds between start and end
        runtime += elapsed;
      }
      // format millisecond amount into human-readable string
      const runtimeStrings = [];
      const timeParts = [
        ["day", Math.floor(runtime / (1000 * 60 * 60 * 24))],
        ["hr", Math.floor((runtime / (1000 * 60 * 60)) % 24)],
        ["min", Math.floor((runtime / 1000 / 60) % 60)],
        ["sec", Math.floor((runtime / 1000) % 60)],
      ];
      for (const part of timeParts) {
        const [name, value] = part;
        if (value > 0) {
          runtimeStrings.push(`${value} ${name}`);
        }
      }
      return runtimeStrings.join(", ");
    }
  };

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
      <ul className='feed-details'>
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
        <li>
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
