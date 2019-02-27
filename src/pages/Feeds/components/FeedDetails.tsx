import React from "react";
import Moment from "react-moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import imgPlaceholder from "../../../assets/images/feed_ph_70x70.png";
import { IFeedState } from "../../../store/feed/types";

type AllProps = IFeedState;

class FeedDetails extends React.Component<AllProps> {
  render() {
    const { details } = this.props;
    return (
      !!details && (
        <div className="feed-info-block pf-l-grid">
          <div className="pf-l-grid__item pf-m-1-col">
            <img src={imgPlaceholder} alt="placeholder for feed" />
          </div>
          <div className="pf-l-grid__item pf-m-11-col">
            <h1>{details.name}</h1>
            <ul className="pf-c-list pf-m-inline">
              <li>
                <small>Creator</small>
                <p>
                  {/* NOTE: stub owner name to be added to the details object (BE) */}
                  <FontAwesomeIcon icon={["far", "user"]} /> {details.creator_username}
                </p>
              </li>
              <li>
                <small>Created</small>
                <p>
                  <FontAwesomeIcon icon={["far", "calendar-alt"]} />
                  <Moment  format="DD MMM YYYY @ HH:MM A">{details.creation_date}</Moment>
                </p>
              </li>
              <li>
                <small>End Date</small>
                <p>
                  <FontAwesomeIcon icon={["far", "calendar-alt"]} /> <Moment  format="DD MMM YYYY @ HH:MM A">{details.modification_date}</Moment>
                </p>
              </li>
            </ul>
          </div>
        </div>
      )
    );
  }
}

export default FeedDetails;
