import React from "react";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import { Tree } from "antd";
import { GridItem, Grid } from "@patternfly/react-core";
import { Key } from "../../../store/explorer/types";
import FileDetailView from "../../feed/Preview/FileDetailView";
import GalleryDicomView from "../../dicomViewer/GalleryDicomView";
import {
  setSelectedFile,
  toggleViewerMode,
} from "../../../store/explorer/actions";

const FileBrowserViewer = () => {
  const { explorer, selectedFile, viewerMode } = useTypedSelector(
    (state) => state.explorer
  );
  const dispatch = useDispatch();

  const onSelect = (selectedKeys: Key[], info: any) => {
    dispatch(setSelectedFile(info.node));
  };
  const selectedKeys = selectedFile ? [selectedFile.key] : [];

  const handleToggleViewer = () => {
    dispatch(toggleViewerMode(!viewerMode));
  };

  return (
    <div className="pf-u-px-lg">
      {!viewerMode ? (
        <Grid>
          <GridItem className="pf-u-p-sm" sm={12} md={4}>
            <Tree
              defaultExpandedKeys={selectedKeys}
              selectedKeys={selectedKeys}
              treeData={explorer}
              onSelect={onSelect}
              showLine
            />
          </GridItem>
          <GridItem className="pf-u-py-sm pf-u-px-xl" sm={12} md={8}>
            {selectedFile && selectedFile.file && (
              <FileDetailView
                selectedFile={selectedFile.file}
                toggleFileViewer={handleToggleViewer}
              />
            )}
          </GridItem>
        </Grid>
      ) : (
        <div className="viewer-data">
          <GalleryDicomView />
        </div>
      )}
    </div>
  );
};

export default FileBrowserViewer;
