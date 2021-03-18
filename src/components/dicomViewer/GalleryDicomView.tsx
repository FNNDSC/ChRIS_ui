import React from "react";
import { Button, Backdrop, Bullseye, Spinner } from "@patternfly/react-core";
import { CloseIcon } from "@patternfly/react-icons";
const DcmImageSeries = React.lazy(() => import("./DcmImageSeries"));
import { useTypedSelector } from "../../store/hooks";
import { FeedFile } from "@fnndsc/chrisapi";
import GalleryModel from "../../api/models/gallery.model";
import GalleryWrapper from "../gallery/GalleryWrapper";

type GalleryState = {
  dcmArray: FeedFile[];
  inPlay: boolean;
};

function getInitialState() {
  return {
    dcmArray: [],
    inPlay: false,
  };
}

let runTool = (toolName: string, opt?: any) => {
  return null;
};

const GalleryDicomView = () => {
  const { selectedPlugin, pluginFiles } = useTypedSelector(
    (state) => state.feed
  );

  const [
    galleryDicomState,
    setGalleryDicomState,
  ] = React.useState<GalleryState>(getInitialState);

  const files = selectedPlugin && pluginFiles[selectedPlugin.data.id].files;
  const { dcmArray, inPlay } = galleryDicomState;
  console.log("GalleryDicomView");

  React.useEffect(() => {
    if (files && files.length > 0) {
      const dcmArray = getUrlArray(files);
      setGalleryDicomState((state) => {
        return {
          ...state,
          dcmArray,
        };
      });
    }
    return () => {
      setGalleryDicomState((state) => {
        return {
          ...state,
          dcmArray: [],
        };
      });
    };
  }, [files]);

  const toolExecute = (tool: string) => {
    runTool(tool);
  };

  const handleOpenImage = (cmdName: string) => {
    runTool("openImage", cmdName);
  };

  const setPlayer = (status: boolean) => {
    setGalleryDicomState({
      ...galleryDicomState,
      inPlay: status,
    });
  };

  const handleGalleryActions = {
    next: () => {
      handleOpenImage("next");
    },
    previous: () => {
      handleOpenImage("previous");
    },
    play: () => {
      setGalleryDicomState({
        ...galleryDicomState,
        inPlay: !inPlay,
      });
      handleOpenImage("play");
    },
    pause: () => {
      setGalleryDicomState({
        ...galleryDicomState,
        inPlay: !inPlay,
      });

      handleOpenImage("pause");
    },
    first: () => {
      handleOpenImage("first");
    },
    last: () => {
      handleOpenImage("last");
    },

    zoom: () => {
      toolExecute("Zoom");
    },

    pan: () => {
      toolExecute("Pan");
    },

    wwwc: () => {
      toolExecute("Wwwc");
    },
    invert: () => {
      toolExecute("Invert");
    },

    magnify: () => {
      toolExecute("Magnify");
    },
    rotate: () => {
      toolExecute("Rotate");
    },
    stackScroll: () => {
      toolExecute("StackScroll");
    },
    reset: () => {
      toolExecute("Reset");
    },

    dicomHeader: () => {
      toolExecute("DicomHeader");
    },
  };

  return (
    <GalleryWrapper
      total={dcmArray.length || 0}
      handleOnToolbarAction={(action: string) => {
        (handleGalleryActions as any)[action].call();
      }}
      listOpenFilesScrolling={inPlay}
    >
      <Button className="close-btn" variant="link" icon={<CloseIcon />} />
      <React.Suspense fallback={<FallBackComponent />}>
        <DcmImageSeries
          setPlayer={setPlayer}
          inPlay={inPlay}
          runTool={(ref: any) => {
            return (runTool = ref.runTool);
          }}
          imageArray={dcmArray}
          handleToolbarAction={(action: string) => {
            (handleGalleryActions as any)[action].call();
          }}
        />
      </React.Suspense>
    </GalleryWrapper>
  );
};

/**
 * Only dicom files can be viewed through the gallery.
 *
 * @param feedFiles
 * @returns files
 */

const getUrlArray = (feedFiles: FeedFile[]) => {
  const dcmFiles = feedFiles.filter((item: FeedFile) => {
    return GalleryModel.isValidDcmFile(item.data.fname);
  });

  return dcmFiles;
};

export default GalleryDicomView;

const FallBackComponent = () => {
  return (
    <Backdrop>
      <Bullseye>
        <Spinner />
      </Bullseye>
    </Backdrop>
  );
};
