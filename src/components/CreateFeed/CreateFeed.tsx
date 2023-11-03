import * as React from "react";
import { useContext } from "react";
import {
  Button,
  Modal,
  ModalVariant,
  Wizard,
  WizardStep,
  WizardHeader,
} from "@patternfly/react-core";
import { useDispatch } from "react-redux";
import { notification } from "antd";
import { CreateFeedContext, PipelineContext } from "./context";
import { AddNodeContext } from "../AddNode/context";
import { Types } from "./types/feed";
import { PipelineTypes } from "./types/pipeline";
import BasicInformation from "./BasicInformation";
import ChooseConfig from "./ChooseConfig";
import PipelineContainer from "./PipelineContainter";
import Review from "./Review";
import { useTypedSelector } from "../../store/hooks";
import { addFeed } from "../../store/feed/actions";
import { createFeed } from "./createFeed";
import "./CreateFeed.css";

export default function CreateFeed() {
  const storeDispatch = useDispatch();
  const { state, dispatch } = useContext(CreateFeedContext);
  const { state: addNodeState, dispatch: nodeDispatch } =
    useContext(AddNodeContext);
  const { state: pipelineState, dispatch: pipelineDispatch } =
    useContext(PipelineContext);

  const user = useTypedSelector((state) => state.user);
  const params = useTypedSelector((state) => state.plugin.parameters);
  const { pluginMeta, selectedPluginFromMeta, dropdownInput, requiredInput } =
    addNodeState;
  const { wizardOpen, data, selectedConfig } = state;
  const { pipelineData, selectedPipeline } = pipelineState;

  const getUploadFileCount = (value: number) => {
    dispatch({
      type: Types.SetProgress,
      payload: {
        value,
      },
    });
  };
  const getFeedError = (error: any) => {
    dispatch({
      type: Types.SetError,
      payload: {
        feedError: error,
      },
    });
  };

  const enableSave =
    data.chrisFiles.length > 0 ||
    data.localFiles.length > 0 ||
    Object.keys(requiredInput).length > 0 ||
    Object.keys(dropdownInput).length > 0 ||
    pluginMeta !== undefined
      ? true
      : false;

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
      addFeed && storeDispatch(addFeed(feed));
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

  const handleDispatch = React.useCallback(
    (files: File[]) => {
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
    (files: File[]) => {
      handleDispatch(files);
    },
    [handleDispatch]
  );

  const allRequiredFieldsNotEmpty: boolean = selectedConfig.includes(
    "fs_plugin"
  )
    ? params?.required.length == Object.keys(requiredInput).length
    : true;

  return (
    <div>
      <Button
        variant="primary"
        onClick={() => {
          dispatch({
            type: Types.ToggleWizard,
          });

          nodeDispatch({
            type: Types.ResetState,
          });
        }}
      >
        Create Feed
      </Button>
      <Modal
        aria-label="Wizard Modal"
        showClose={false}
        hasNoBodyWrapper
        variant={ModalVariant.large}
        isOpen={wizardOpen}
      >
        <Wizard
          header={
            <WizardHeader
              onClose={() => {
                //routerContext.actions.clearFeedData();
                if (wizardOpen) {
                  dispatch({
                    type: Types.ResetState,
                  });

                  pipelineDispatch({
                    type: PipelineTypes.ResetState,
                  });
                }
              }}
              title="Create a New Analysis"
              description="This wizard allows you to create a new Analysis and choose some data to process"
            />
          }
          height={500}
          width={"100%"}
        >
          <WizardStep
            id={1}
            name="Basic-Information"
            footer={{
              isNextDisabled: data.feedName ? false : true,
              isBackDisabled: true,
            }}
          >
            <BasicInformation />
          </WizardStep>
          <WizardStep
            id={2}
            name="Analysis Data Selection"
            footer={{
              isNextDisabled: allRequiredFieldsNotEmpty ? false : true,
            }}
          >
            <ChooseConfig
              user={user}
              handleFileUpload={handleChoseFilesClick}
            />
          </WizardStep>
          <WizardStep id={3} name="Pipelines">
            <PipelineContainer />
          </WizardStep>
          <WizardStep
            id={4}
            name="Review"
            footer={{
              onNext: handleSave,
              nextButtonText: "Create Analysis",
              isNextDisabled: enableSave ? false : true,
            }}
          >
            <Review handleSave={handleSave} />
          </WizardStep>
        </Wizard>
      </Modal>
    </div>
  );
}
