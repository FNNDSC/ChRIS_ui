import type { Feed } from "@fnndsc/chrisapi";
import {
  Button,
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
} from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import { notification } from "../Antd";
import * as React from "react";
import { useContext } from "react";
import { catchError } from "../../api/common";
import { MainRouterContext } from "../../routes";
import { useTypedSelector } from "../../store/hooks";
import { AddNodeContext } from "../AddNode/context";
import { CodeBranchIcon } from "../Icons";
import PipelinesCopy from "../PipelinesCopy";
import { PipelineContext } from "../PipelinesCopy/context";
import BasicInformation from "./BasicInformation";
import ChooseConfig from "./ChooseConfig";
import Review from "./Review";
import withSelectionAlert from "./SelectionAlert";
import { CreateFeedContext } from "./context";
import "./createFeed.css";
import { createFeed, createFeedInstanceWithFS } from "./createFeedHelper";
import { Types } from "./types/feed";

export default function CreateFeed() {
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);
  const [feedProcessing, setFeedProcessing] = React.useState(false);
  const queryClient = useQueryClient();
  const router = useContext(MainRouterContext);

  const { state, dispatch } = useContext(CreateFeedContext);
  const { state: addNodeState, dispatch: nodeDispatch } =
    useContext(AddNodeContext);
  const { state: pipelineState, dispatch: pipelineDispatch } =
    useContext(PipelineContext);

  const user = useTypedSelector((state) => state.user);
  const { pluginMeta, selectedPluginFromMeta, dropdownInput, requiredInput } =
    addNodeState;
  const { wizardOpen, data, selectedConfig } = state;

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

  const resetAfterCompletion = () => {
    dispatch({
      type: Types.ResetState,
    });
    pipelineDispatch({
      type: Types.ResetState,
    });
    router.actions.clearFeedData();
  };

  const enableSave = !!(
    data.chrisFiles.length > 0 ||
    data.localFiles.length > 0 ||
    Object.keys(requiredInput).length > 0 ||
    Object.keys(dropdownInput).length > 0 ||
    pluginMeta !== undefined
  );

  const handleSave = async () => {
    setFeedProcessing(true);
    dispatch({
      type: Types.SetFeedCreationState,
      payload: {
        status: "Creating Feed",
      },
    });
    const username = user?.username;

    try {
      let feed: Feed | undefined | null = undefined;

      if (
        selectedConfig.includes("local_select") ||
        selectedConfig.includes("swift_storage")
      ) {
        feed = await createFeed(
          data,
          username,
          getUploadFileCount,
          selectedConfig,
          pipelineState,
        );
      }

      if (selectedConfig.includes("fs_plugin")) {
        feed = await createFeedInstanceWithFS(
          dropdownInput,
          requiredInput,
          selectedPluginFromMeta,
        );
      }

      if (feed) {
        // Set analysis name
        await feed.put({
          name: state.data.feedName,
        });

        /**
         * @deprecated
         * The following code is deprecated and should not be used.
         * It sets analysis tags on the feed.
        
          
          for (const tag of state.data.tags) {
          feed.tagFeed(tag.data.id);
           }
          */

        // Set analysis description
        const note = await feed.getNote();

        await note.put({
          title: "Description",
          content: state.data.feedDescription,
        });

        queryClient.invalidateQueries({
          queryKey: ["feeds"],
        });

        dispatch({
          type: Types.SetFeedCreationState,
          payload: {
            status: "Feed Created Successfully",
          },
        });

        setTimeout(() => {
          setFeedProcessing(false);
          resetAfterCompletion();
        }, 1500);
      }
    } catch (error) {
      const errorObj = catchError(error);
      getFeedError(errorObj);
      setFeedProcessing(false);
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
    [dispatch, selectedConfig, state.data.localFiles],
  );

  const handleChoseFilesClick = React.useCallback(
    (files: File[]) => {
      handleDispatch(files);
    },
    [handleDispatch],
  );

  const allRequiredFieldsNotEmpty: boolean =
    !!selectedConfig.includes("fs_plugin");

  const filesChoosen = data.chrisFiles.length > 0 || data.localFiles.length > 0;

  const closeWizard = () => {
    dispatch({
      type: Types.ToggleWizard,
    });

    nodeDispatch({
      type: Types.ResetState,
    });
  };

  return (
    <div>
      <Button
        icon={<CodeBranchIcon />}
        variant="primary"
        onClick={() => closeWizard()}
        isDisabled={!isLoggedIn}
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
          onClose={() => closeWizard()}
          header={
            <WizardHeader
              onClose={() => {
                if (wizardOpen) {
                  resetAfterCompletion();
                }
              }}
              title="Create a New Analysis"
              description="This wizard allows you to create a new Analysis and choose some data to process"
            />
          }
          height={500}
          width={"100%"}
          title="Create a New Analysis"
        >
          <WizardStep
            id={1}
            name="Basic-Information"
            footer={{
              isNextDisabled: !data.feedName,
              isBackDisabled: true,
            }}
          >
            {withSelectionAlert(<BasicInformation />)}
          </WizardStep>
          <WizardStep
            id={2}
            name="Analysis Data Selection"
            footer={{
              isNextDisabled: !(filesChoosen || allRequiredFieldsNotEmpty),
            }}
          >
            {withSelectionAlert(
              <ChooseConfig
                user={user}
                handleFileUpload={handleChoseFilesClick}
                showAlert={!(filesChoosen || allRequiredFieldsNotEmpty)}
              />,
            )}
          </WizardStep>
          <WizardStep id={3} name="Pipelines">
            <PipelinesCopy />
          </WizardStep>
          <WizardStep
            id={4}
            name="Review"
            footer={{
              onNext: handleSave,
              nextButtonText: "Create Analysis",
              isNextDisabled: !!(!enableSave || feedProcessing),
            }}
          >
            <Review handleSave={handleSave} />
          </WizardStep>
        </Wizard>
      </Modal>
    </div>
  );
}
