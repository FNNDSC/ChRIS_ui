import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Label, Text } from "@patternfly/react-core";
import { SpinContainer } from "../Common";
import type { FileBrowserFolderFile, PACSFile } from "@fnndsc/chrisapi";
import { getFileExtension, fileViewerMap } from "../../api/model";
import ViewerDisplay from "./displays/ViewerDisplay";

interface AllProps {
  selectedFile?: FileBrowserFolderFile | PACSFile;
  preview: "large" | "small";
  handleNext?: () => void;
  handlePrevious?: () => void;
}

export default function FileDetailView(props: AllProps) {
  const { selectedFile, preview } = props;
  let viewerName = "";
  if (selectedFile) {
    const fileType = getFileExtension(selectedFile.data?.fname);
    if (fileType && fileViewerMap[fileType]) {
      viewerName = fileViewerMap[fileType];
    } else {
      viewerName = "CatchallDisplay";
    }
  }

  const errorComponent = (err?: string) => (
    <Label color="red">
      <Text>{err ?? "Error. Refresh or try again."}</Text>
    </Label>
  );

  return (
    <React.Suspense fallback={<SpinContainer title="Loading..." />}>
      <ErrorBoundary fallback={errorComponent()}>
        {selectedFile && (
          <ViewerDisplay
            preview={preview}
            viewerName={viewerName}
            selectedFile={selectedFile}
          />
        )}
      </ErrorBoundary>
    </React.Suspense>
  );
}
