import React from "react";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import { Tree } from "antd";
import {
  GridItem,
  Grid,
  BreadcrumbItem,
  Breadcrumb,
} from "@patternfly/react-core";
import { Key } from "../../../store/explorer/types";
import FileDetailView from "../../feed/Preview/FileDetailView";
import GalleryDicomView from "../../dicomViewer/GalleryDicomView";
import { setSelectedFile } from "../../../store/explorer/actions";

const FileBrowserViewer = () => {
  const { explorer, selectedFile, viewerMode } = useTypedSelector(
    (state) => state.explorer
  );
  const selectedPlugin = useTypedSelector((state) => state.feed.selectedPlugin);
  const dispatch = useDispatch();

  const onSelect = (selectedKeys: Key[], info: any) => {
    dispatch(setSelectedFile(info.node));
  };

  //@ts-ignore
  const splitPath = selectedPlugin?.data.output_path.split("/");
  const breadcrumbItems = splitPath.slice(0, splitPath.length - 1);

  const selectedKeys = selectedFile ? [selectedFile.key] : [];

  return (
    <div className="pf-u-px-lg">
      {!viewerMode ? (
        <Grid>
          <GridItem className="pf-u-p-sm" sm={12} md={4}>
            <Breadcrumb>
              {breadcrumbItems.map((item: string, index: number) => {
                return <BreadcrumbItem key={index}>{item}</BreadcrumbItem>;
              })}
            </Breadcrumb>
            <Tree
              defaultExpandedKeys={selectedKeys}
              selectedKeys={selectedKeys}
              treeData={explorer}
              onSelect={onSelect}
              showLine
            />
          </GridItem>
          <GridItem sm={12} md={8}>
            {selectedFile && selectedFile.file && (
              <FileDetailView
                selectedFile={selectedFile.file}
                preview="large"
              />
            )}
          </GridItem>
        </Grid>
      ) : (
        <GalleryDicomView />
      )}
    </div>
  );
};

export default FileBrowserViewer;
