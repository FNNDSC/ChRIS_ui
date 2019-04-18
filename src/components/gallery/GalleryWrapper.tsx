import * as React from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { GalleryArrows, GalleryToolbar, GalleryFullScreen } from "../gallery";
import "./GalleryWrapper.scss";
import { IGalleryItem } from "../../api/models/gallery.model";

interface IOtherProps {
    children: any;
}

interface IState {
    isFullscreen: boolean;
    isPlaying: boolean;
}
type AllProps = { galleryItems: IGalleryItem[] } & IOtherProps;

class GalleryWrapper extends React.Component<AllProps, IState> {
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
        {(!!galleryItems && galleryItems.length > 1) && (
          <React.Fragment>
            <GalleryArrows
              param={"tbd"}
              onSlideChange={this.handleSlideChange}
            />
            <GalleryToolbar
              isPlaying={this.state.isPlaying}
              onToolbarClick={this.handlePlayPause}
            />
          </React.Fragment>
        )}
        <GalleryFullScreen
          onFullScreenGallery={this.handlefullscreen}
          isFullscreen={this.state.isFullscreen}
        />
      </div>
    );
  }

  // Description: triggers play or pause functionality
  handlePlayPause = (isPlay: boolean) => {
    // console.log("handlePlayPause: ", isPlay);
    this.setState({
        isPlaying: !isPlay
    });
  }

  // Description: will make the view full screen ***** WORKING *****
  handleSlideChange(offset: number) {
    // console.log("handleSlideChange", offset);
  }

  // Description: will make the view full screen
  handlefullscreen = () => {
    const elem = document.getElementById("gallery");
    const isOpened = this.state.isFullscreen;
    !!elem && (isOpened ? closeFullScreen() : openFullScreen(elem));
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

const mapStateToProps = ({ explorer }: ApplicationState) => ({
    galleryItems: explorer.galleryItems || []
});


export default connect(
    mapStateToProps,
    null
)(GalleryWrapper);


