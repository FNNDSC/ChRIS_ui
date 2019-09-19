import React from "react";
import { PluginInstance, Plugin } from "@fnndsc/chrisapi";

import {
  Dropdown,
  FormGroup,
  DropdownToggle,
  DropdownItem
} from "@patternfly/react-core";
import { getPluginInstanceDisplayName } from "../../../api/models/pluginInstance.model";
import PluginSelect from "./PluginSelect";

interface ScreenOneProps {
  nodes: PluginInstance[];
  parent: PluginInstance;
  selectedPlugin?: Plugin;

  handleParentSelect: (node: PluginInstance) => void;
  handlePluginSelect: (plugin: Plugin) => void;
}

interface ScreenOneState {
  parentDropdownOpen: boolean;
  typeDropdownOpen: boolean;
  nodes: PluginInstance[];
}

class ScreenOne extends React.Component<ScreenOneProps, ScreenOneState> {
  constructor(props: ScreenOneProps) {
    super(props);
    this.state = {
      parentDropdownOpen: false,
      typeDropdownOpen: false,
      nodes: []
    };

    this.handleParentDropdownToggle = this.handleParentDropdownToggle.bind(
      this
    );
    this.handleTypeDropdownToggle = this.handleTypeDropdownToggle.bind(this);
  }

  /* EVENT LISTENERS */

  handleParentDropdownToggle(open: boolean) {
    this.setState({ parentDropdownOpen: open });
  }

  handleTypeDropdownToggle(open: boolean) {
    this.setState({ typeDropdownOpen: open });
  }

  /* UI GENERATORS */

  generateParentDropdown() {
    const { nodes, parent, handleParentSelect } = this.props;

    const dropdownItems = nodes.map(node => {
      const name = getPluginInstanceDisplayName(node);
      const isSelected = node.data.id === parent.data.id;
      return (
        <DropdownItem
          onClick={() => handleParentSelect(node)}
          key={node.data.id}
          isHovered={isSelected}
        >
          {name}
        </DropdownItem>
      );
    });

    const toggle = (
      <DropdownToggle onToggle={this.handleParentDropdownToggle}>
        {getPluginInstanceDisplayName(parent)}
      </DropdownToggle>
    );

    return (
      <Dropdown
        toggle={toggle}
        dropdownItems={dropdownItems}
        isOpen={this.state.parentDropdownOpen}
        onSelect={() => this.handleParentDropdownToggle(false)}
      />
    );
  }

  // Currently, only the plugin item is selectable, so the value is not stored in the state
  generateTypeDropdown() {
    const pluginItems = [
      <DropdownItem key={0} isHovered>
        Plugin
      </DropdownItem>,
      <DropdownItem key={1} isDisabled>
        Pipeline
      </DropdownItem>
    ];
    const toggle = (
      <DropdownToggle onToggle={this.handleTypeDropdownToggle}>
        Plugin
      </DropdownToggle>
    );

    return (
      <Dropdown
        toggle={toggle}
        dropdownItems={[pluginItems]}
        isOpen={this.state.typeDropdownOpen}
        onSelect={() => this.handleTypeDropdownToggle(false)}
      />
    );
  }

  render() {
    const { selectedPlugin, handlePluginSelect } = this.props;

    return (
      <div className="screen-one">
        <FormGroup label="Parent node:" fieldId="parent-node">
          {this.generateParentDropdown()}
        </FormGroup>

        <FormGroup label="Type of node(s) to add:" fieldId="type">
          {this.generateTypeDropdown()}
        </FormGroup>

        <FormGroup label="Select plugin to add:" fieldId="plugin">
          <PluginSelect
            selected={selectedPlugin}
            handlePluginSelect={handlePluginSelect}
          />
        </FormGroup>
      </div>
    );
  }
}

export default ScreenOne;
