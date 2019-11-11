import React from "react";
import { connect } from "react-redux";

import { Button } from "@patternfly/react-core";

import { InfrastructureIcon, CodeBranchIcon } from "@patternfly/react-icons";

import "./addnode.scss";
import { Plugin, PluginInstance, Collection } from "@fnndsc/chrisapi";
import ScreenOne from "./ScreenOne";
import AddModal from "./AddModal";

import Editor from "./Editor";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { ApplicationState } from "../../../store/root/applicationState";
import { IPluginItem } from "../../../api/models/pluginInstance.model";

import { Dispatch } from "redux";
import { addNode } from "../../../store/feed/actions";

interface AddNodeProps {
  selected?: IPluginItem;
  nodes?: IPluginItem[];
  addNode: (pluginItem: IPluginItem) => void;
}

interface AddNodeState {
  showOverlay: boolean;
  step: number;
  nodes?: PluginInstance[]; // converted props.nodes
  data: {
    parent?: PluginInstance;
    plugin?: Plugin;
  };
  errors: string[];
  input: string;
}

class AddNode extends React.Component<AddNodeProps, AddNodeState> {
  constructor(props: AddNodeProps) {
    super(props);
    this.state = {
      showOverlay: false,
      step: 0,
      data: {},
      errors: [],
      input: ""
    };

    this.handleConfigureClick = this.handleConfigureClick.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handlePluginSelect = this.handlePluginSelect.bind(this);
    this.handleParentSelect = this.handleParentSelect.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
  }

  componentDidMount() {
    this.convertData();
  }

  componentDidUpdate(prevProps: AddNodeProps) {
    const { selected } = this.props;
    const { selected: prevSelected } = prevProps;
    if (!prevSelected || (selected && prevSelected.id !== selected.id)) {
      this.convertData();
    }
  }

  // Temporary. Converts IPluginItem to PluginInstance
  convertPluginInstance(pluginInstance: IPluginItem) {
    const client = ChrisAPIClient.getClient();
    return client.getPluginInstance(pluginInstance.id as number);
  }

  // Temporary. Converts selected from IPluginItem into parent: PluginInstance
  async convertData() {
    const { selected, nodes } = this.props;
    if (!selected || !nodes) {
      return;
    }
    const parent = await this.convertPluginInstance(selected);

    const transformedNodes = await Promise.all(
      nodes.map(this.convertPluginInstance)
    );

    transformedNodes &&
      parent &&
      this.setState(prevState => ({
        nodes: transformedNodes,
        data: {
          ...prevState.data,
          parent
        }
      }));
  }

  handleAddClick() {
    this.setState(prevState => ({
      showOverlay: !prevState.showOverlay
    }));
  }

  handleModalClose() {
    this.setState(prevState => ({
      showOverlay: !prevState.showOverlay,
      step: 0
    }));
  }

  handlePluginSelect(plugin: Plugin) {
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        plugin
      }
    }));
  }

  handleParentSelect(node: PluginInstance) {
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        parent: node
      }
    }));
  }

  // Navigation

  handleConfigureClick() {
    this.setState({ step: 1 });
  }

  handleBackClick() {
    this.setState({ step: 0 });
  }

  async handleCreate(parameters: any) {
    const { plugin } = this.state.data;
    const { selected } = this.props;
    console.log(selected);

    if (!plugin || !selected) {
      return;
    }

    let createParameterList = {};

    for (let parameter of parameters) {
      createParameterList = {
        ...createParameterList,
        ...parameter,
        previous_id: `${selected.id}`
      };
    }

    const pluginInstances = await plugin.getPluginInstances();
    await pluginInstances.post(createParameterList);
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

    this.handleModalClose();
  }

  generateFooter() {
    const { step, data } = this.state;

    return (
      step === 0 && (
        <Button onClick={this.handleConfigureClick} isDisabled={!data.plugin}>
          <CodeBranchIcon />
          Configure new node...
        </Button>
      )
    );
  }

  render() {
    const { step, data, nodes, showOverlay } = this.state;

    return (
      <React.Fragment>
        <Button variant="tertiary" isBlock onClick={this.handleAddClick}>
          <InfrastructureIcon />
          Add new node(s)...
        </Button>
        <AddModal
          footer={this.generateFooter()}
          showOverlay={showOverlay}
          handleModalClose={this.handleModalClose}
          step={step}
        >
          {step === 0 && data.parent && nodes ? (
            <ScreenOne
              selectedPlugin={data.plugin}
              parent={data.parent}
              nodes={nodes}
              handleParentSelect={this.handleParentSelect}
              handlePluginSelect={this.handlePluginSelect}
            />
          ) : (
            data.plugin && (
              <Editor
                plugin={data.plugin}
                handleModalClose={this.handleModalClose}
                handleCreate={this.handleCreate}
                handleBackClick={this.handleBackClick}
              />
            )
          )}
        </AddModal>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddNode);
