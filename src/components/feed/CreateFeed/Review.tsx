import React, { useContext } from "react";
import { CreateFeedContext } from "./context";

import {
  FolderCloseIcon,
  FileIcon,
  WarningTriangleIcon,
} from "@patternfly/react-icons";
import { Split, SplitItem, Grid, GridItem } from "@patternfly/react-core";
import { unpackParametersIntoString } from "../AddNode/lib/utils";

function generateFileList(files: any[], local: boolean) {
  return files.map((file) => {
    let icon =
      file.children && file.children.length > 0 ? ( // file is a ChrisFile folder
        <FolderCloseIcon />
      ) : (
        <FileIcon />
      );
    let name = local === true ? file.name : file.title;
    return (
      <div className="file-preview" key={name}>
        {icon}
        <span className="file-name">{name}</span>
      </div>
    );
  });
}

const Review: React.FunctionComponent = () => {
  const { state } = useContext(CreateFeedContext);

  const {
    feedName,
    feedDescription,
    tags,
    chrisFiles,
    localFiles,
  } = state.data;
  const {
    dropdownInput,
    requiredInput,
    selectedConfig,
    selectedPlugin,
  } = state;

  // the installed version of @patternfly/react-core doesn't support read-only chips
  const tagList = tags.map((tag) => (
    <div className="pf-c-chip pf-m-read-only tag" key={tag.data.id}>
      <span className="pf-c-chip__text">{tag.data.name}</span>
    </div>
  ));

  const showFileWarning = !(chrisFiles.length > 0 || localFiles.length > 0);
  const moreThanOneDirWarning = chrisFiles.length > 1 ? true : false;
  const chrisFileSelectOrLocalFileUpload =
    chrisFiles.length > 0 && localFiles.length > 0;

  const getReviewDetails = () => {
    if (selectedConfig === "fs_plugin") {
      let generatedCommand = "";
      if (requiredInput) {
        generatedCommand += unpackParametersIntoString(requiredInput);
      }

      if (dropdownInput) {
        generatedCommand += unpackParametersIntoString(dropdownInput);
      }

      return (
        <Grid gutter="sm">
          <GridItem span={2}>Type of node:</GridItem>
          <GridItem span={10}>FS Plugin</GridItem>
          <GridItem span={2}>Selected plugin:</GridItem>
          <GridItem span={10} style={{ fontWeight: 700 }}>
            {selectedPlugin && selectedPlugin.data.name}
          </GridItem>
          <GridItem span={2}>Plugin configuration:</GridItem>
          <GridItem span={10}>
            <span className="required-text">{generatedCommand}</span>
          </GridItem>
        </Grid>
      );
    }
    if (selectedConfig === "file_select") {
      return (
        <>
          <Split>
            <SplitItem isFilled className="file-list">
              <p>ChRIS files to add to new feed:</p>
              {generateFileList(chrisFiles, false)}
            </SplitItem>
            <SplitItem isFilled className="file-list">
              <p>Local files to add to new feed:</p>
              {generateFileList(localFiles, true)}
            </SplitItem>
          </Split>

          {showFileWarning && (
            <div className="file-warning">
              <WarningTriangleIcon />
              Please select at least one file.
            </div>
          )}
          {moreThanOneDirWarning && (
            <div className="file-warning">
              <WarningTriangleIcon />
              Please provide a single directory as input to Dircopy
            </div>
          )}
          {chrisFileSelectOrLocalFileUpload && (
            <div className="file-warning">
              <WarningTriangleIcon />
              Please using either the file-browser or the local file upload.
            </div>
          )}
        </>
      );
    }
  };

  return (
    <div className="review">
      <h1 className="pf-c-title pf-m-2xl">Review</h1>
      <p>
        Review the information below and click 'Finish' to create your new feed.
      </p>
      <p>Use the 'Back' button to make changes.</p>
      <br />
      <br />

      <Grid gutter="sm">
        <GridItem span={2}>Feed Name</GridItem>
        <GridItem span={10}>{feedName}</GridItem>
        <GridItem span={2}>Feed Description</GridItem>
        <GridItem span={10}>{feedDescription}</GridItem>
        <GridItem span={2}>Tags</GridItem>
        <GridItem span={10}>{tagList}</GridItem>
      </Grid>
      <br />
      {getReviewDetails()}

      <br />
    </div>
  );
};

export default Review;
