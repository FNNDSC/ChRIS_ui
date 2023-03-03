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
import withSelectionAlert from "./SelectionAlert";
import { addFeed } from "../../../store/feed/actions";
import { createFeed } from "./utils/createFeed";
import { MainRouterContext } from "../../../routes";
import { ApplicationState } from "../../../store/root/applicationState";
import { PipelineTypes } from "./types/pipeline";
import { AddNodeContext } from "../AddNode/context";
import { useTypedSelector } from "../../../store/hooks";
import { notification } from "antd";
import "./createfeed.scss";

export const _CreateFeed: React.FC<CreateFeedReduxProp> = ({
  user,
  addFeed,
}: CreateFeedReduxProp) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { state: pipelineState, dispatch: pipelineDispatch } =
    useContext(PipelineContext);
  const { state: addNodeState } = useContext(AddNodeContext);
  const { pluginMeta, selectedPluginFromMeta } = addNodeState;
  const routerContext = useContext(MainRouterContext);
  const params = useTypedSelector((state) => state.plugin.parameters);
  const { wizardOpen, step, data, selectedConfig } = state;
  const { dropdownInput, requiredInput } = addNodeState;
  const { pipelineData, selectedPipeline } = pipelineState;

  const enableSave =
    data.chrisFiles.length > 0 ||
    data.localFiles.length > 0 ||
    Object.keys(requiredInput).length > 0 ||
    Object.keys(dropdownInput).length > 0 ||
    pluginMeta !== undefined
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

  const allRequiredFieldsNotEmpty: boolean = selectedConfig.includes(
    "fs_plugin"
  )
    ? params?.required.length == Object.keys(requiredInput).length
    : true;

  const handleDispatch = React.useCallback(
    (files: LocalFile[]) => {
      const seen = new Set();
      const withDuplicateFiles = [...state.data.localFiles, ...files];
      const result = withDuplicateFiles.filter((el) => {
        const duplicate = seen.has(el.name);
        seen.add(el.name);
        return !duplicate;
      });
      dispatch({
        type: Types.AddLocalFile,
        payload: {
          files: result,
        },
      });
      notification.info({
        message: `${files.length > 1 ? "New Files added" : "New File added"} `,
        description: `${files.length} ${
          files.length > 1 ? "Files added" : "File added"
        }`,
        duration: 1,
      });
      if (!selectedConfig.includes("local_select")) {
        const nonDuplicateConfig = new Set([...selectedConfig, "local_select"]);
        dispatch({
          type: Types.SelectedConfig,
          payload: {
            selectedConfig: nonDuplicateConfig,
          },
        });
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

  const getUploadFileCount = (value: number) => {
    dispatch({
      type: Types.SetProgress,
      payload: {
        value,
      },
    });
  };
  const getFeedError = (error: string) => {
    dispatch({
      type: Types.SetError,
      payload: {
        feedError: error,
      },
    });
  };

  const handleSave = async () => {
    // Set the progress to 'Started'

    dispatch({
      type: Types.SetFeedCreationState,
      payload: {
        status: "Creating Feed",
      },
    });
    const username = user && user.username;
    const feed = await createFeed(
      state.data,
      dropdownInput,
      requiredInput,
      selectedPluginFromMeta,
      username,
      pipelineData,
      getUploadFileCount,
      getFeedError,
      selectedConfig,
      selectedPipeline
    );

    if (feed) {
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
      dispatch({
        type: Types.SetFeedCreationState,
        payload: {
          status: "Feed Created Successfully",
        },
      });

      setTimeout(() => {
        dispatch({
          type: Types.ResetState,
        });
      }, 2000);
    }
  };

  const basicInformation = <BasicInformation />;
  const chooseConfig = (
    <ChooseConfig user={user} handleFileUpload={handleChoseFilesClick} />
  );

  const pipelines = <PipelineContainer />;
  const review = <Review handleSave={handleSave} />;

  const steps = [
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
    },
  ];

  const handleNext = (activeStep: any, cb: () => void) => {
    if (activeStep.id === 4) {
      handleSave();
      return;
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
          return (
            <>
              <Button
                data-test-id="create-analysis"
                style={{ margin: "0.5em", padding: "0.5em 2em" }}
                variant="primary"
                type="submit"
                onClick={() => handleNext(activeStep, onNext)}
                isDisabled={activeStep.enableNext === false ? true : false}
              >
                {activeStep.nextButtonText ? activeStep.nextButtonText : "Next"}
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
            type: Types.ToggleWizard,
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
            if (wizardOpen) {
              dispatch({
                type: Types.ResetState,
              });

              pipelineDispatch({
                type: PipelineTypes.ResetState,
              });

              dispatch({
                type: Types.ToggleWizard,
              });
            }
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
