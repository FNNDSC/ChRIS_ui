import React, { useCallback, useContext, useEffect } from "react";
import { CreateFeedContext } from "./context";
import { Grid, GridItem, WizardContext } from "@patternfly/react-core";
import { unpackParametersIntoString } from "../AddNode/lib/utils";
import "./createfeed.scss";
import { PluginDetails } from "../AddNode/helperComponents/ReviewGrid";
import { ChrisFileDetails, LocalFileDetails } from "./helperComponents";

const Review = ({ handleSave }: { handleSave: () => void }) => {
  const { state } = useContext(CreateFeedContext);
  const { feedName, feedDescription, tags, chrisFiles, localFiles } =
    state.data;
  const {
    dropdownInput,
    requiredInput,
    selectedConfig,
    selectedPlugin,
    computeEnvironment,
  } = state;

  const pipelineName = "";

  // the installed version of @patternfly/react-core doesn't support read-only chips
  const tagList = tags.map((tag: any) => (
    <div className="pf-c-chip pf-m-read-only tag" key={tag.data.id}>
      <span className="pf-c-chip__text">{tag.data.name}</span>
    </div>
  ));
  const { onNext, onBack } = useContext(WizardContext)

  const handleKeyDown = useCallback((e: any) => {
    if (e.code == "Enter" || e.code == "ArrowRight") {
      e.preventDefault()
      handleSave()
      onNext()
    } else if (e.code == "ArrowLeft") {
      e.preventDefault()
      onBack()
    }
  }, [onNext, handleSave, onBack])


  useEffect(() => {

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const getReviewDetails = () => {
    if (selectedConfig.includes("fs_plugin")) {
      let generatedCommand = "";
      if (requiredInput) {
        generatedCommand += unpackParametersIntoString(requiredInput);
      }

      if (dropdownInput) {
        generatedCommand += unpackParametersIntoString(dropdownInput);
      }

      return (
        <Grid hasGutter={true}>
          <PluginDetails
            generatedCommand={generatedCommand}
            selectedPlugin={selectedPlugin}
            computeEnvironment={computeEnvironment}
          />
        </Grid>
      );
    }
    if (selectedConfig.includes("multiple_select")) {
      return (
        <>
          <ChrisFileDetails chrisFiles={chrisFiles} />
          <LocalFileDetails localFiles={localFiles} />
        </>
      );
    }
    if (selectedConfig.includes("swift_storage")) {
      return <ChrisFileDetails chrisFiles={chrisFiles} />;
    }
   if (selectedConfig.includes( "local_select")) {
      return <LocalFileDetails localFiles={localFiles} />;
    }
  };

  return (
    <div className="review">
      <h1 className="pf-c-title pf-m-2xl">Review</h1>
      <p>
        Review the information below and click &apos;Finish&apos; to create your
        new feed.
      </p>
      <p>Use the &apos;Back&apos; button to make changes.</p>
      <br />
      <br />
      <Grid hasGutter={true}>
        <GridItem sm={4} md={2}>
          <span className="review__title">Feed Name</span>
        </GridItem>
        <GridItem sm={8} md={10}>
          <span className="review__value">{feedName}</span>
        </GridItem>
        <GridItem sm={4} md={2}>
          <span className="review__title">Feed Description</span>
        </GridItem>
        <GridItem sm={8} md={10}>
          <span className="review__value">{feedDescription || "N/A"}</span>
        </GridItem>
        <GridItem sm={4} md={2}>
          <span className="review__title">Tags</span>
        </GridItem>
        <GridItem sm={8} md={10}>
          <span className="review__value">{tagList || "N/A"}</span>
        </GridItem>
        <GridItem sm={4} md={2}>
          <span className="review__title">Selected Pipeline</span>
        </GridItem>
        <GridItem sm={8} md={10}>
          <span className="review__value">
            {pipelineName ? pipelineName : "None Selected"}
          </span>
        </GridItem>
      </Grid>
      <br />
      {getReviewDetails()}
      <br />
    </div>
  );
};

export default Review;
