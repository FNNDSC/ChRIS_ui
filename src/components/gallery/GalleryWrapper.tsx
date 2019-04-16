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
type AllProps = IExplorerState & IOtherProps & IPropsFromDispatch;

class GalleryWrapper extends React.Component<AllProps> {
    render() {
        const { children } = this.props;

        return (
            <div id="gallery" className="gallery-wrapper" >
                {children}
                <GalleryArrows param={"tbd"} />
                <GalleryToolbar isPlaying={false} />
                <GalleryFullScreen onFullScreenGallery={this.handlefullscreen} isFullscreen={true} />
            </div>
        );
    }
     // Description: will make the view full screen
     handlefullscreen = () => {
        const elem = document.getElementById("gallery") as any;
        if (!!elem) {
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
    };

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
