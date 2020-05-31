import React, { useContext } from "react";
import { Button, Wizard } from "@patternfly/react-core";
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
import { IFeedItem } from "../../../api/models/feed.model";
import { createFeed, getName } from "./utils/createFeed";
import { Collection } from "@fnndsc/chrisapi";

const CreateFeed: React.FC<CreateFeedReduxProp> = ({ user, addFeed }) => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const {
    wizardOpen,
    step,
    data,
    selectedConfig,
    selectedPlugin,
    dropdownInput,
    requiredInput,
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

  const handleStepChange = (step: any) => {
    const { id } = step;
    dispatch({
      type: Types.SetStep,
      payload: {
        id,
      },
    });
  };

  const deleteInput = (index: string) => {
    dispatch({
      type: Types.DeleteInput,
      payload: {
        input: index,
      },
    });
  };

  const inputChange = (
    id: string,
    paramName: string,
    value: string,
    required: boolean
  ) => {
    const input: InputIndex = {};
    input[paramName] = value;
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

  const handleSave = async () => {
    const username = user && user.username;
    try {
      const feed = await createFeed(
        state.data,
        dropdownInput,
        requiredInput,
        selectedPlugin,
        username
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
      await note.put(
        {
          title: "Description",
          content: state.data.feedDescription,
        },
        1000
      );
      // Add data to redux
      const { data, collection } = feed;
      const createdFeedLinks = collection.items[0];

      const getLinkUrl = (resource: string) => {
        return Collection.getLinkRelationUrls(createdFeedLinks, resource)[0];
      };

      const feedObj = {
        name: state.data.feedName,
        note: state.data.feedDescription,
        id: feed.data.id,
        creation_date: data.creation_date,
        modification_date: data.modification_date,
        creator_username: data.creator_username,
        owner: [data.creator_username],
        url: feed.url,
        files: getLinkUrl("files"),
        comments: getLinkUrl("comments"),
        tags: getLinkUrl("tags"),
        taggings: getLinkUrl("taggings"),
        plugin_instances: getLinkUrl("plugininstances"),
      };

      addFeed && addFeed(feedObj);
    } catch (error) {
      console.error(error);
    } finally {
      dispatch({
        type: Types.ResetState,
      });
      dispatch({
        type: Types.ToggleWizzard,
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
      plugin={selectedPlugin}
      inputChange={inputChange}
      deleteInput={deleteInput}
      dropdownInput={dropdownInput}
      requiredInput={requiredInput}
    />
  );
  const review = <Review />;

  const getFeedSynthesisStep = () => {
    if (selectedConfig === "fs_plugin")
      return [
        {
          id: 3,
          name: "Data Packs",
          component: packs,
          enableNext: selectedPlugin !== undefined,
        },
        { id: 4, name: "Parameter Configuration", component: guidedConfig },
      ];
    else if (selectedConfig === "file_select") {
      return [
        { id: 3, name: "ChRIS File Select", component: chrisFileSelect },
        { id: 4, name: "Local File Upload", component: localFileUpload },
      ];
    }
  };

  const steps = [
    {
      id: 1,
      name: "Basic Information",
      component: basicInformation,
      enableNext: !!data.feedName,
      canJumpTo: step >= 1,
    },
    {
      id: 2,
      name: "Data Configuration",
      component: chooseConfig,
      enableNext: selectedConfig.length > 0,
      canJumpTo: step >= 2,
    },
    {
      name: getName(selectedConfig),
      steps: getFeedSynthesisStep(),
      canJumTo: step >= 3,
    },
    {
      id: 5,
      name: "Review",
      component: review,
      enableNext: enableSave,
      nextButtonText: "Save",
    },
  ];

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
          onNext={handleStepChange}
          onBack={handleStepChange}
          onGoToStep={handleStepChange}
          onSave={handleSave}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  user: state.user,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  addFeed: (feed: IFeedItem) => dispatch(addFeed(feed)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateFeed);
