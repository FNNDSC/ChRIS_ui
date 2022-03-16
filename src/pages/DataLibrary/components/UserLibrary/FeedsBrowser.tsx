import React from "react";
import BreadcrumbContainer from "./BreadcrumbContainer";
import { Browser } from "./Browser";
import SpinAlert from "./Spin";
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
    loading,
    handleDelete,
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
        previewAll={previewAll}
      />

      {loading ? (
        <SpinAlert browserType="feeds" />
      ) : (
        <Browser
          initialPath={initialPath}
          files={files}
          folders={folders}
          handleFolderClick={handleFolderClick}
          paginated={paginated}
          handlePagination={handlePagination}
          resetPaginated={resetPaginated}
          previewAll={previewAll}
          handleDelete={handleDelete}
        />
      )}
    </React.Fragment>
  );
};

export default FeedsBrowser;
