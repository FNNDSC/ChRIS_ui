import * as React from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { GalleryToolbar, GalleryFullScreen } from "../gallery";
import "./GalleryWrapper.scss";
import { IGalleryItem, galleryActions, IGalleryState } from "../../api/models/gallery.model";

interface IOtherProps {
    children: any;
}

type AllProps = { galleryItems: IGalleryItem[] } & IOtherProps;

class GalleryWrapper extends React.Component<AllProps, IGalleryState> {
    constructor(props: AllProps) {
        super(props);
        document.addEventListener("fullscreenchange", this.handleFullScreenChange, false);
    }
    state = {
        isFullscreen: false,
        isPlaying: false
    };

    render() {
        const { children, galleryItems } = this.props;
        // console.log("GalleryWrapper", galleryItems);
        return (
            <div id="gallery" className="gallery-wrapper">
                {children}
                <GalleryToolbar
                    galleryItems={galleryItems}
                    onToolbarClick={this.handleToolbarAction}
                    {...this.state}
                />
            </div>
        );
    }

    // Description: triggers toolbar functionality
    handleToolbarAction = (action: string) => {
        // console.log("handlePlayPause: trigger action = ", action);
        (this.handleGalleryActions as any)[action].call();
    }

    // Description: Group gallery actions
    handleGalleryActions = {
        play: () => {
            console.log("PLAY Viewer");
            this.setState({
                isPlaying: true
            });
        },
        pause: () => {
            console.log("PAUSE Viewer");
            this.setState({
                isPlaying: false
            });
        },
        // Description: will make the view full screen
        fullscreen: () => {
            const elem = document.getElementById("gallery");
            !!elem && (isFullScreen() ? closeFullScreen() : openFullScreen(elem));
        },
        next: () => { // TO be done
            console.log("next");
        },
        previous: () => { // TO be done
            console.log("previous");
        },
        download: () => { // TO be done
            console.log("download");
        },
        information: () => { // TO be done
            console.log("information");
        }
    }

    // Set flag for full screen changes
    handleFullScreenChange = () => {
        this.setState({
            isFullscreen: isFullScreen()
        });
    }
}

// --------------------------------------------------------
// Description: handle full screen open and close
const isFullScreen = () => {
    const elem = document as any;
    return !(!elem.webkitIsFullScreen && !elem.mozFullScreen && !elem.msFullscreenElement);
}
const openFullScreen = (elem: any) => {
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

const mapStateToProps = ({ explorer }: ApplicationState) => ({
    galleryItems: explorer.galleryItems || []
});


export default connect(
    mapStateToProps,
    null
)(GalleryWrapper);


