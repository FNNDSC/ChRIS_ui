import type React from "react";
import { useCallback, useContext, useEffect } from "react";
import {
  Card,
  CardBody,
  Divider,
  Grid,
  GridItem,
  Split,
  SplitItem,
  Text,
  TextContent,
  TextVariants,
  Title,
  WizardContext,
} from "@patternfly/react-core";
import { ChartDonutUtilization } from "@patternfly/react-charts";
import { AddNodeContext } from "../AddNode/context";
import { unpackParametersIntoString } from "../AddNode/utils";
import { ChrisFileDetails, LocalFileDetails } from "./HelperComponent";
import { CreateFeedContext } from "./context";
import { PipelineContext } from "../PipelinesCopy/context";
import { ErrorAlert, RenderFlexItem } from "../../components/Common";
import { PluginDetails } from "../AddNode/ReviewGrid";
import { ThemeContext } from "../DarkTheme/useTheme";

interface ReviewProps {
  handleSave: () => void;
}

const Review: React.FC<ReviewProps> = ({ handleSave }) => {
  const { state } = useContext(CreateFeedContext);
  const { state: addNodeState } = useContext(AddNodeContext);
  const { state: pipelineState } = useContext(PipelineContext);

  const { feedName, feedDescription, tags, chrisFiles, localFiles } =
    state.data;
  const { selectedConfig, uploadProgress, feedError, creatingFeedStatus } =
    state;

  const {
    dropdownInput,
    requiredInput,
    selectedPluginFromMeta,
    selectedComputeEnv,
  } = addNodeState;
  const { pipelineToAdd } = pipelineState;

  const { goToNextStep: onNext, goToPrevStep: onBack } =
    useContext(WizardContext);
  useContext(ThemeContext);

  // the installed version of @patternfly/react-core doesn't support read-only chips well
  // but we can style them manually or use pf-c-chip
  const tagList = tags.map((tag: any) => (
    <div className="pf-c-chip pf-m-read-only tag" key={tag.data.id}>
      <span className="pf-c-chip__text">{tag.data.name}</span>
    </div>
  ));

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "ArrowRight") {
        e.preventDefault();
        handleSave();
        onNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        onBack();
      }
    },
    [onNext, handleSave, onBack],
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
          <Grid hasGutter className="pf-u-mb-md">
            <GridItem span={12}>
              <PluginDetails
                generatedCommand={generatedCommand}
                selectedPlugin={selectedPluginFromMeta}
                computeEnvironment={selectedComputeEnv}
              />
            </GridItem>
          </Grid>
        )}

        {selectedConfig.includes("swift_storage") && (
          <div className="pf-u-mb-md" style={{ maxWidth: "60%" }}>
            <ChrisFileDetails chrisFiles={chrisFiles} />
          </div>
        )}

        {selectedConfig.includes("local_select") && (
          <>
            <div
              style={{
                height: "250px",
                overflowY: "auto",
                maxWidth: "60%",
              }}
              className="pf-u-mb-md"
            >
              <LocalFileDetails localFiles={localFiles} />
            </div>
            <Split>
              <SplitItem>
                <div style={{ height: "230px", width: "230px" }}>
                  <Text component={TextVariants.p} style={{ marginBottom: 0 }}>
                    Tracker for Pushing Files to Storage:
                  </Text>
                  <ChartDonutUtilization
                    ariaDesc="Storage capacity"
                    ariaTitle="Donut utilization chart example"
                    constrainToVisibleArea
                    data={{ x: "Files Uploaded", y: uploadProgress }}
                    labels={({ datum }) =>
                      datum.x ? `${datum.x}: ${datum.y}%` : null
                    }
                    themeColor={uploadProgress === 100 ? "green" : ""}
                    name="chart1"
                    subTitle="100"
                    title={`${uploadProgress}`}
                  />
                </div>
              </SplitItem>
            </Split>
          </>
        )}
      </>
    );
  };

  return (
    <div className="review pf-u-mt-lg pf-u-mb-lg">
      <Card>
        <CardBody>
          <Title headingLevel="h1" size="xl" className="pf-u-mb-lg">
            Review Your Submission
          </Title>
          <TextContent className="pf-u-mb-md">
            <Text component={TextVariants.p}>
              Check the details below and click <b>Finish</b> to create your new
              feed. If you need to make changes, click <b>Back</b> to revise.
            </Text>
          </TextContent>

          <Divider className="pf-u-mb-lg" />

          {/* FEED NAME & DESCRIPTION */}
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
                {pipelineToAdd ? pipelineToAdd.data.name : "None Selected"}
              </span>
            }
          />

          <RenderFlexItem
            title={<span className="review__title">Feed Status:</span>}
            subTitle={
              <span className="review__value">
                {creatingFeedStatus ? (
                  <>
                    {creatingFeedStatus}
                    {creatingFeedStatus === "Creating Feed" && <span>...</span>}
                  </>
                ) : (
                  "N/A"
                )}
              </span>
            }
          />

          <Divider className="pf-u-mb-md pf-u-mt-md" />

          {/* DYNAMIC REVIEW DETAILS */}
          {getReviewDetails()}

          {Object.keys(feedError).length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <ErrorAlert errors={feedError} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Review;
