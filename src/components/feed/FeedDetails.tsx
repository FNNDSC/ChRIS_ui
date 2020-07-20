import React from "react";
import Moment from "react-moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import imgPlaceholder from "../../assets/images/feed_ph_70x70.png";
import { PluginInstance, Feed } from "@fnndsc/chrisapi";
import { Title } from "@patternfly/react-core";
import ShareFeed from "../../components/feed/ShareFeed/ShareFeed";

interface INoteState {
  feedDescription?: string;
  feed?: Feed;
}

interface AllProps {
  items?: PluginInstance[];
  feed: Feed;
}

class FeedDetails extends React.Component<AllProps, INoteState> {
  constructor(props: AllProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { feed } = this.props;
    if (!feed) {
      return;
    }
    this.fetchNote();
  }

  async fetchNote() {
    const { feed } = this.props;
    if (feed) {
      const note = await feed.getNote();
      const { data } = note;

      this.setState({
        feedDescription: data.content,
      });
    } else return;
  }

  calculateTotalRuntime() {
    const plugins = this.props.items;
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

  render() {
    const { feed } = this.props;
    const { feedDescription } = this.state;

    return (
      <div className="feed-details">
        <ul className="feed-breadcrumbs">
          <li>
            <a href="/feeds">My feeds</a>
          </li>
          <li>{feed ? feed.data.name : ""}</li>
        </ul>
        <div className="feed-info-block pf-l-grid">
          <div className="pf-l-grid__item pf-m-1-col">
            <img src={imgPlaceholder} alt="placeholder for feed" />
          </div>
          <div className="pf-l-grid__item pf-m-11-col">
            <Title headingLevel="h1" size="3xl" className="capitalize">
              {feed ? feed.data.name : ""}
            </Title>
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
                  {!feedDescription ? <em>None Provided</em> : feedDescription}
                </p>
              </li>

              <li>
                <ShareFeed feed={feed} />
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default FeedDetails;
