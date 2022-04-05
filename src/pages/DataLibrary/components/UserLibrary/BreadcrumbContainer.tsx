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

  handleFolderClick,
  files,
  folderDetails,
  browserType,
  togglePreview,
  previewAll,
}: {
  initialPath: string;

  handleFolderClick: (path: string, breadcrumb?: any) => void;
  files: any[];
  folderDetails: {
    currentFolder: string;
    totalCount: number;
  };
  browserType: string;
  togglePreview: () => void;
  previewAll: boolean;
}) => {
  const initialPathSplit = initialPath ? initialPath.split("/") : [];
  return (
    <>
      <Breadcrumb>
        {initialPathSplit.map((path: string, index) => {
          return (
            <BreadcrumbItem
              to={index !== 0 || browserType !== "uploads" ? "#" : undefined}
              onClick={() => {
                if (index === initialPathSplit.length - 1) {
                  return;
                }
                if (index === 0 && browserType === "uploads") {
                  return;
                }

                if (
                  (index === 0 && browserType === "feed") ||
                  (index === 0 && browserType === "services")
                ) {
                  handleFolderClick(`${path}`, {
                    hasNext: false,
                    limit: 50,
                    offset: 0,
                  });
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
      {files && files.length > 0 && (
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
              {previewAll ? "Hide All Previews" : "Preview All"}
            </Button>
          </SplitItem>
        </Split>
      )}
    </>
  );
};

export default BreadcrumbContainer;
