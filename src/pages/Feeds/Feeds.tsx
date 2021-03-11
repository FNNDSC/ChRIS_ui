import * as React from "react";
import { RouteComponentProps, Route, Switch } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import FeedListView from "./components/FeedListView";
import FeedView from "./components/FeedView";
import "./Feed.scss";

const FeedsPage: React.FC<RouteComponentProps> = (
  props: RouteComponentProps
) => {
  return (
    <Wrapper>
      <Switch>
        <Route exact path={`${props.match.path}`} component={FeedListView} />
        <Route path={`${props.match.path}/:id`} component={FeedView} />
      </Switch>
    </Wrapper>
  );
};

export default FeedsPage;
