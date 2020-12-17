import React from "react";
import Moment from "react-moment";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Title,
  Grid,
  GridItem,
  Skeleton,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import ShareFeed from "../../../components/feed/ShareFeed/ShareFeed";
import { FeedPayload, PluginInstancePayload } from "../../../store/feed/types";
import { ApplicationState } from "../../../store/root/applicationState";
import imgPlaceholder from "../../../assets/images/feed_ph_70x70.png";
import "./feedDetails.scss";

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
      let runtimeStrings = [];
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
      let { data: feed, error: feedError, loading: feedLoading } = currentFeed;
      if (feedLoading) {
        return (
          <Grid className="feed-details" span={12}>
            <GridItem>
              <Skeleton screenreaderText="Fetching Content" />
              <br />
              <Skeleton screenreaderText="Fetching Content" />
              <br />
              <Skeleton screenreaderText="Fetching Content" />
            </GridItem>
          </Grid>
        );
      } else if (feedError) {
        return (
          <Grid className="feed-details" span={12}>
            <GridItem>
              <p>
                Oh snap! Looks like something went wrong. Please try again
                later.
              </p>
            </GridItem>
          </Grid>
        );
      } else if (feed) {
        return (
          <>
            <Grid className="feed-details" span={12}>
              <GridItem>
                <Flex className="feed-breadcrumbs">
                  <FlexItem>
                    <a href="/feeds">My feeds</a>
                  </FlexItem>
                  <FlexItem>{feed ? feed.data.name : ""}</FlexItem>
                </Flex>
              </GridItem>

              <GridItem>
                <Flex>
                  <FlexItem>
                    <img src={imgPlaceholder} alt="placeholder for feed" />
                  </FlexItem>
                  <FlexItem>
                    <Title
                      style={{ color: "white" }}
                      headingLevel="h2"
                      className="capitalize"
                    >
                      {feed ? feed.data.name : ""}
                    </Title>
                  </FlexItem>
                </Flex>
              </GridItem>
              <GridItem span={12}>
                <ul className="pf-c-list pf-m-inline">
                  <li>
                    <small>Creator</small>
                    <p>
                      <FontAwesomeIcon icon={["far", "user"]} />{" "}
                      {feed ? feed.data.creator_username : ""}
                    </p>
                  </li>
                  <li>
                    <small>Created</small>
                    <p>
                      <FontAwesomeIcon icon={["far", "calendar-alt"]} />
                      <Moment format="DD MMM YYYY @ HH:mm">
                        {feed ? feed.data.creation_date : ""}
                      </Moment>
                    </p>
                  </li>

                  <li>
                    <small>Feed Description</small>
                    <p>
                      <FontAwesomeIcon icon={["far", "file-alt"]} />
                      {!feedDescription ? (
                        <span>None Provided</span>
                      ) : (
                        feedDescription
                      )}
                    </p>
                  </li>

                  <li>
                    <ShareFeed feed={feed} />
                  </li>
                </ul>
              </GridItem>
            </Grid>
          </>
        );
      } else return null;
    }
    return null;
  }
}

const mapStateToProps = ({ feed }: ApplicationState) => ({
  currentFeed: feed.currentFeed,
  instances: feed.pluginInstances,
});

export default connect(mapStateToProps, null)(FeedDetails);
