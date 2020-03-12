import React, { Component } from "react";
import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import GuidedConfig from "./GuidedConfig";
import Editor from "./Editor";
import { Switch } from "@patternfly/react-core";
import { CodeBranchIcon } from "@patternfly/react-icons";

interface SwitchConfigState {
  isChecked: boolean;
  params: PluginParameter[];
}

interface SwitchConfigProps {
  plugin: Plugin;
  onInputChange(flag: string, value: string): void;
  userInput: {
    [key: string]: string;
  };
}

class SwitchConfig extends Component<SwitchConfigProps, SwitchConfigState> {
  constructor(props: SwitchConfigProps) {
    super(props);
    this.state = {
      params: [],
      isChecked: true
    };
  }

  componentDidMount() {
    this.fetchParams();
  }

  componendDidUpdate(prevProps: SwitchConfigProps) {
    if (prevProps.plugin.data.id !== this.props.plugin.data.id) {
      this.fetchParams();
    }
  }

  async fetchParams() {
    const { plugin } = this.props;

    if (plugin) {
      const paramList = await plugin.getPluginParameters();
      const params = paramList.getItems();
      this.setState({
        params
      });
    }
  }

  handleChange = (isChecked: boolean) => {
    this.setState({ isChecked });
  };
  render() {
    const { isChecked, params } = this.state;
    const { onInputChange, userInput, plugin } = this.props;
    return (
      <div className="configure-container">
        <div className="configure-options">
          <h1 className="pf-c-title pf-m-2xl">
            Configure MPC Volume Calculation Plugin
          </h1>
          <Switch
            id="simple-switch"
            label="Guided configuration on. Click to disable"
            labelOff="Guided configuration off."
            isChecked={isChecked}
            onChange={this.handleChange}
          />
          {isChecked ? (
            <GuidedConfig
              userInput={userInput}
              params={params}
              inputChange={onInputChange}
              plugin={plugin}
            />
          ) : (
            <Editor />
          )}
        </div>
      </div>
    );
  }
}

export default SwitchConfig;
