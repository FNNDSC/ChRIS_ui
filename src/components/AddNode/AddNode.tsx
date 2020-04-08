import React, { Component } from "react";
import { Dispatch } from "redux";
import { Wizard, WizardStepFunctionType } from "@patternfly/react-core";
import ScreenOne from "../../components/feed/AddNode/ScreenOne";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import { connect } from "react-redux";
import { Plugin } from "@fnndsc/chrisapi";
import _ from "lodash";
import { ApplicationState } from "../../store/root/applicationState";
import "./addnode.scss";
import LoadingSpinner from "../common/loading/LoadingSpinner";
import Review from "./Review";
import { addNode } from "../../store/feed/actions";
import { Collection } from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import { InfrastructureIcon } from "@patternfly/react-icons";
import { getParams } from "../../store/plugin/actions";
import GuidedConfig from "./GuidedConfig";
import Editor from "./Editor";

interface AddNodeState {
  isOpen: boolean;
  userInput: {
    [key: number]: {
      [key: string]: string;
    };
  };
  stepIdReached: number;
  nodes?: IPluginItem[];
  data: {
    plugin?: Plugin;
    parent?: IPluginItem;
  };
  editorState: {
    [key: string]: string;
  };
}

interface AddNodeProps {
  selected?: IPluginItem;
  nodes?: IPluginItem[];
  addNode: (pluginItem: IPluginItem) => void;
  getParams: (plugin: Plugin) => void;
}

class AddNode extends Component<AddNodeProps, AddNodeState> {
  constructor(props: AddNodeProps) {
    super(props);
    this.state = {
      isOpen: false,
      stepIdReached: 1,
      nodes: [],
      data: {},
      userInput: {},
      editorState: {},
    };
  }

  componentDidMount() {
    this.handleFetchedData();
  }

  componentDidUpdate(prevProps: AddNodeProps) {
    const { selected, nodes } = this.props;

    if (prevProps.selected !== selected || !_.isEqual(prevProps.nodes, nodes)) {
      this.handleFetchedData();
    }
  }

  handleFetchedData() {
    const { selected, nodes } = this.props;
    if (!selected || !nodes) {
      return;
    }
    this.setState({
      nodes,
      data: {
        ...this.state.data,
        parent: selected,
      },
    });
  }

  inputChange = (id: number, paramName: string, value: string) => {
    const input: { [key: string]: string } = {};
    input[paramName] = value;

    this.setState({
      userInput: {
        ...this.state.userInput,
        [id]: input,
      },
    });
  };

  inputChangeFromEditor = (input: {}) => {
    this.setState(
      {
        editorState: input,
      },
      () => {}
    );
  };

  resetState = () => {
    console.log("Reset state called");
    this.setState({
      isOpen: false,
      stepIdReached: 1,
      nodes: [],
      data: {},
      userInput: {},
      editorState: {},
    });
  };

  toggleOpen = () => {
    this.setState(
      (state: AddNodeState) => ({
        isOpen: !state.isOpen,
      }),
      () => {
        if (this.state.isOpen === false) {
          this.resetState();
        }
      }
    );
  };

  handleSave = async () => {
    console.log("Saving and closing wizard");

    const { userInput, editorState } = this.state;
    const { plugin } = this.state.data;
    const { selected } = this.props;

    let result: {
      [key: string]: string;
    } = {};
    for (let parameter in userInput) {
      const object = userInput[parameter];
      const flag = Object.keys(object)[0];
      const value = object[flag];
      result[flag] = value;
    }

    console.log("EditorState", editorState);

    let nodeParamter = {
      ...result,
      ...editorState,
    };

    console.log("Node Param", nodeParamter);

    if (!plugin || !selected) {
      return;
    }

    let parameterInput = {
      ...nodeParamter,
      previous_id: `${selected.id}`,
    };

    const pluginInstances = await plugin.getPluginInstances();
    await pluginInstances.post(parameterInput);
    const node = pluginInstances.getItems()[0];

    // Add node to redux

    const { data, collection } = node;
    const createdNodeLinks = collection.items[0];

    const getLinkUrl = (resource: string) => {
      return Collection.getLinkRelationUrls(createdNodeLinks, resource)[0];
    };

    const nodeobj = {
      ...data,
      descendants: getLinkUrl("descendants"),
      feed: getLinkUrl("feed"),
      files: getLinkUrl("files"),
      parameters: getLinkUrl("parameters"),
      plugin: getLinkUrl("plugin"),
      url: node.url,
    };

    this.props.addNode(nodeobj);
    this.resetState();
  };

  onNext: WizardStepFunctionType = ({ id, name }, { prevId, prevName }) => {
    const { stepIdReached } = this.state;
    id &&
      console.log(`current id: ${id}`) &&
      this.setState({
        stepIdReached: stepIdReached < id ? (id as number) : stepIdReached,
      });
  };

  onBack: WizardStepFunctionType = ({ id, name }) => {
    this.setState({
      userInput: {},
      editorState: {},
    });
  };

  onGoToStep: WizardStepFunctionType = ({ id, name }) => {
    console.log(`current id : ${id}`);
  };

  handlePluginSelect = (plugin: Plugin) => {
    const { getParams } = this.props;
    this.setState((prevState) => ({
      data: { ...prevState.data, plugin },
    }));
    getParams(plugin);
  };

  deleteInput = (input: number) => {
    const { userInput } = this.state;
    let newObject = Object.entries(userInput)
      .filter(([key, value]) => {
        return parseInt(key) !== input;
      })
      .reduce(
        (
          acc: {
            [key: string]: {
              [key: string]: string;
            };
          },
          [key, value]
        ) => {
          acc[key] = value;
          return acc;
        },
        {}
      );

    this.setState({
      userInput: newObject,
    });
  };

  render() {
    const { isOpen, data, userInput, editorState } = this.state;
    const { nodes, selected } = this.props;

    const screenOne = selected && nodes && (
      <ScreenOne
        selectedPlugin={data.plugin}
        parent={selected}
        nodes={nodes}
        handlePluginSelect={this.handlePluginSelect}
      />
    );
    const form = data.plugin ? (
      <GuidedConfig
        inputChange={this.inputChange}
        deleteInput={this.deleteInput}
        plugin={data.plugin}
        userInput={userInput}
      />
    ) : (
      <LoadingSpinner />
    );

    const editor = data.plugin ? (
      <Editor
        plugin={data.plugin}
        editorState={editorState}
        editorInput={this.inputChangeFromEditor}
      />
    ) : (
      <LoadingSpinner />
    );

    const review = data.plugin ? (
      <Review data={data} userInput={userInput} editorState={editorState} />
    ) : (
      <LoadingSpinner />
    );

    const steps = [
      {
        id: 1,
        name: "Plugin Selection",
        component: screenOne,
        enableNext: !!data.plugin,
      },
      {
        id: 2,
        name: "Plugin Configuration-Form",
        component: form,
      },
      {
        id: 3,
        name: "Plugin Configuration-Editor",
        component: editor,
      },
      {
        id: 4,
        name: "Review",
        component: review,
        nextButtonText: "Add Node",
      },
    ];

    return (
      <React.Fragment>
        <Button variant="primary" isBlock onClick={this.toggleOpen}>
          <InfrastructureIcon />
          Add a Node
        </Button>
        {isOpen && (
          <Wizard
            isOpen={isOpen}
            onClose={this.toggleOpen}
            title="Add a New Node"
            description="This wizard allows you to add a node to a feed"
            onSave={this.handleSave}
            steps={steps}
            onNext={this.onNext}
            onBack={this.onBack}
            onGoToStep={this.onGoToStep}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  selected: state.plugin.selected,
  nodes: state.feed.items,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getParams: (plugin: Plugin) => dispatch(getParams(plugin)),
  addNode: (pluginItem: IPluginItem) => dispatch(addNode(pluginItem)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddNode);
