import React from "react";
import { Browser } from "./Browser";
import useFetchResources from "./useFetchResources";
import BreadcrumbContainer from "./BreadcrumbContainer";
import SpinAlert from "./Spin";

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
    loading,
    handleDelete,
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
        previewAll={previewAll}
      />
      {loading ? (
        <SpinAlert browserType="uploads" />
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

export default UploadsBrowser;
