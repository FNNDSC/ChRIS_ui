import * as React from "react";
import { RouteComponentProps, Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { setSidebarActive } from "../../store/ui/actions";
import Wrapper from '../../containers/layout/PageWrapper';
import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import MyFeedsPage from './MyFeeds'; 
import AllFeedsPage from './AllFeeds';


interface PropsFromDispatch {
    setSidebarActive: typeof setSidebarActive;
}
type AllProps = PropsFromDispatch & RouteComponentProps;

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
const FeedsRoutes: React.FunctionComponent<any> = props => (
    <Switch>
        <Route exact path={`${props.match.path}/`} component={AllFeedsPage} />
        <Route path={`${props.match.path}/:id`} component={MyFeedsPage} />
    </Switch>
);

export default FeedsPage;
