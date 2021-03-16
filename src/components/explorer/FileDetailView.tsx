import React, { Fragment } from "react";
import { Button, Label, Text, Skeleton } from "@patternfly/react-core";
import { ErrorBoundary } from "react-error-boundary";
import { FeedFile } from "@fnndsc/chrisapi";
import { ExpandIcon, FilmIcon, InfoCircleIcon } from "@patternfly/react-icons";
import { getFileExtension } from "../../api/models/file-explorer.model";
import { IFileBlob, fileViewerMap } from "../../api/models/file-viewer.model";
const ViewerDisplay = React.lazy(() => import("./displays/ViewerDisplay"));

interface AllProps {
  selectedFile: FeedFile;
  fullScreenMode?: boolean;
  toggleFileBrowser: () => void;
  toggleFileViewer: () => void;
  isDicom?: boolean;
}

function getInitialState() {
  return {
    blob: undefined,
    file: undefined,
    fileType: "",
  };
}

const FileDetailView = (props: AllProps) => {
  const [fileState, setFileState] = React.useState<IFileBlob>(getInitialState);
  const {
    selectedFile,
    fullScreenMode,
    toggleFileBrowser,
    toggleFileViewer,
  } = props;
  const { blob, fileType } = fileState;

  const fetchData = React.useCallback(async () => {
    const fileName = selectedFile.data.fname,
      fileType = getFileExtension(fileName);
    const blob = await selectedFile.getFileBlob();

    setFileState((fileState) => {
      return {
        ...fileState,
        blob,
        file: selectedFile,
        fileType,
      };
    });
  }, [selectedFile]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  let viewerName = "";
  const fileSize = 1000000;

  if (blob && blob.size > fileSize) {
    viewerName = "CatchAllDisplay";
  } else if (!fileViewerMap[fileType]) {
    viewerName = "IframeDisplay";
  } else {
    viewerName = fileViewerMap[fileType];
  }

  return (
    <Fragment>
      {renderHeaderPanel(
        fullScreenMode,
        toggleFileBrowser,
        toggleFileViewer,
        fileType
      )}
      <React.Suspense
        fallback={
          <Skeleton
            shape="square"
            width="50%"
            screenreaderText="Please wait as the preview is being fetched"
          />
        }
      >
        <ErrorBoundary
          fallback={
            <span>
              <Label icon={<InfoCircleIcon />} color="red" href="#filled">
                <Text component="p">
                  Oh snap ! Looks like there was an error. Please refresh the
                  browser or try again.
                </Text>
              </Label>
            </span>
          }
        >
          <div className="preview">
            <ViewerDisplay viewerName={viewerName} fileItem={fileState} />
          </div>
        </ErrorBoundary>
      </React.Suspense>
    </Fragment>
  );
};

export default FileDetailView;

const renderHeaderPanel = (
  fullScreenMode: boolean | undefined,
  toggleFileBrowser: () => void,
  toggleFileViewer: () => void,
  fileType: string
) => {
  return (
    <div className="header-panel__buttons">
      {fullScreenMode === true && (
        <Button
          variant="link"
          onClick={toggleFileBrowser}
          icon={<ExpandIcon />}
        >
          Maximize
        </Button>
      )}
      {(fileType === "dcm" ||
        fileType === "png" ||
        fileType === "jpg" ||
        fileType === "jpeg") && (
        <Button variant="link" onClick={toggleFileViewer} icon={<FilmIcon />}>
          Open Image Viewer
        </Button>
      )}
    </div>
  );
};
