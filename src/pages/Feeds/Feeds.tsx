import * as React from "react";
import { RouteComponentProps, Route, Switch } from "react-router-dom";
import Wrapper from "../../containers/Layout/PageWrapper";
import AllFeedsPage from "./components/FeedListView";
import FeedView from "./components/FeedView";

type AllProps = RouteComponentProps;

class FeedsPage extends React.Component<AllProps> {
  render() {
    const { match } = this.props;
    return (
      <Wrapper>
        <FeedsRoutes match={match} />
      </Wrapper>
    );
  }
}

// Description: Build My feeds sub routes
const FeedsRoutes: React.FunctionComponent<any> = (props) => (
  <Switch>
    <Route exact path={`${props.match.path}`} component={AllFeedsPage} />
    <Route path={`${props.match.path}/:id`} component={FeedView} />
  </Switch>
);

export default FeedsPage;
