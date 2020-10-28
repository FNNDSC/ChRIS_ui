import React from "react";
import { FormGroup, TextInput } from "@patternfly/react-core";
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

    return (
      <div className="screen-one">
        <h1 className="pf-c-title pf-m-2xl">Plugin Selection</h1>
        <FormGroup label="Parent node:" fieldId="parent-node">
          <TextInput
            style={{
              letterSpacing: "0.02em",
              fontSize: "18px",
            }}
            value={parent.data.plugin_name}
            aria-label="Selected Plugin Name"
          />
        </FormGroup>

        <FormGroup
        label="Select plugin to add:" fieldId="plugin">
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
