import * as React from 'react';
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Page } from '@patternfly/react-core';
import { ApplicationState } from "../../store/root/applicationState";
// import { IUiState } from "../../store/ui/types";
// import { uiOnBeforeRequest } from "../../store/ui/actions";
import Header from './Header';
import Sidebar from './Sidebar';

interface OtherProps {
    children: any;
}
interface PropsFromDispatch {
    
}
type WrapperContainerProps = OtherProps & PropsFromDispatch;

class Wrapper extends React.Component<WrapperContainerProps> {

    render() {
        const { children } = this.props;

        return (
            <React.Fragment>
                <Page
                    className="pf-background"
                    header={<Header />}
                    sidebar={<Sidebar />} >
                    {children}
                </Page>
            </React.Fragment>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    
});

const mapStateToProps = ({ ui }: ApplicationState) => ({
    loading: ui.loading
});


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Wrapper)
