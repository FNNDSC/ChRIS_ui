import React from "react";
import { connect } from "react-redux";

import { Button } from "@patternfly/react-core";
import {
  InfrastructureIcon,
  CloseIcon,
  CodeBranchIcon
} from "@patternfly/react-icons";

import "./addnode.scss";
import { Plugin, PluginInstance } from "@fnndsc/chrisapi";
import AddNodeModal from "./AddNodeModal";
import ScreenOne from "./ScreenOne";
import ScreenTwo from "./ScreenTwo";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { ApplicationState } from "../../../store/root/applicationState";
import { IPluginItem } from "../../../api/models/pluginInstance.model";

interface AddNodeProps {
  selected?: IPluginItem;
  nodes?: IPluginItem[];
}

interface AddNodeState {
  open: boolean;
  step: number;
  nodes?: PluginInstance[]; // converted props.nodes
  data: {
    parent?: PluginInstance;
    plugin?: Plugin;
  };
}

class AddNode extends React.Component<AddNodeProps, AddNodeState> {
  constructor(props: AddNodeProps) {
    super(props);
    this.state = {
      open: false,
      step: 0,
      data: {}
    };

    this.handleConfigureClick = this.handleConfigureClick.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handlePluginSelect = this.handlePluginSelect.bind(this);
    this.handleParentSelect = this.handleParentSelect.bind(this);
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
      open: !prevState.open
    }));
  }

  async handleModalClose() {
    this.setState({
      open: false,
      step: 0,
      data: {}
    });

    /* Writing the code to add a node to the backend here */
    console.log("Add node clicked");
    console.log("Starting creation process...");
    const { plugin } = this.state.data;
    const { selected } = this.props;

    if (!plugin || !selected) {
      console.log("Some stuff does not exist rip");
      return;
    }
    const client = ChrisAPIClient.getClient();
    const pluginId = plugin.data.id;

    await client.createPluginInstance(pluginId, {
      title: "TEST",
      previous_id: selected.id as number,
      //ageSpec:"10-06-01"
    });
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

  generateFooter() {
    const { step, data } = this.state;
    return step === 0 ? (
      <Button onClick={this.handleConfigureClick} isDisabled={!data.plugin}>
        <CodeBranchIcon />
        Configure new node...
      </Button>
    ) : (
      <>
        <Button variant="link" onClick={this.handleModalClose}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={this.handleBackClick}>
          Back
        </Button>

        <Button onClick={this.handleModalClose}>
          <CodeBranchIcon />
          Add new node
        </Button>
      </>
    );
  }

  handleCreate = async () => {
    console.log("Starting creation process...");
    const { plugin } = this.state.data;
    const { selected } = this.props;

    if (!plugin || !selected) {
      console.log("Some stuff does not exist rip");
      return;
    }
    const client = ChrisAPIClient.getClient();
    const pluginId = plugin.data.id;

    await client.createPluginInstance(pluginId, {
      title: "TEST",
      previous_id: selected.id as number
    });
  };

  render() {
    const { open, step, nodes, data } = this.state;

    return (
      <React.Fragment>
        <Button variant="tertiary" isBlock onClick={this.handleAddClick}>
          <InfrastructureIcon />
          Add new node(s)...
        </Button>

        <AddNodeModal
          open={open}
          handleModalClose={this.handleCreate}
          footer={this.generateFooter()}
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
            data.plugin && <ScreenTwo plugin={data.plugin} />
          )}
        </AddNodeModal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  selected: state.plugin.selected,
  nodes: state.feed.items
});

export default connect(mapStateToProps)(AddNode);
