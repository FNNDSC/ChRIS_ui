import React, { ReactNode, useCallback, useContext, useEffect } from "react";
import {
  Grid,
  GridItem,
  WizardContext,
  Split,
  SplitItem,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import { CreateFeedContext, PipelineContext } from "./context";
import { unpackParametersIntoString } from "../AddNode/lib/utils";
import { PluginDetails } from "../AddNode/helperComponents/ReviewGrid";
import { ChrisFileDetails, LocalFileDetails } from "./helperComponents";
import { AddNodeContext } from "../AddNode/context";
import { LoadingErrorAlert } from "../../common/errorHandling";

const Review = ({ handleSave }: { handleSave: () => void }) => {
  const { state } = useContext(CreateFeedContext);
  const { state: addNodeState } = useContext(AddNodeContext);
  const { state: pipelineState } = useContext(PipelineContext);
  const { feedName, feedDescription, tags, chrisFiles, localFiles } =
    state.data;
  const { selectedConfig, uploadProgress, feedError, creatingFeedStatus } =
    state;

  const uploadPercent = Math.floor((uploadProgress / localFiles.length) * 100);

  const {
    dropdownInput,
    requiredInput,
    selectedPluginFromMeta,
    selectedComputeEnv,
  } = addNodeState;

  // the installed version of @patternfly/react-core doesn't support read-only chips
  const tagList = tags.map((tag: any) => (
    <div className="pf-c-chip pf-m-read-only tag" key={tag.data.id}>
      <span className="pf-c-chip__text">{tag.data.name}</span>
    </div>
  ));
  const { onNext, onBack } = useContext(WizardContext);

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.code == "Enter" || e.code == "ArrowRight") {
        e.preventDefault();
        handleSave();
        onNext();
      } else if (e.code == "ArrowLeft") {
        e.preventDefault();
        onBack();
      }
    },
    [onNext, handleSave, onBack]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const getReviewDetails = () => {
    let generatedCommand = "";
    if (requiredInput) {
      generatedCommand += unpackParametersIntoString(requiredInput);
    }

    if (dropdownInput) {
      generatedCommand += unpackParametersIntoString(dropdownInput);
    }
    return (
      <>
        {selectedConfig.includes("fs_plugin") && (
          <Grid hasGutter={true}>
            <PluginDetails
              generatedCommand={generatedCommand}
              selectedPlugin={selectedPluginFromMeta}
              computeEnvironment={selectedComputeEnv}
            />
          </Grid>
        )}
        {selectedConfig.includes("swift_storage") && (
          <div style={{ width: "60%" }}>
            <ChrisFileDetails chrisFiles={chrisFiles} />
          </div>
        )}
        {selectedConfig.includes("local_select") && (
          <>
            <div
              style={{
                height: "250px",
                zIndex: "99999",
                overflowY: "scroll",
                width: "60%",
              }}
            >
              <LocalFileDetails localFiles={localFiles} />
            </div>
            {uploadProgress > 0 && (
              <Split>
                <SplitItem>
                  <div style={{ height: "230px", width: "230px" }}>
                    <p
                      style={{
                        marginBottom: "0",
                      }}
                    >
                      Tracker for Pushing Files to Storage:
                    </p>
                    <ChartDonutUtilization
                      ariaDesc="Storage capacity"
                      ariaTitle="Donut utilization chart example"
                      constrainToVisibleArea
                      data={{ x: "Files Uploaded", y: uploadPercent }}
                      labels={({ datum }) =>
                        datum.x ? `${datum.x}: ${datum.y}%` : null
                      }
                      themeColor={
                        uploadProgress === localFiles.length ? "green" : ""
                      }
                      name="chart1"
                      subTitle={`${localFiles.length}`}
                      title={`${uploadProgress}`}
                    />
                  </div>
                </SplitItem>
              </Split>
            )}
          </>
        )}
      </>
    );
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

      <RenderFlexItem
        title={<span className="review__title">Feed Name:</span>}
        subTitle={<span className="review__value">{feedName}</span>}
      />
      <RenderFlexItem
        title={<span className="review__title">Feed Description:</span>}
        subTitle={
          <span className="review__value">{feedDescription || "N/A"}</span>
        }
      />

      <RenderFlexItem
        title={<span className="review__title">Tags:</span>}
        subTitle={
          <span className="review__value">
            {tagList.length > 0 ? tagList : "N/A"}
          </span>
        }
      />

      <RenderFlexItem
        title={<span className="review__title">Selected Pipeline:</span>}
        subTitle={
          <span className="review__value">
            {pipelineState.pipelineName
              ? pipelineState.pipelineName
              : "None Selected"}
          </span>
        }
      />

      <RenderFlexItem
        title={<span className="review__title">Feed Status:</span>}
        subTitle={
          <span className="review__value">
            {creatingFeedStatus && !feedError ? (
              <span>{creatingFeedStatus}...</span>
            ) : (
              "N/A"
            )}
          </span>
        }
      />

      <RenderFlexItem
        title={<span className="review__title">Feed Error Status:</span>}
        subTitle={
          <span className="review__value">
            {feedError ? <LoadingErrorAlert error={feedError} /> : "N/A"}
          </span>
        }
      />

      {getReviewDetails()}
      <br />
    </div>
  );
};

export default Review;

const RenderFlexItem = ({
  title,
  subTitle,
}: {
  title: ReactNode;
  subTitle: ReactNode;
}) => {
  return (
    <div style={{ width: "25%" }}>
      <Flex flex={{ default: "flex_1" }} style={{ marginBottom: "0.5rem" }}>
        <Flex flex={{ default: "flex_1" }} direction={{ default: "column" }}>
          <FlexItem>{title}</FlexItem>
        </Flex>
        <Flex flex={{ default: "flex_1" }} direction={{ default: "column" }}>
          <FlexItem>{subTitle}</FlexItem>
        </Flex>
      </Flex>
    </div>
  );
};
