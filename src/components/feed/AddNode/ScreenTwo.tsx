import React from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import matchAll from "string.prototype.matchall";

import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import { Expandable, TextInput } from "@patternfly/react-core";
import { ExclamationTriangleIcon, ThemeisleIcon } from "@patternfly/react-icons";
import ParameterEditor from "./ParameterEditor";

interface ScreenTwoProps {
  plugin: Plugin;
}

interface ScreenTwoState {
  paramString: string;
  params: PluginParameter[];
  docsExpanded: boolean;
  errors: string[];
}

class ScreenTwo extends React.Component<ScreenTwoProps, ScreenTwoState> {
  contentEditable: React.RefObject<HTMLElement> = React.createRef();
  range: Range = new Range();

  constructor(props: ScreenTwoProps) {
    super(props);
    this.state = {
      paramString: "",
      params: [],
      docsExpanded: true,
      errors: []
    };

    this.handleDocsToggle = this.handleDocsToggle.bind(this);
    this.handleErrorChange = this.handleErrorChange.bind(this);
  }

  componentDidMount() {
    this.fetchParams();
  }

  componentDidUpdate(prevProps: ScreenTwoProps) {
    if (prevProps.plugin.data.id !== this.props.plugin.data.id) {
      this.fetchParams();
    }
  }

  async fetchParams() {
    const { plugin } = this.props;
    const paramList = await plugin.getPluginParameters();
    const params = paramList.getItems();
    console.log("Displaying params", params);

    const paramString = this.generateDefaultParamString(params);
    this.setState({ params, paramString });
  }

  handleErrorChange(errors: string[]) {
    this.setState({ errors });
  }

  /*handle Parameter Change*/

  handleParameterChange() {
    this.setState({
      params: []
    });
  }

  handleDocsToggle() {
    this.setState((prevState: ScreenTwoState) => ({
      docsExpanded: !prevState.docsExpanded
    }));
  }

  generateDefaultParamString(params: PluginParameter[]) {
    return params
      .map(param => `${param.data.flag} ${param.data.default}`)
      .join(" ");
  }

  render() {
    const { params, paramString, errors } = this.state;

    return (
      <div className="screen-two">
        <TextInput
          value={this.props.plugin.data.name}
          className="plugin-name"
          aria-label="Selected Plugin Name"
          spellCheck={false}
        />

        <ParameterEditor
          initialParamString={paramString}
          params={params}
          handleErrorChange={this.handleErrorChange}
          handleParameterChange={this.handleParameterChange}
        />

        <div className="errors">
          {errors.map((error, i) => (
            <div key={i}>
              <ExclamationTriangleIcon />
              <span className="error-message">{error}</span>
            </div>
          ))}
        </div>
        <Expandable
          className="docs"
          toggleText="Plugin configuration documentation:"
          isExpanded={this.state.docsExpanded}
          onToggle={this.handleDocsToggle}
        >
          {this.state.params
            .filter(param => param.data.ui_exposed)
            .map(param => {
              return (
                <div key={param.data.id} className="param-item">
                  <b className="param-title">
                    [{param.data.flag} &lt;{param.data.name}&gt;]
                  </b>
                  {!param.data.optional && (
                    <span className="required-star"> *</span>
                  )}
                  <div className="param-help">{param.data.help}</div>
                </div>
              );
            })}
        </Expandable>
      </div>
    );
  }
}

export default ScreenTwo;
