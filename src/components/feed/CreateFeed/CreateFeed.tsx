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
import { InputIndex } from "../AddNode/types";
import "./createfeed.scss";
import { Dispatch } from "redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { connect } from "react-redux";
import { addFeed } from "../../../store/feed/actions";
import { createFeed, getName } from "./utils/createFeed";
import { Feed } from "@fnndsc/chrisapi";
import FinishedStep from "./FinishedStep";
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
        getCreationStatus,
        getCreationError
      );

      if (!feed) {
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
  const review = <Review />;
  const finishedStep = <FinishedStep createFeed={handleSave} />;

  const getFeedSynthesisStep = () => {
    if (selectedConfig === "fs_plugin")
      return [
        {
          id: 3,
          name: "Select an FS Plugin",
          component: packs,
          enableNext: selectedPlugin !== undefined,
          canJumpTo: step > 3,
        },
        {
          id: 4,
          name: "Parameter Configuration",
          component: guidedConfig,
          canJumpTo: step > 4,
        },
      ];
    else if (selectedConfig === "multiple_select") {
      return [
        {
          id: 3,
          name: "ChRIS File Select",
          component: chrisFileSelect,
          canJumpTo: step > 3,
        },
        {
          id: 4,
          name: "Local File Upload",
          component: localFileUpload,
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

  const steps = [
    {
      id: 1,
      name: "Basic Information",
      component: basicInformation,
      enableNext: !!data.feedName,
      canJumpTo: step > 1,
    },
    {
      id: 2,
      name: "Feed Type Selection",
      component: chooseConfig,
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
      name: "Review",
      component: review,
      enableNext: enableSave,
      nextButtonText: "Save",
      canJumpTo: step > 5,
    },
    {
      id: 6,
      name: "Finish",
      component: finishedStep,
      canJumpTo: step > 6,
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
                  variant="primary"
                  type="submit"
                  onClick={onNext}
                  isDisabled={activeStep.enableNext === false ? true : false}
                >
                  Next
                </Button>
                {activeStep.name !== "Basic Information" && (
                  <Button
                    variant="secondary"
                    onClick={onBack}
                    className={
                      activeStep.name === "Step 1" ? "pf-m-disabled" : ""
                    }
                  >
                    Back
                  </Button>
                )}

                <Button
                  variant="link"
                  onClick={() => {
                    if (wizardOpen === true) {
                      dispatch({
                        type: Types.ResetState,
                      });
                    }
                    dispatch({
                      type: Types.ToggleWizzard,
                    });
                  }}
                >
                  Cancel
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
        onClick={() => {
          dispatch({
            type: Types.ToggleWizzard,
          });
        }}
      >
        Create New Feed
      </Button>
      {wizardOpen && (
        <Wizard
          isOpen={wizardOpen}
          onClose={() => {
            if (wizardOpen === true) {
              dispatch({
                type: Types.ResetState,
              });
              // clear global feed base data, so wizard will be blank on next open
              routerContext.actions.clearFeedData();
            }
            dispatch({
              type: Types.ToggleWizzard,
            });
          }}
          title="Create a New Feed"
          description="This wizard allows you to create a new Feed
          and add an internal dataset to it"
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
