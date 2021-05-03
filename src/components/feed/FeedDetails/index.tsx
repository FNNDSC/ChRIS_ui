import React from "react";
import Moment from "react-moment";
import { connect } from "react-redux";
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

interface INoteState {
  feedDescription?: string;
}

interface ReduxProps {
  currentFeed?: FeedPayload;
  instances?: PluginInstancePayload;
}

class FeedDetails extends React.Component<ReduxProps, INoteState> {
  state = {
    feedDescription: "",
  };

  componentDidMount() {
    this.fetchNote();
  }

  async fetchNote() {
    const { currentFeed } = this.props;
    if (currentFeed && currentFeed.data) {
      const note = await currentFeed.data.getNote();
      const { data } = note;

      this.setState({
        feedDescription: data.content,
      });
    }
  }

  calculateTotalRuntime() {
    if (this.props.instances) {
      const { data: plugins } = this.props.instances;

      if (!plugins) {
        return 0;
      }
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
    return "";
  }

  render() {
    const { currentFeed } = this.props;
    const { feedDescription } = this.state;

    if (currentFeed) {
      const {
        data: feed,
        error: feedError,
        loading: feedLoading,
      } = currentFeed;

      if (feedLoading) {
        return (
          <div className="feed-details">
            <Skeleton screenreaderText="Fetching Content" />
          </div>
        );
      } else if (feedError) {
        return (
          <div className="feed-details">
            <p>
              Oh snap! Looks like something went wrong. Please try again later.
            </p>
          </div>
        );
      } else if (feed) {
        return (
          <React.Fragment>
            <div className="feed-details">
              <div className="feed-details__list">
                <ul>
                  <div className="feed-details__list--container-1">
                    <li className="feed-details__list--first">
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
                  </div>

                  <div className="feed-details__list--container-2">
                    <li>
                      <ShareFeed feed={feed} />
                    </li>
                  </div>
                </ul>
              </div>
            </div>
          </React.Fragment>
        );
      } else return null;
    } 
  }
}

const mapStateToProps = ({ feed }: ApplicationState) => ({
  currentFeed: feed.currentFeed,
  instances: feed.pluginInstances,
});

export default connect(mapStateToProps, null)(FeedDetails);
