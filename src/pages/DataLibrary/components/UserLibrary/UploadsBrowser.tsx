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
  } = useFetchResources("uploads");

  const initialPathSplit = initialPath.split("/");

  return (
    <React.Fragment>
      <Breadcrumb>
        {initialPathSplit.map((path: string, index) => {
          return (
            <BreadcrumbItem
              to={index !== 0 ? "#" : undefined}
              onClick={() => {
                resetPaginated(path);
                if (index === initialPathSplit.length - 1) {
                  return;
                }
                if (index === 0) {
                  return;
                } else {
                  const newPath = initialPath.split(`/${path}`);
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

export default React.memo(UploadsBrowser);
