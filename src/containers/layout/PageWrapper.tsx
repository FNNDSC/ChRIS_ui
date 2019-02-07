import * as React from 'react';
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { onSidebarToggle } from "../../store/ui/actions";
import { Page } from '@patternfly/react-core';
import Header from './Header';
import Sidebar from './Sidebar';

interface OtherProps {
    children: any;
}
interface PropsFromDispatch {
    onSidebarToggle: typeof onSidebarToggle;
}
type AllProps = IUiState & OtherProps & PropsFromDispatch;

class Wrapper extends React.Component<AllProps> {

    // Description: toggles sidebar on pageresize 
    onPageResize = (data: { mobileView: boolean, windowSize: number }) => {
        const { isSidebarOpen, onSidebarToggle } = this.props;
        (!data.mobileView && !isSidebarOpen) && onSidebarToggle(!isSidebarOpen);
    };
    onSidebarToggle = () => {
        const { isSidebarOpen, onSidebarToggle } = this.props;
        onSidebarToggle(!isSidebarOpen);
    };
    render() {
        const { children } = this.props;

        return (
            <Page
                className="pf-background"
                header={<Header onSidebarToggle={this.onSidebarToggle} />}
                sidebar={<Sidebar />}
                onPageResize={this.onPageResize} >
                {children}
            </Page>

        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onSidebarToggle: (isOpened: boolean) => dispatch(onSidebarToggle(isOpened))
});

const mapStateToProps = ({ ui }: ApplicationState) => ({
    loading: ui.loading,
    isSidebarOpen: ui.isSidebarOpen
});


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Wrapper)


