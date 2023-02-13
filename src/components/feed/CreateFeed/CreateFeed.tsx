import React, { useContext } from "react";
import {
  Button,
  Wizard,
  WizardFooter,
  WizardContextConsumer,
} from "@patternfly/react-core";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Feed } from "@fnndsc/chrisapi";
import { CreateFeedContext, PipelineContext } from "./context";
import { Types, CreateFeedReduxProp, LocalFile } from "./types/feed";
import BasicInformation from "./BasicInformation";
import ChooseConfig from "./ChooseConfig";
import Review from "./Review";
import PipelineContainer from "./PipelineContainer";
import FinishedStep from "./FinishedStep";
import withSelectionAlert from "./SelectionAlert";
import { addFeed } from "../../../store/feed/actions";
import { createFeed } from "./utils/createFeed";
import { MainRouterContext } from "../../../routes";
import { ApplicationState } from "../../../store/root/applicationState";
import { InputIndex } from "../AddNode/types";
import "./createfeed.scss";
import { PipelineTypes } from "./types/pipeline";
import { useSelector } from "react-redux";

export const _CreateFeed: React.FC<CreateFeedReduxProp> = ({
  user,
  addFeed,
}: CreateFeedReduxProp) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { state: pipelineState, dispatch: pipelineDispatch } =
    useContext(PipelineContext);
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
  const { parameters: params } = useSelector((state: ApplicationState) => state.plugin)
  const { pipelineData, selectedPipeline } = pipelineState;
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

  const RequiredParamsNotEmpty = () => {
    if (params && params.length > 0) {
      for (const param of params) {
        const paramObject = requiredInput[param.data.id]
        if (paramObject && param.data.optional == false) {
          if (paramObject.value.length == 0) return false
        } else if (!paramObject && param.data.optional == true) {
          return true
        } else {
          return false
        }
      }
    }
    return true;
  }

  const allRequiredFieldsNotEmpty:boolean = selectedConfig.includes("fs_plugin")? selectedPlugin !== undefined && RequiredParamsNotEmpty():  true;


  const deleteInput = (index: string) => {
    dispatch({
      type: Types.DeleteInput,
      payload: {
        input: index,
      },
    });
  };

  const handleDispatch = React.useCallback(
    (files: LocalFile[]) => {
        const seen = new Set()
        const withDuplicateFiles =  [...state.data.localFiles, ...files ]
        const result =  withDuplicateFiles.filter(el => {
         const duplicate = seen.has(el.name);
         seen.add(el.name);
         return !duplicate;
       });
       dispatch({
         type: Types.AddLocalFile,
         payload: {
           files:result,
         },
       });

      if(!selectedConfig.includes("local_select")){
        const nonDuplicateConfig = new Set([...selectedConfig, "local_select"])
        dispatch({
       type: Types.SelectedConfig,
        payload:{
        selectedConfig: nonDuplicateConfig
       }
       })
      }
    },
    [dispatch, selectedConfig, state.data.localFiles]
  );
  const handleChoseFilesClick = React.useCallback(
    (files: any[]) => {
      const filesConvert = Array.from(files).map((file) => {
        return {
          name: file.name,
          blob: file,
        };
      });
      handleDispatch(filesConvert);
    },
    [handleDispatch]
  );

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

  const getCreationStatus = (status: string, value: number) => {
    dispatch({
      type: Types.SetProgress,
      payload: {
        feedProgress: status,
        value,
      },
    });
  };
  const getCreationError = (error: any) => {
    dispatch({
      type: Types.SetError,
      payload: {
        feedError: error.response.data,
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
        selectedConfig,
        selectedPipeline
      );

      if (!feed) {
        throw new Error("New analysis is undefined. Giving up.");
      }

      // Set analysis name
      await feed.put({
        name: state.data.feedName,
      });

      // Set analysis tags
      for (const tag of state.data.tags) {
        feed.tagFeed(tag.data.id);
      }

      // Set analysis description
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
          value: 100,
        },
      });
    }
  };

  const basicInformation = <BasicInformation />;
  let pluginName = selectedPlugin?.data.title
    ? selectedPlugin?.data.title
    : selectedPlugin?.data.name;
  const pluginVersion = (pluginName += `${selectedPlugin?.data.version}`);
  const chooseConfig = <ChooseConfig user={user} handleFileUpload={handleChoseFilesClick} defaultValueDisplay={false}
    renderComputeEnv={true}
    inputChange={inputChange}
    deleteInput={deleteInput}
    allRequiredFieldsNotEmpty={allRequiredFieldsNotEmpty}
    pluginName={pluginVersion}
    dropdownInput={dropdownInput}
    requiredInput={requiredInput}
    selectedComputeEnv={computeEnvironment}
    setComputeEnviroment={setComputeEnvironment} />;

  const pipelines = <PipelineContainer />;
  const review = <Review handleSave={handleSave} />;

  const finishedStep = <FinishedStep />;

  const steps =  [
      {
        id: 1,
        name: "Basic Information",
        component: withSelectionAlert(basicInformation),
        enableNext: !!data.feedName,
        canJumpTo: step > 1,
      },
      {
        id: 2,
        name: "Analysis Data Selection",
        component: withSelectionAlert(chooseConfig),
        enableNext: allRequiredFieldsNotEmpty,
        canJumpTo: step > 2,
      },
      {
        id: 3,
        name: "Pipelines",
        component: pipelines,
        canJumpTo: step > 3,
      },
      {
        id: 4,
        name: "Review",
        component: review,
        enableNext: enableSave,
        nextButtonText: "Create Analysis",
        canJumpTo: step > 4,
      },
      {
        id: 5,
        name: "Finish",
        component: finishedStep,
        canJumpTo: step > 5,
      },
    ]

  const handleNext = (activeStep: any, cb: () => void) => {
    if (activeStep.id === 4) {
      handleSave();
    }
    cb();
  };

  const CustomFooter = (
    <WizardFooter>
      <WizardContextConsumer>
        {({
          activeStep,
          onNext,
          onBack,
        }: {
          activeStep: any;
          onNext: any;
          onBack: any;
        }) => {
          if (activeStep.name !== "Finish") {
            return (
              <>
                <Button
                  style={{ margin: "0.5em", padding: "0.5em 2em" }}
                  variant="primary"
                  type="submit"
                  onClick={() => handleNext(activeStep, onNext)}
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
    <div className="create-analysis">
      <Button
        className="create-analysis-button"
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
          width="95%"
          isOpen={wizardOpen}
          onClose={() => {
            // clear global analysis base data, so wizard will be blank on next open
            routerContext.actions.clearFeedData();
            if (wizardOpen)
              dispatch({
                type: Types.ResetState,
              });

            pipelineDispatch({
              type: PipelineTypes.ResetState,
            });

            dispatch({
              type: Types.ToggleWizzard,
            });
          }}
          title="Create a New Analysis"
          description="This wizard allows you to create a new Analysis and choose some data to process"
          className={`analysis-create-wizard ${getStepName()}-wrap`}
          steps={steps}
          startAtStep={step}
          footer={CustomFooter}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  user: state.user,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  addFeed: (feed: Feed) => dispatch(addFeed(feed)),
});

export const CreateFeed = React.memo(
  connect(mapStateToProps, mapDispatchToProps)(_CreateFeed)
);
