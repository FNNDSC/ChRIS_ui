import React, { useContext } from "react";
import { CreateFeedContext } from "./context";
import { Split, SplitItem, Grid, GridItem } from "@patternfly/react-core";
import { unpackParametersIntoString } from "../AddNode/lib/utils";
import { LocalFile } from "./types";
import { LocalFileList, FileList } from "./helperComponents";
import "./createfeed.scss";



 function generateLocalFileList(localFiles: LocalFile[]) {
   return localFiles.map((file: LocalFile, index: number) => {
     return (
       <React.Fragment key={index}>
         <LocalFileList file={file} index={index} />
       </React.Fragment>
     );
   });
 }

 function generateChrisFileList(chrisFiles: string[]) {
   return chrisFiles.map((file: string, index: number) => {
     return (
       <React.Fragment key={index}>
         <FileList file={file} index={index} />
       </React.Fragment>
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
        <Grid hasGutter={true}>
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
    } else if (selectedConfig === "multiple_select") {
      return (
        <>
          <Split>
            <SplitItem isFilled className="file-list">
              <p>Existing Files to add to new feed:</p>
              {generateChrisFileList(chrisFiles)}
            </SplitItem>
            <SplitItem isFilled className="file-list">
              <p>Local files to add to new feed:</p>
              {generateLocalFileList(localFiles)}
            </SplitItem>
          </Split>
        </>
      );
    } else if (selectedConfig === "swift_storage") {
      return (
        <Split>
          <SplitItem isFilled className="file-list">
            <p>Existing Files to add to new feed:</p>
            {generateChrisFileList(chrisFiles)}
          </SplitItem>
        </Split>
      );
    } else if (selectedConfig === "local_select") {
      return (
        <Split>
          <SplitItem isFilled className="file-list">
            <p>Local Files to add to new feed:</p>
            {generateLocalFileList(localFiles)}
          </SplitItem>
        </Split>
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

      <Grid hasGutter={true}>
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
