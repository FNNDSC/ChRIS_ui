import React, { Component } from "react";
import { TextArea, Expandable } from "@patternfly/react-core";
import matchAll from "string.prototype.matchall";
import { PluginParameter, Plugin } from "@fnndsc/chrisapi";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";

interface EditorState {
  value: string;
  docsExpanded: boolean;
}

interface EditorProps {
  plugin: Plugin;
  params?: PluginParameter[];
  editorInput(input: {}): void;
  editorState: {
    [key: string]: string;
  };
}

class Editor extends Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      value: "",
      docsExpanded: true,
    };
  }

  componentDidMount() {
    const { editorState } = this.props;

    let result = "";

    if (editorState) {
      for (let inputString in editorState) {
        const value = editorState[inputString];

        if (value) {
          result += `--${inputString} ${value} `;
        }
      }

      this.setState({
        value: result,
      });
    }
  }

  handleDocsToggle = () => {
    this.setState({
      docsExpanded: !this.state.docsExpanded,
    });
  };

  handleInputChange = (value: string) => {
    this.setState(
      (prevState) => ({
        value,
      }),
      () => {
        this.handleRegex();
      }
    );
  };

  handleRegex() {
    const { editorInput } = this.props;
    const tokenRegex = /(--(?<option>.+?)\s+(?<value>.(?:[^-].+?)?(?:(?=--)|$))?)+?/gm;
    const tokens = [...matchAll(this.state.value, tokenRegex)];
    let result: any = {};

    for (const token of tokens) {
      const [_, input, flag, value] = token;
      result[flag] = value && value.trim();
    }
    console.log("Result", result);

    editorInput(result);
  }

  render() {
    const { value } = this.state;
    const { params } = this.props;
    return (
      <div className="configure-container">
        <div className="configure-options">
          <h1 className="pf-c-title pf-m-2xl">
            Configure MPC Volume Calculation Plugin
          </h1>
          <TextArea
            type="text"
            aria-label="text"
            className="editor"
            resizeOrientation="vertical"
            onChange={this.handleInputChange}
            value={value}
            spellCheck={false}
          />
          <div className="errors">
            <div>
              <ExclamationTriangleIcon />
              <span className="error-message">
                You will loose your changes if you go back.
              </span>
            </div>
          </div>

          <Expandable
            className="docs"
            toggleText="Plugin configuration documentation:"
            isExpanded={this.state.docsExpanded}
            onToggle={this.handleDocsToggle}
          >
            {params &&
              params
                .filter((param) => param.data.ui_exposed)
                .map((param) => {
                  return (
                    <div key={param.data.id} className="param-item">
                      <b className="param-title">[--{param.data.name}]</b>
                      {!param.data.optional && (
                        <span className="required-star"> *</span>
                      )}
                      <div className="param-help">{param.data.help}</div>
                    </div>
                  );
                })}
          </Expandable>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state: ApplicationState) => ({
  params: state.plugin.parameters,
});

export default connect(mapStateToProps, null)(Editor);
