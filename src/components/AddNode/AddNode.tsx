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
import SwitchConfig from "./SwitchConfig";
import Review from "./Review";
import { addNode } from "../../store/feed/actions";
import { Collection } from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";

interface AddNodeState {
  isOpen: boolean;
  userInput: {
    [key: string]: string;
  };
  stepIdReached: number;

  nodes?: IPluginItem[];
  data: {
    plugin?: Plugin;
    parent?: IPluginItem;
  };
}

interface AddNodeProps {
  selected?: IPluginItem;
  nodes?: IPluginItem[];
  addNode: (pluginItem: IPluginItem) => void;
}

class AddNode extends Component<AddNodeProps, AddNodeState> {
  constructor(props: AddNodeProps) {
    super(props);
    this.state = {
      isOpen: false,
      stepIdReached: 1,
      nodes: [],
      data: {},
      userInput: {}
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

  inputChange = (flag: string, value: string) => {
    const { userInput } = this.state;

    this.setState({
      userInput: {
        ...userInput,
        [flag]: value
      }
    });
  };

  toggleOpen = () => {
    this.setState((state: AddNodeState) => ({
      isOpen: !state.isOpen
    }));
  };

  handleSave = async () => {
    console.log("Saving and closing wizard");

    const { userInput } = this.state;
    const { plugin } = this.state.data;
    const { selected } = this.props;

    if (!plugin || !selected) {
      return;
    }

    let parameterInput = {
      ...userInput,
      previous_id: `${selected.id}`
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
      url: node.url
    };

    this.props.addNode(nodeobj);

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
  };

  onGoToStep: WizardStepFunctionType = ({ id, name }) => {
    console.log(`current id : ${id}`);
  };

  handlePluginSelect = (plugin: Plugin) => {
    this.setState(prevState => ({
      data: { ...prevState.data, plugin }
    }));
  };

  render() {
    const { isOpen, data, userInput } = this.state;
    const { nodes, selected } = this.props;

    const screenOne = selected && nodes && (
      <ScreenOne
        selectedPlugin={data.plugin}
        parent={selected}
        nodes={nodes}
        handlePluginSelect={this.handlePluginSelect}
      />
    );

    const switchConfig = data.plugin ? (
      <SwitchConfig
        userInput={userInput}
        plugin={data.plugin}
        onInputChange={this.inputChange}
      />
    ) : (
      <LoadingSpinner />
    );

    const review = data.plugin ? (
      <Review data={data} userInput={userInput} />
    ) : (
      <LoadingSpinner />
    );

    const steps = [
      {
        id: 1,
        name: "Plugin Selection",
        component: screenOne,
        enableNext: !!data.plugin
      },
      {
        id: 2,
        name: "Plugin Configuration",
        component: switchConfig
      },
      {
        id: 3,
        name: "Review",
        component: review,
        nextButtonText: "Add Node"
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addNode: (pluginItem: IPluginItem) => dispatch(addNode(pluginItem))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddNode);
