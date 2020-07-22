import React, { Component } from "react";
import { Dispatch } from "redux";
import { Wizard } from "@patternfly/react-core";
import { connect } from "react-redux";
import { isEqual } from "lodash";
import { ApplicationState } from "../../../store/root/applicationState";
import "./styles/addnode.scss";
import LoadingSpinner from "../../common/loading/LoadingSpinner";
import Review from "./Review";
import { addNode } from "../../../store/feed/actions";
import { PluginInstance, Plugin } from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import { InfrastructureIcon } from "@patternfly/react-icons";
import { getParams } from "../../../store/plugin/actions";
import GuidedConfig from "./GuidedConfig";
import Editor from "./Editor";
import BasicConfiguration from "./BasicConfiguration";
import { unpackParametersIntoObject } from "./lib/utils";
import { AddNodeState, AddNodeProps, InputType, InputIndex } from "./types";

class AddNode extends Component<AddNodeProps, AddNodeState> {
  constructor(props: AddNodeProps) {
    super(props);
    this.state = {
      isOpen: false,
      stepIdReached: 1,
      nodes: [],
      data: {},
      requiredInput: {},
      dropdownInput: {},
      isRuntimeChecked: false,
    };

    this.inputChange = this.inputChange.bind(this);
    this.inputChangeFromEditor = this.inputChangeFromEditor.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.onBack = this.onBack.bind(this);
    this.onNext = this.onNext.bind(this);
    this.handlePluginSelect = this.handlePluginSelect.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.deleteInput = this.deleteInput.bind(this);
    this.handleRuntimeChecked = this.handleRuntimeChecked.bind(this);
  }

  componentDidMount() {
    this.handleFetchedData();
  }

  componentDidUpdate(prevProps: AddNodeProps) {
    const { selected, nodes } = this.props;

    if (prevProps.selected !== selected || !isEqual(prevProps.nodes, nodes)) {
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

  inputChange(id: string, paramName: string, value: string, required: boolean) {
    const input: InputIndex = {};
    input[paramName] = value;

    if (required === true) {
      this.setState({
        requiredInput: {
          ...this.state.requiredInput,
          [id]: input,
        },
      });
    } else {
      this.setState({
        dropdownInput: {
          ...this.state.dropdownInput,
          [id]: input,
        },
      });
    }
  }

  inputChangeFromEditor(dropdownInput: InputType, requiredInput: InputType) {
    this.setState((prevState) => ({
      dropdownInput: dropdownInput,
    }));

    this.setState((prevState) => ({
      requiredInput: requiredInput,
    }));
  }

  toggleOpen() {
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
  }

  onNext(newStep: { id?: string | number; name: React.ReactNode }) {
    const { stepIdReached } = this.state;
    const { id } = newStep;
    id &&
      this.setState({
        stepIdReached: stepIdReached < id ? (id as number) : stepIdReached,
      });
  }

  onBack(newStep: { id?: string | number; name: React.ReactNode }) {
    const { id } = newStep;
    if (id === 1) {
      this.setState({
        dropdownInput: {},
        requiredInput: {},
      });
    }
  }

  handlePluginSelect(plugin: Plugin) {
    const { getParams } = this.props;
    this.setState((prevState) => ({
      data: { ...prevState.data, plugin },
    }));
    getParams(plugin);
  }

  deleteInput(input: string) {
    const { dropdownInput } = this.state;

    let newObject = Object.entries(dropdownInput)
      .filter(([key, value]) => {
        return key !== input;
      })
      .reduce((acc: InputType, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    this.setState({
      dropdownInput: newObject,
    });
  }

  resetState() {
    this.setState({
      isOpen: false,
      stepIdReached: 1,
      nodes: [],
      data: {},
      dropdownInput: {},
      requiredInput: {},
      isRuntimeChecked: false,
    });
  }

  handleRuntimeChecked(isChecked: boolean) {
    this.setState({
      isRuntimeChecked: isChecked,
    });
  }

  async handleSave() {
    const { dropdownInput, requiredInput, isRuntimeChecked } = this.state;
    const { plugin } = this.state.data;
    const { selected, addNode } = this.props;

    let dropdownUnpacked;
    let requiredUnpacked;
    let runtimeobject: InputIndex = {};

    if (dropdownInput) {
      dropdownUnpacked = unpackParametersIntoObject(dropdownInput);
    }

    if (requiredInput) {
      requiredUnpacked = unpackParametersIntoObject(requiredInput);
    }

    if (isRuntimeChecked === true) {
      runtimeobject["runtime"] = "nvidia";
    }

    let nodeParamter = {
      ...dropdownUnpacked,
      ...requiredUnpacked,
      ...runtimeobject,
    };

    if (!plugin || !selected) {
      return;
    }

    let parameterInput = {
      ...nodeParamter,
      previous_id: `${selected.data.id}`,
    };

    const pluginInstances = await plugin.getPluginInstances();
    await pluginInstances.post(parameterInput);
    const node = pluginInstances.getItems()[0];
    addNode(node);
    this.resetState();
  }

  render() {
    const {
      isOpen,
      data,
      dropdownInput,
      requiredInput,
      isRuntimeChecked,
      stepIdReached,
    } = this.state;
    const { nodes, selected } = this.props;

    const basicConfiguration = selected && nodes && (
      <BasicConfiguration
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
        dropdownInput={dropdownInput}
        requiredInput={requiredInput}
      />
    ) : (
      <LoadingSpinner />
    );

    const editor = data.plugin ? (
      <Editor
        plugin={data.plugin}
        inputChange={this.inputChange}
        dropdownInput={dropdownInput}
        requiredInput={requiredInput}
        inputChangeFromEditor={this.inputChangeFromEditor}
        runtimeChecked={isRuntimeChecked}
        handleRuntimeChecked={this.handleRuntimeChecked}
      />
    ) : (
      <LoadingSpinner />
    );

    const review = data.plugin ? (
      <Review
        data={data}
        dropdownInput={dropdownInput}
        requiredInput={requiredInput}
        runtimeChecked={isRuntimeChecked}
      />
    ) : (
      <LoadingSpinner />
    );

    const steps = [
      {
        id: 1,
        name: "Plugin Selection",
        component: basicConfiguration,
        enableNext: !!data.plugin,
        canJumpTo: stepIdReached > 1,
      },
      {
        id: 2,
        name: "Plugin Configuration-Form",
        component: form,
        canJumpTo: stepIdReached > 2,
      },
      {
        id: 3,
        name: "Plugin Configuration-Editor",
        component: editor,
        canJumpTo: stepIdReached > 3,
      },
      {
        id: 4,
        name: "Review",
        component: review,
        nextButtonText: "Add Node",
        canJumpTo: stepIdReached > 4,
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
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  selected: state.feed.selected,
  nodes: state.feed.pluginInstances,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getParams: (plugin: Plugin) => dispatch(getParams(plugin)),
  addNode: (pluginItem: PluginInstance) => dispatch(addNode(pluginItem)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddNode);
