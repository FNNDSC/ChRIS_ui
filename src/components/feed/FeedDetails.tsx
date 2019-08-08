import React from "react";
import Moment from "react-moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import imgPlaceholder from "../../assets/images/feed_ph_70x70.png";
import { IFeedState } from "../../store/feed/types";
import { Title } from "@patternfly/react-core";
import ChrisAPIClient from "../../api/chrisapiclient";

import { Note } from "@fnndsc/chrisapi";

interface INoteState {
  feedDescription?: Note;
}
type AllProps = IFeedState;

class FeedDetails extends React.Component<AllProps, INoteState> {
  constructor(props: AllProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { details } = this.props;
    if (!details) {
      return;
    }
    const id = details.id as number;
    this.fetchNote(id);
  }

  async fetchNote(feedId: number) {
    const client = ChrisAPIClient.getClient();
    const feed = await client.getFeed(feedId);
    const note = await feed.getNote();
    const { data } = note;
    console.log("Fetch Note", note.data);

    this.setState({
      feedDescription: data.content
    });
  }

  calculateTotalRuntime() {
    const plugins = this.props.items;
    if (!plugins) {
      return 0;
    }
    let runtime = 0;
    for (const plugin of plugins) {
      const start = new Date(plugin.start_date);
      const end = new Date(plugin.end_date);
      const elapsed = end.getTime() - start.getTime(); // milliseconds between start and end
      runtime += elapsed;
    }
    // format millisecond amount into human-readable string
    let runtimeStrings = [];
    const timeParts = [
      ["day", Math.floor(runtime / (1000 * 60 * 60 * 24))],
      ["hr", Math.floor((runtime / (1000 * 60 * 60)) % 24)],
      ["min", Math.floor((runtime / 1000 / 60) % 60)],
      ["sec", Math.floor((runtime / 1000) % 60)]
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
    const { details } = this.props;
    const { feedDescription } = this.state;
    console.log("Feed Description", feedDescription);

    const runtime = this.calculateTotalRuntime();

    return (
      !!details && (
        <div className="feed-details">
          <ul className="feed-breadcrumbs">
            <li>
              <a href="/feeds">My feeds</a>
            </li>
            <li>{details.name}</li>
          </ul>
          <div className="feed-info-block pf-l-grid">
            <div className="pf-l-grid__item pf-m-1-col">
              <img src={imgPlaceholder} alt="placeholder for feed" />
            </div>
            <div className="pf-l-grid__item pf-m-11-col">
              <Title headingLevel="h1" size="3xl" className="capitalize">
                {details.name}
              </Title>
              <ul className="pf-c-list pf-m-inline">
                <li>
                  <small>Creator</small>
                  <p>
                    <FontAwesomeIcon icon={["far", "user"]} />{" "}
                    {details.creator_username}
                  </p>
                </li>
                <li>
                  <small>Created</small>
                  <p>
                    <FontAwesomeIcon icon={["far", "calendar-alt"]} />
                    <Moment format="DD MMM YYYY @ HH:mm">
                      {details.creation_date}
                    </Moment>
                  </p>
                </li>
                <li>
                  <small>Total Runtime</small>
                  <p>
                    <FontAwesomeIcon icon={["far", "calendar-alt"]} />
                    {runtime}
                  </p>
                </li>

                <li>
                  <small>Feed Description</small>
                  <p>
                    <FontAwesomeIcon icon={["far", "file-alt"]} />
                    {!feedDescription ? (
                      <em>None Provided</em>
                    ) : (
                      feedDescription
                    )}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    );
  }
}

export default FeedDetails;
