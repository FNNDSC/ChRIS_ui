import * as React from "react";
import { RouteComponentProps, Route } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import FeedListView from "./components/FeedListView";
import FeedView from "./components/FeedView";
import "./Feed.scss";

const FeedsPage: React.FC<RouteComponentProps> = (
  props: RouteComponentProps
) => {
  return (
    <Wrapper>
      <Route exact path={`${props.match.path}`} component={FeedListView} />
      <Route exact path={`${props.match.path}/:id`} component={FeedView} />
    </Wrapper>
  );
};

export default FeedsPage;
