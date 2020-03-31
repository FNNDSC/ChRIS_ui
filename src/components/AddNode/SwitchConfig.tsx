import React, { Component } from "react";
import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import GuidedConfig from "./GuidedConfig";
import Editor from "./Editor";
import { Switch } from "@patternfly/react-core";
import SimpleDropdown from "./SimpleDropdown";
import _ from "lodash";
interface SwitchConfigState {
  isChecked: boolean;
  params: PluginParameter[];
  componentList: number;
  testInput: {
    [key: number]: {
      [key: string]: string;
    };
  };
}

interface SwitchConfigProps {
  plugin: Plugin;
  onInputChange(id: number, paramName: string, value: string): void;
  userInput: {
    [key: number]: {
      [key: string]: string;
    };
  };
  editorInput(input: {}): void;
  deleteInput(input: string): void;
  editorState: {
    [key: string]: string;
  };
}

class SwitchConfig extends Component<SwitchConfigProps, SwitchConfigState> {
  constructor(props: SwitchConfigProps) {
    super(props);
    this.state = {
      params: [],
      isChecked: true,
      componentList: 0,
      testInput: {}
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

  componentWillReceiveProps(nextProps: SwitchConfigProps) {
    this.setState({
      testInput: nextProps.userInput
    });
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

  handleAddComponent = () => {
    const { componentList } = this.state;

    this.setState({
      componentList: componentList + 1
    });
  };

  deleteComponent = () => {
    const { componentList } = this.state;
    this.setState({
      componentList: componentList - 1
    });
  };

  render() {
    const { isChecked, params, componentList, testInput } = this.state;
    const {
      onInputChange,

      plugin,
      deleteInput,
      editorInput,
      editorState
    } = this.props;

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
              userInput={testInput}
              params={params}
              inputChange={onInputChange}
              plugin={plugin}
              deleteInput={deleteInput}
              handleAddComponent={this.handleAddComponent}
              componentList={componentList}
              deleteComponent={this.deleteComponent}
            />
          ) : (
            <Editor editorInput={editorInput} editorState={editorState} />
          )}
        </div>
      </div>
    );
  }
}

export default SwitchConfig;
