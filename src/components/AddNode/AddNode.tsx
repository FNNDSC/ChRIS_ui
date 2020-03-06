import React, { Component } from "react";
import { Button, Wizard, WizardStepFunctionType } from "@patternfly/react-core";

import ScreenOne from "../../components/feed/AddNode/ScreenOne";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import { connect } from "react-redux";
import { Plugin } from "@fnndsc/chrisapi";
import _ from "lodash";
import { ApplicationState } from "../../store/root/applicationState";
import "./addnode.scss";
import GuidedConfig from "./GuidedConfig";
import LoadingSpinner from "../common/loading/LoadingSpinner";

interface AddNodeState {
  isOpen: boolean;
  allStepsValid: boolean;
  stepIdReached: number;
  isFormValid: boolean;
  nodes?: IPluginItem[];
  data: {
    plugin?: Plugin;
    parent?: IPluginItem;
  };
}

interface AddNodeProps {
  selected?: IPluginItem;
  nodes?: IPluginItem[];
  addNode?: (pluginItem: IPluginItem) => void;
}

class AddNode extends Component<AddNodeProps, AddNodeState> {
  constructor(props: AddNodeProps) {
    super(props);
    this.state = {
      isOpen: false,
      allStepsValid: false,
      stepIdReached: 1,
      isFormValid: false,
      nodes: [],
      data: {}
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
        parent: selected
      }
    });
  }

  toggleOpen = () => {
    this.setState((state: AddNodeState) => ({
      isOpen: !state.isOpen
    }));
  };

  handleSave = () => {
    console.log("Saving and closing wizard");
    this.setState({
      isOpen: false
    });
  };

  onNext: WizardStepFunctionType = ({ id, name }, { prevId, prevName }) => {
    const { stepIdReached } = this.state;
    id &&
      console.log(`current id: ${id}`) &&
      this.setState({
        stepIdReached: stepIdReached < id ? (id as number) : stepIdReached
      });
  };

  onBack: WizardStepFunctionType = ({ id, name }) => {
    console.log(`current id : ${id}`);
    this.areAllStepsValid();
  };

  areAllStepsValid = () => {
    this.setState({
      allStepsValid: this.state.isFormValid
    });
  };

  onGoToStep: WizardStepFunctionType = ({ id, name }) => {
    console.log(`current id : ${id}`);
  };

  handlePluginSelect = (plugin: Plugin) => {
    this.setState(prevState => ({
      data: { ...prevState.data, plugin }
    }));
  };

  getStepName(): string {
    const stepNames = [
      "basic-information",
      "chris-file-select",
      "local-file-upload",
      "review"
    ];
    return stepNames[this.state.stepIdReached - 1]; // this.state.step starts at 1
  }

  render() {
    const { isOpen, isFormValid, stepIdReached, data } = this.state;
    const { nodes, selected } = this.props;

    const screenOne = selected && nodes && (
      <ScreenOne
        selectedPlugin={data.plugin}
        parent={selected}
        nodes={nodes}
        handlePluginSelect={this.handlePluginSelect}
      />
    );

    const guidedConfig = data.plugin ? (
      <GuidedConfig plugin={data.plugin} />
    ) : (
      <LoadingSpinner />
    );

    const steps = [
      { id: 1, name: "Plugin Selection", component: screenOne },
      {
        name: "Configuration",
        steps: [
          {
            id: 2,
            name: "Guided Configuration",
            component: guidedConfig,
            enableNext: isFormValid,
            canJumpTo: stepIdReached <= 2
          },
          {
            id: 3,
            name: "Editor",
            component: <p>Substep B</p>,
            canJumpTo: stepIdReached >= 3
          }
        ]
      },
      {
        id: 4,
        name: "Review",
        component: <p>Step 4</p>,
        nextButtonText: "Close",
        canJumpTo: stepIdReached >= 4
      }
    ];

    return (
      <React.Fragment>
        <Button variant="primary" onClick={this.toggleOpen}>
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
            className={`add-node-wizard ${this.getStepName()}-wrap}`}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  selected: state.plugin.selected,
  nodes: state.feed.items
});

export default connect(mapStateToProps, null)(AddNode);
