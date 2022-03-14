import React from "react";
import BreadcrumbContainer from "./BreadcrumbContainer";
import { Browser } from "./Browser";
import useFetchResources from "./useFetchResources";

const FeedsBrowser = () => {
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
  } = useFetchResources("feed");

  return (
    <React.Fragment>
      <BreadcrumbContainer
        initialPath={initialPath}
        resetPaginated={resetPaginated}
        handleFolderClick={handleFolderClick}
        files={files}
        folderDetails={folderDetails}
        browserType="feeds"
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

export default React.memo(FeedsBrowser);
