import React, { Fragment } from "react";
import { Label, Text, Skeleton } from "@patternfly/react-core";
import { ErrorBoundary } from "react-error-boundary";
import { FeedFile } from "@fnndsc/chrisapi";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { getFileExtension } from "../../../api/models/file-explorer.model";
import {
  IFileBlob,
  fileViewerMap,
} from "../../../api/models/file-viewer.model";
import "../../../components/dicomViewer/amiViewer.scss";

const ViewerDisplay = React.lazy(() => import("./displays/ViewerDisplay"));

interface AllProps {
  selectedFile: FeedFile;
  isDicom?: boolean;
  preview: "large" | "small";
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
  const { selectedFile, preview } = props;
  const { fileType } = fileState;

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

  if (!fileViewerMap[fileType]) {
    viewerName = "IframeDisplay";
  } else {
    viewerName = fileViewerMap[fileType];
  }

  return (
    <Fragment>
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
          <div className={preview === "small" ? "small-preview" : "ami-viewer"}>
            <ViewerDisplay viewerName={viewerName} fileItem={fileState} />
          </div>
        </ErrorBoundary>
      </React.Suspense>
    </Fragment>
  );
};

export default FileDetailView;
