import React from "react";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import { Tree } from "antd";
import { GridItem, Grid } from "@patternfly/react-core";
import { Key } from "../../../store/explorer/types";
import FileDetailView from "../../explorer/FileDetailView";
import { setSelectedFile } from "../../../store/explorer/actions";

const FileBrowserViewer = () => {
  const { explorer, selectedFile } = useTypedSelector(
    (state) => state.explorer
  );
  const dispatch = useDispatch();
  const onSelect = (selectedKeys: Key[], info: any) => {
    dispatch(setSelectedFile(info.node));
  };
  const selectedKeys = selectedFile ? [selectedFile.key] : [];

  const toggleViewerMode = () => {
    return;
  };

  return (
    <div className="pf-u-px-lg">
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
              toggleFileBrowser={() => {
                return;
              }}
              toggleFileViewer={toggleViewerMode}
            />
          )}
        </GridItem>
      </Grid>
    </div>
  );
};

export default FileBrowserViewer;
