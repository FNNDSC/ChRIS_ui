import React from "react";
import { Button, Label, Text, Skeleton } from "@patternfly/react-core";
import { ErrorBoundary } from "react-error-boundary";
import { FeedFile } from "@fnndsc/chrisapi";
import { ExpandIcon, FilmIcon, InfoCircleIcon } from "@patternfly/react-icons";
import { getFileExtension } from "../../api/models/file-explorer.model";
import { IFileBlob } from "../../api/models/file-viewer.model";

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
    fileType: "",
    file: undefined,
  };
}

const FileDetailView = (props: AllProps) => {
  const [fileState, setFileState] = React.useState<IFileBlob>(getInitialState);
  const { selectedFile, fullScreenMode, toggleFileBrowser } = props;

  const fetchData = React.useCallback(async () => {
    const fileName = selectedFile.data.fname,
      fileType = getFileExtension(fileName);
    const fileBlob = await selectedFile.getFileBlob();
  }, [selectedFile]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <div>{renderHeaderPanel(fullScreenMode, toggleFileBrowser)}</div>;
};

export default FileDetailView;

const renderHeaderPanel = (
  fullScreenMode: boolean | undefined,
  toggleFileBrowser: () => void
) => {
  return (
    <div className="header-panel__buttons">
      {fullScreenMode === true && (
        <Button
          variant="link"
          onClick={() => {
            toggleFileBrowser();
          }}
          icon={<ExpandIcon />}
        >
          Maximize
        </Button>
      )}
    </div>
  );
};
