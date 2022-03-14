import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
  Button,
} from "@patternfly/react-core";
import { FaFolderOpen } from "react-icons/fa";

const BreadcrumbContainer = ({
  initialPath,
  resetPaginated,
  handleFolderClick,
  files,
  folderDetails,
  browserType,
  togglePreview,
}: {
  initialPath: string;
  resetPaginated: (path: string) => void;
  handleFolderClick: (path: string, breadcrumb?: any) => void;
  files: any[];
  folderDetails: {
    currentFolder: string;
    totalCount: number;
  };
  browserType: string;
  togglePreview: () => void;
}) => {
  const initialPathSplit = initialPath.split("/");
  return (
    <>
      <Breadcrumb>
        {initialPathSplit.map((path: string, index) => {
          return (
            <BreadcrumbItem
              to={index !== 0 || browserType !== "uploads" ? "#" : undefined}
              onClick={() => {
                resetPaginated(path);
                if (index === initialPathSplit.length - 1) {
                  return;
                }
                if (index === 0 && browserType === "uploads") {
                  return;
                }

                if (index === 0 && browserType === "feeds") {
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
        <Split
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <SplitItem>
            <h2>
              <FaFolderOpen
                style={{
                  marginRight: "0.5em",
                }}
              />

              {folderDetails.currentFolder}
            </h2>
            <h3>{folderDetails.totalCount} items</h3>
          </SplitItem>
          <SplitItem>
            <Button
              onClick={() => {
                togglePreview();
              }}
            >
              Preview All
            </Button>
          </SplitItem>
        </Split>
      )}
    </>
  );
};

export default BreadcrumbContainer;
