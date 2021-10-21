import React, { useContext } from "react";
import {
  Button,
  Wizard,
  WizardFooter,
  WizardContextConsumer,
} from "@patternfly/react-core";
import { CreateFeedContext } from "./context";
import { Types, CreateFeedReduxProp } from "./types";
import BasicInformation from "./BasicInformation";
import ChrisFileSelect from "./ChrisFileSelect";
import LocalFileUpload from "./LocalFileUpload";
import ChooseConfig from "./ChooseConfig";
import DataPacks from "./DataPacks";
import GuidedConfig from "../AddNode/GuidedConfig";
import Review from "./Review";
import Pipelines from "./Pipelines";
import FinishedStep from "./FinishedStep";
import withSelectionAlert from "./SelectionAlert";
import { InputIndex } from "../AddNode/types";
import "./createfeed.scss";
import { Dispatch } from "redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { connect } from "react-redux";
import { addFeed } from "../../../store/feed/actions";
import { createFeed, getName } from "./utils/createFeed";
import { Feed } from "@fnndsc/chrisapi";

import { MainRouterContext } from "../../../routes";

export const _CreateFeed: React.FC<CreateFeedReduxProp> = ({
  user,
  addFeed,
}: CreateFeedReduxProp) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const routerContext = useContext(MainRouterContext);

  const {
    wizardOpen,
    step,
    data,
    selectedConfig,
    selectedPlugin,
    dropdownInput,
    requiredInput,
    computeEnvironment,
    selectedPipeline,
    pipelineData,
  } = state;

  const enableSave =
    data.chrisFiles.length > 0 ||
    data.localFiles.length > 0 ||
    Object.keys(requiredInput).length > 0 ||
    Object.keys(dropdownInput).length > 0 ||
    selectedPlugin !== undefined
      ? true
      : false;

  const getStepName = (): string => {
    const stepNames = [
      "basic-information",
      "choose-config",
      "chris-file-select",
      "local-file-upload",
      "data-packs",
      "guidedConfig",
      "review",
    ];
    return stepNames[step - 1];
  };

  const deleteInput = (index: string) => {
    dispatch({
      type: Types.DeleteInput,
      payload: {
        input: index,
      },
    });
  };

  const setComputeEnvironment = React.useCallback(
    (computeEnvironment: string) => {
      dispatch({
        type: Types.SetComputeEnvironment,
        payload: {
          computeEnvironment,
        },
      });
    },
    [dispatch]
  );

  const inputChange = (
    id: string,
    flag: string,
    value: string,
    type: string,
    placeholder: string,
    required: boolean
  ) => {
    const input: InputIndex = {};
    input["id"] = id;
    input["flag"] = flag;
    input["value"] = value;
    input["type"] = type;
    input["placeholder"] = placeholder;
    if (required === true) {
      dispatch({
        type: Types.RequiredInput,
        payload: {
          id,
          input,
        },
      });
    } else {
      dispatch({
        type: Types.DropdownInput,
        payload: {
          id,
          input,
        },
      });
    }
  };

  const getCreationStatus = (status: string) => {
    dispatch({
      type: Types.SetProgress,
      payload: {
        feedProgress: status,
      },
    });
  };
  const getCreationError = (error: string) => {
    dispatch({
      type: Types.SetError,
      payload: {
        feedError: error,
      },
    });
  };

  const handleSave = async () => {
    // Set the progress to 'Started'
    const username = user && user.username;
    try {
      const feed = await createFeed(
        state.data,
        dropdownInput,
        requiredInput,
        selectedPlugin,
        username,
        pipelineData,
        getCreationStatus,
        getCreationError,
        selectedPipeline
      );

      if (!feed) {
        console.error(state.feedError);
        throw new Error("New feed is undefined. Giving up.");
      }

      // Set feed name
      await feed.put({
        name: state.data.feedName,
      });

      // Set feed tags
      for (const tag of state.data.tags) {
        feed.tagFeed(tag.data.id);
      }

      // Set feed description
      const note = await feed.getNote();
      await note.put({
        title: "Description",
        content: state.data.feedDescription,
      });

      addFeed && addFeed(feed);
    } catch (error) {
      throw new Error(`${error}`);
    } finally {
      routerContext.actions.clearFeedData();
      dispatch({
        type: Types.SetProgress,
        payload: {
          feedProgress: "Configuration Complete",
        },
      });
    }
  };

  const basicInformation = <BasicInformation />;
  const chooseConfig = <ChooseConfig />;
  const chrisFileSelect = user && user.username && (
    <ChrisFileSelect username={user.username} />
  );
  const localFileUpload = <LocalFileUpload />;
  const packs = <DataPacks />;
  const guidedConfig = (
    <GuidedConfig
      inputChange={inputChange}
      deleteInput={deleteInput}
      plugin={selectedPlugin}
      dropdownInput={dropdownInput}
      requiredInput={requiredInput}
      selectedComputeEnv={computeEnvironment}
      setComputeEnviroment={setComputeEnvironment}
    />
  );
  const pipelines = <Pipelines />;
  const review = <Review />;

  const finishedStep = <FinishedStep createFeed={handleSave} />;

  const getFeedSynthesisStep = () => {
    if (selectedConfig === "fs_plugin")
      return [
        {
          id: 3,
          name: "Select an FS Plugin",
          component: withSelectionAlert(packs, false),
          enableNext: selectedPlugin !== undefined,
          canJumpTo: step > 3,
        },
        {
          id: 4,
          name: "Parameter Configuration",
          component: withSelectionAlert(guidedConfig),
          canJumpTo: step > 4,
        },
      ];
    else if (selectedConfig === "multiple_select") {
      return [
        {
          id: 3,
          name: "ChRIS File Select",
          component: withSelectionAlert(chrisFileSelect),
          canJumpTo: step > 3,
        },
        {
          id: 4,
          name: "Local File Upload",
          component: withSelectionAlert(localFileUpload),
          canJumpTo: step > 4,
        },
      ];
    } else if (selectedConfig === "swift_storage") {
      return [
        {
          id: 3,
          name: "ChRIS File Select",
          component: chrisFileSelect,
          canJumpTo: step > 3,
        },
      ];
    } else if (selectedConfig === "local_select") {
      return [
        {
          id: 3,
          name: "Local File Upload",
          component: localFileUpload,
          canJumpTo: step > 3,
        },
      ];
    }
  };

  const steps = data.isDataSelected
    ? [
        {
          id: 1,
          name: "Basic Information",
          component: withSelectionAlert(basicInformation),
          enableNext: !!data.feedName,
          canJumpTo: step > 1,
        },
        {
          id: 2,
          name: "Feed Type Selection",
          component: withSelectionAlert(chooseConfig),
          enableNext: selectedConfig.length > 0,
          canJumpTo: step > 2,
        },
        {
          id: 5,
          name: "Pipelines",
          component: pipelines,
          canJumpTp: step > 5,
        },
        {
          id: 6,
          name: "Review",
          component: review,
          enableNext: enableSave,
          nextButtonText: "Create Feed",
          canJumpTo: step > 6,
        },
        {
          id: 7,
          name: "Finish",
          component: finishedStep,
          canJumpTo: step > 7,
        },
      ]
    : [
        {
          id: 1,
          name: "Basic Information",
          component: withSelectionAlert(basicInformation),
          enableNext: !!data.feedName,
          canJumpTo: step > 1,
        },
        {
          id: 2,
          name: "Feed Type Selection",
          component: withSelectionAlert(chooseConfig),
          enableNext: selectedConfig.length > 0,
          canJumpTo: step > 2,
        },
        {
          name: getName(selectedConfig),
          steps: getFeedSynthesisStep(),
          canJumpTo: step > 3,
        },
        {
          id: 5,
          name: "Pipelines",
          enableNext: true,
          component: pipelines,
          nextButtonText: "Review",
          canJumpTo: step > 5,
        },
        {
          id: 6,
          name: "Review",
          component: withSelectionAlert(review, false),
          enableNext: enableSave,
          nextButtonText: "Create Feed",
          canJumpTo: step > 6,
        },
        {
          id: 7,
          name: "Finish",
          component: withSelectionAlert(finishedStep, false),
          canJumpTo: step > 7,
        },
      ];

  const CustomFooter = (
    <WizardFooter>
      <WizardContextConsumer>
        {({ activeStep, onNext, onBack }) => {
          if (activeStep.name !== "Finish") {
            return (
              <>
                <Button
                  style={{ margin: "0.5em", padding: "0.5em 2em" }}
                  variant="primary"
                  type="submit"
                  onClick={onNext}
                  isDisabled={activeStep.enableNext === false ? true : false}
                >
                  {activeStep.nextButtonText
                    ? activeStep.nextButtonText
                    : "Next"}
                </Button>
                <Button
                  style={{ margin: "0.5em", padding: "0.5em 2em" }}
                  variant="secondary"
                  isDisabled={activeStep.id === 1}
                  onClick={onBack}
                >
                  Back
                </Button>
              </>
            );
          }
        }}
      </WizardContextConsumer>
    </WizardFooter>
  );

  return (
    <>
      <Button
        className="create-feed-button"
        variant="primary"
        isLarge
        onClick={() => {
          dispatch({
            type: Types.ToggleWizzard,
          });
        }}
      >
        Create New Analysis
      </Button>
      {wizardOpen && (
        <Wizard
          isOpen={wizardOpen}
          onClose={() => {
            // clear global feed base data, so wizard will be blank on next open
            routerContext.actions.clearFeedData();
            if (wizardOpen)
              dispatch({
                type: Types.ResetState,
              });
            dispatch({
              type: Types.ToggleWizzard,
            });
          }}
          title="Create a New Analysis"
          description="This wizard allows you to create a new Feed and add an internal dataset to it"
          className={`feed-create-wizard ${getStepName()}-wrap`}
          steps={steps}
          startAtStep={step}
          footer={CustomFooter}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  user: state.user,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  addFeed: (feed: Feed) => dispatch(addFeed(feed)),
});

export const CreateFeed = connect(
  mapStateToProps,
  mapDispatchToProps
)(_CreateFeed);
