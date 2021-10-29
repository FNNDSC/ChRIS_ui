import React from "react";
import { FormGroup, TextInput, Title } from "@patternfly/react-core";
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

  render() {
    const { selectedPlugin, handlePluginSelect, parent } = this.props;

    const value = parent.data.title || parent.data.plugin_name;
     
    
    return (
      <div className="screen-one">
        <Title headingLevel="h1">Plugin Selection</Title>
        <FormGroup label="Parent node:" fieldId="parent-node">
          <TextInput
            value={`${value} v.${parent.data.plugin_version}`}
            aria-label="Selected Plugin Name"
          />
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
