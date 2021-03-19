import * as React from "react";
import { IGalleryToolbarState } from "../../store/gallery/types";
import { galleryActions } from "../../api/models/gallery.model";
import { GalleryToolbar } from ".";
import "./GalleryWrapper.scss";

type AllProps = {
  children: any;
  total: number;
  hideDownload?: boolean;
  listOpenFilesScrolling?: boolean;
  handleOnToolbarAction: (action: string) => void;
};

class GalleryWrapper extends React.Component<AllProps, IGalleryToolbarState> {
  _isMounted = false;
  componentDidMount() {
    this._isMounted = true;
    document.addEventListener(
      "fullscreenchange",
      this.handleFullScreenChange,
      false
    );
  }
  state = {
    isFullscreen: false,
  };

  render() {
    const { children, total, listOpenFilesScrolling } = this.props;

    return (
      !!children && (
        <div id="gallery" className="gallery-wrapper">
          {children}
          {total > 0 && (
            <GalleryToolbar
              isPlaying={listOpenFilesScrolling}
              total={total}
              onToolbarClick={(action: string) => {
                (this.handleGalleryActions as any)[action].call();
              }}
              {...this.state}
            />
          )}
        </div>
      )
    );
  }

  // Description: triggers toolbar functionality - Group gallery actions
  handleGalleryActions = {
    play: () => {
      this.props.handleOnToolbarAction(galleryActions.play);
    },
    pause: () => {
      this.props.handleOnToolbarAction(galleryActions.pause);
    },
    // Description: will make the view full screen
    fullscreen: () => {
      const elem = document.getElementById("gallery");
      !!elem && (isFullScreen() ? closeFullScreen() : openFullScreen(elem));
    },
    next: () => {
      this.props.handleOnToolbarAction(galleryActions.next);
    },
    previous: () => {
      this.props.handleOnToolbarAction(galleryActions.previous);
    },
    first: () => {
      this.props.handleOnToolbarAction(galleryActions.first);
    },
    last: () => {
      this.props.handleOnToolbarAction(galleryActions.last);
    },
  };

  // Set flag for full screen changes
  handleFullScreenChange = () => {
    this._isMounted &&
      this.setState({
        isFullscreen: isFullScreen(),
      });
  };

  componentWillUnmount() {
    document.removeEventListener(
      "fullscreenchange",
      this.handleFullScreenChange
    );
    this._isMounted = false;
  }
}

// --------------------------------------------------------
// Description: handle full screen open and close
const isFullScreen = () => {
  const elem = document as any;
  return !(
    !elem.webkitIsFullScreen &&
    !elem.mozFullScreen &&
    !elem.msFullscreenElement
  );
};
const openFullScreen = (elem: any) => {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }
};

const closeFullScreen = () => {
  const elem = document as any;
  if (elem.exitFullscreen) {
    elem.exitFullscreen();
  } else if (elem.mozCancelFullScreen) {
    /* Firefox */
    elem.mozCancelFullScreen();
  } else if (elem.webkitExitFullscreen) {
    /* Chrome, Safari and Opera */
    elem.webkitExitFullscreen();
  } else if (elem.msExitFullscreen) {
    /* IE/Edge */
    elem.msExitFullscreen();
  }
};

export default React.memo(GalleryWrapper);
