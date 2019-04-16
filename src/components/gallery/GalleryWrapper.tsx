import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IExplorerState } from "../../store/explorer/types";
import { GalleryArrows, GalleryToolbar, GalleryFullScreen } from "../gallery";
import "./GalleryWrapper.scss";
interface IOtherProps {
    children: any;
}
interface IPropsFromDispatch {
    // onSidebarToggle: typeof onSidebarToggle;
}
interface IState {
    isFullscreen: boolean;
}
type AllProps = IExplorerState & IOtherProps & IPropsFromDispatch;

class GalleryWrapper extends React.Component<AllProps, IState> {

    state = {
        isFullscreen: false
    }

    render() {
        const { children } = this.props;

        return (
            <div id="gallery" className="gallery-wrapper" >
                {children}
                <GalleryArrows param={"tbd"} />
                <GalleryToolbar isPlaying={false} />
                <GalleryFullScreen onFullScreenGallery={this.handlefullscreen} isFullscreen={this.state.isFullscreen} />
            </div>
        );
    }
    // Description: will make the view full screen ***** WORKING *****
    handlefullscreen = () => {
        const elem = document.getElementById("gallery");
        const isOpened = this.state.isFullscreen; // Get from state ***** TBD
        (!!elem) && (isOpened ? closeFullScreen() : openFullScreen(elem));
        this.setState({
            isFullscreen: !isOpened
        });
    };

}

// --------------------------------------------------------
// Description: handle full screen open and close
const openFullScreen = (elem: any) => {
    console.log("openFullScreen", elem);
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

const closeFullScreen = () => {
    const elem = document as any;
    if (elem.exitFullscreen) {
        elem.exitFullscreen();
    } else if (elem.mozCancelFullScreen) { /* Firefox */
        elem.mozCancelFullScreen();
    } else if (elem.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitExitFullscreen();
    } else if (elem.msExitFullscreen) { /* IE/Edge */
        elem.msExitFullscreen();
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    // onSidebarToggle: (isOpened: boolean) => dispatch(onSidebarToggle(isOpened))
});

const mapStateToProps = ({ explorer }: ApplicationState) => ({
    // galleryItems: explorer.galleryItems
});


export default connect(
    mapStateToProps,
    null
    // mapDispatchToProps
)(GalleryWrapper);
