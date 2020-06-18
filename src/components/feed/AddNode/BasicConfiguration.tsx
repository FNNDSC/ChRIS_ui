import React from "react";
import {
  Dropdown,
  FormGroup,
  DropdownToggle,
  DropdownItem,
  TextInput,
} from "@patternfly/react-core";
import PluginSelect from "./PluginSelect";

import { BasicConfigurationProps, BasicConfigurationState } from "./types";

class BasicConfiguration extends React.Component<
  BasicConfigurationProps,
  BasicConfigurationState
> {
  constructor(props: BasicConfigurationProps) {
    super(props);
    this.state = {
      parentDropdownOpen: false,
      typeDropdownOpen: false,
      nodes: [],
    };

    this.handleTypeDropdownToggle = this.handleTypeDropdownToggle.bind(this);
  }

  handleTypeDropdownToggle(open: boolean) {
    this.setState({ typeDropdownOpen: open });
  }

  /* UI GENERATORS */

  // Currently, only the plugin item is selectable, so the value is not stored in the state
  generateTypeDropdown() {
    const pluginItems = [
      <DropdownItem key={0} isHovered>
        Plugin
      </DropdownItem>,
      <DropdownItem key={1} isDisabled>
        Pipeline
      </DropdownItem>,
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
    const { selectedPlugin, handlePluginSelect, parent } = this.props;

    return (
      <div className="screen-one">
        <h1 className="pf-c-title pf-m-2xl">Plugin Selection</h1>
        <FormGroup label="Parent node:" fieldId="parent-node">
          <TextInput
            value={parent.data.plugin_name}
            aria-label="Selected Plugin Name"
          />
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

export default BasicConfiguration;
