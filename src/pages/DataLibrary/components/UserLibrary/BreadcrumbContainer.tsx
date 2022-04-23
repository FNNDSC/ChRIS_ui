import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
  Button,
} from "@patternfly/react-core";
import { FaFolderOpen } from "react-icons/fa";
import { Link } from "react-router-dom";

const BreadcrumbContainer = ({
  initialPath,
  files,
  folderDetails,
  browserType,
  togglePreview,
  previewAll,
}: {
  initialPath: string;
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
          const link =
            index !== 0 || browserType !== "uploads"
              ? "/library/" +
                initialPathSplit.slice(0, index + 1).join("/") +
                "?type=" +
                browserType
              : "";
          return (
            <BreadcrumbItem key={path}>
              <Link to={index === 0 ? "/library" : link}>{path}</Link>
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
