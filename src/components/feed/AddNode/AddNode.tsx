import React from "react";
import { connect } from "react-redux";

import { Button } from "@patternfly/react-core";

import { InfrastructureIcon, CodeBranchIcon } from "@patternfly/react-icons";

import "./addnode.scss";
import { Plugin, Collection } from "@fnndsc/chrisapi";
import ScreenOne from "./ScreenOne";
import AddModal from "./AddModal";

import Editor from "./Editor";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { ApplicationState } from "../../../store/root/applicationState";
import { IPluginItem } from "../../../api/models/pluginInstance.model";

import { Dispatch } from "redux";
import { addNode } from "../../../store/feed/actions";
import { getPluginDetailsRequest } from "../../../store/plugin/actions";
import _ from "lodash";

interface AddNodeProps {
  selected?: IPluginItem;
  nodes?: IPluginItem[];
  addNode: (pluginItem: IPluginItem) => void;
}

interface AddNodeState {
  showOverlay: boolean;
  step: number;
  nodes: IPluginItem[];
  data: {
    plugin?: Plugin;
    parent?: IPluginItem;
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
      nodes: [],
      data: {},
      errors: [],
      input: ""
    };

    this.handleConfigureClick = this.handleConfigureClick.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handlePluginSelect = this.handlePluginSelect.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
  }

  componentDidMount() {
    this.convertData();
  }

  componentDidUpdate(prevProps: AddNodeProps) {
    const { selected, nodes } = this.props;

    if (prevProps.selected !== selected || !_.isEqual(prevProps.nodes, nodes)) {
      this.convertData();
    }
  }

  // Temporary. Converts IPluginItem to PluginInstance
  convertPluginInstance(pluginInstance: IPluginItem) {
    const client = ChrisAPIClient.getClient();
    return client.getPluginInstance(pluginInstance.id as number);
  }

  convertData() {
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
    const { step, data, showOverlay } = this.state;
    const { nodes, selected } = this.props;

    return (
      <React.Fragment>
        <Button
          variant="tertiary"
          isBlock
          onClick={this.handleAddClick}
          disabled={!this.props.selected}
        >
          <InfrastructureIcon />
          Add new node(s)...
        </Button>

        <AddModal
          footer={this.generateFooter()}
          showOverlay={showOverlay}
          handleModalClose={this.handleModalClose}
          step={step}
        >
          {step === 0 && selected && nodes ? (
            <ScreenOne
              selectedPlugin={data.plugin}
              parent={selected}
              nodes={nodes}
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

export default connect(mapStateToProps, mapDispatchToProps)(AddNode);
