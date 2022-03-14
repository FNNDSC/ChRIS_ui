import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
  Button,
} from "@patternfly/react-core";
import { FaFolderOpen } from "react-icons/fa";
import { Browser } from "./Browser";

import useFetchResources from "./useFetchResources";
import BreadcrumbContainer from "./BreadcrumbContainer";

const UploadsBrowser = () => {
  const {
    initialPath,
    paginated,
    handleFolderClick,
    handlePagination,
    folderDetails,
    files,
    folders,
    resetPaginated,
    previewAll,
    togglePreview,
  } = useFetchResources("uploads");

  return (
    <React.Fragment>
      <BreadcrumbContainer
        initialPath={initialPath}
        resetPaginated={resetPaginated}
        handleFolderClick={handleFolderClick}
        files={files}
        folderDetails={folderDetails}
        browserType="uploads"
        togglePreview={togglePreview}
      />
      <Browser
        initialPath={initialPath}
        files={files}
        folders={folders}
        handleFolderClick={handleFolderClick}
        paginated={paginated}
        handlePagination={handlePagination}
        resetPaginated={resetPaginated}
        previewAll={previewAll}
      />
    </React.Fragment>
  );
};

export default React.memo(UploadsBrowser);
