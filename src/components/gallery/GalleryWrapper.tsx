import React, { useEffect, useState } from "react";

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

const GalleryWrapper: React.FC<AllProps> = ({
  handleOnToolbarAction,
  total,
  listOpenFilesScrolling,
  children
}) => {
  const [isMounted, setMounted] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.addEventListener(
      "fullscreenchange",
      handleFullScreenChange,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set flag for full screen changes
  const handleFullScreenChange = () => {
    isMounted && setFullScreen(isFullScreen());
  };

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

  // Description: triggers toolbar functionality - Group gallery actions
  const handleGalleryActions = {
    play: () => {
      handleOnToolbarAction(galleryActions.play);
    },
    pause: () => {
      handleOnToolbarAction(galleryActions.pause);
    },
    // Description: will make the view full screen
    fullscreen: () => {
      const elem = document.getElementById("gallery");
      !!elem && (isFullScreen() ? closeFullScreen() : openFullScreen(elem));
    },
    next: () => {
      handleOnToolbarAction(galleryActions.next);
    },
    previous: () => {
      handleOnToolbarAction(galleryActions.previous);
    },
    first: () => {
      handleOnToolbarAction(galleryActions.first);
    },
    last: () => {
      handleOnToolbarAction(galleryActions.last);
    }
  };

  return !!children ? (
    <div id="gallery" className="gallery-wrapper">
      {children}
      {total > 0 && (
        <GalleryToolbar
          isPlaying={listOpenFilesScrolling}
          total={total}
          onToolbarClick={(action: string) => {
            (handleGalleryActions as any)[action].call();
          }}
          isFullscreen={fullScreen}
        />
      )}
    </div>
  ) : null;
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
