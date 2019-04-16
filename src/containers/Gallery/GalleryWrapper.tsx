import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IExplorerState } from "../../store/explorer/types";

interface IOtherProps {
    children: any;
}
interface IPropsFromDispatch {
   // onSidebarToggle: typeof onSidebarToggle;
}
type AllProps = IExplorerState & IOtherProps & IPropsFromDispatch;

class GalleryWrapper extends React.Component<AllProps> {
    render() {
        const { children } = this.props;

        return (
            <div className="gallery-wrapper" >
                {children}
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
   // onSidebarToggle: (isOpened: boolean) => dispatch(onSidebarToggle(isOpened))
});

const mapStateToProps = ({ explorer }: ApplicationState) => ({
    // isSidebarOpen: ui.isSidebarOpen,
    // loading: ui.loading,
    // user
});


export default connect(
    mapStateToProps,
    null
   // mapDispatchToProps
)(GalleryWrapper);
