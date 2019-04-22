import * as React from "react";
import { IGalleryState, IGalleryToolbarState } from "../../store/gallery/types";
import { GalleryToolbar } from "../gallery";
import "./GalleryWrapper.scss";


type AllProps = {
    children: any;
    index: number;
    total: number;
}

class GalleryWrapper extends React.Component<AllProps, IGalleryToolbarState> {
    componentDidMount() {
        document.addEventListener("fullscreenchange", this.handleFullScreenChange, false);
    }
    state = {
        isFullscreen: false,
        isPlaying: false
    }

    render() {
        const { children,  index, total } = this.props;
      
        return (
            !!children &&
            <div id="gallery"
                className="gallery-wrapper" >
                {children}
                { total > 1 &&
                    <GalleryToolbar
                        index={index}
                        total={total}
                        onToolbarClick={this.handleToolbarAction}
                        {...this.state}  />
                    }
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
            // this.props.downloadFile();
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

    componentWillUnmount() {
        document.removeEventListener("fullscreenchange", this.handleFullScreenChange);
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

export default React.memo(GalleryWrapper);
