import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { FaFolderOpen } from "react-icons/fa";
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
  } = useFetchResources("feed");

  const initialPathSplit = initialPath.split("/");

  return (
    <React.Fragment>
      <Breadcrumb>
        {initialPathSplit.map((path: string, index: number) => {
          return (
            <BreadcrumbItem
              to="#"
              onClick={() => {
                if (index === initialPathSplit.length - 1) {
                  return;
                }
                if (index === 0) {
                  resetPaginated(path);
                  handleFolderClick(`${path}`, {
                    hasNext: false,
                    limit: 50,
                    offset: 0,
                  });
                } else {
                  const newPath = initialPath.split(`/${path}`);
                  resetPaginated(newPath[0]);
                  handleFolderClick(`${newPath[0]}/${path}`, {
                    hasNext: false,
                    limit: 50,
                    offset: 0,
                  });
                }
              }}
              key={path}
            >
              {path}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
      {files.length > 0 && (
        <Split>
          <SplitItem>
            <h2>
              <FaFolderOpen />
              {folderDetails.currentFolder}
            </h2>
            <h3>{folderDetails.totalCount} items</h3>
          </SplitItem>
        </Split>
      )}

      <Browser
        initialPath={initialPath}
        files={files}
        folders={folders}
        handleFolderClick={handleFolderClick}
        paginated={paginated}
        handlePagination={handlePagination}
        resetPaginated={resetPaginated}
      />
    </React.Fragment>
  );
};

export default React.memo(FeedsBrowser);
