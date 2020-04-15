import React, { Component } from "react";
import { TextArea, Expandable } from "@patternfly/react-core";
import matchAll from "string.prototype.matchall";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { isEmpty } from "lodash";
import { uuid } from "uuidv4";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { InputType, InputIndex } from "./types";
import { EditorState, EditorProps } from "./types";
import {
  unpackParametersIntoString,
  getRequiredParams,
  getAllParamsWithName,
  getRequiredParamsWithId,
} from "./lib/utils";

class Editor extends Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      value: "",
      docsExpanded: true,
      errors: [],
    };
  }

  componentDidMount() {
    const { dropdownInput, requiredInput } = this.props;
    let generatedCommand = "";
    if (!isEmpty(requiredInput)) {
      generatedCommand += unpackParametersIntoString(requiredInput);
    }
    if (!isEmpty(dropdownInput)) {
      generatedCommand += unpackParametersIntoString(dropdownInput);
    }

    this.setState({
      value: generatedCommand,
    });
  }

  handleDocsToggle = () => {
    this.setState({
      docsExpanded: !this.state.docsExpanded,
    });
  };

  handleInputChange = (value: string) => {
    this.setState(
      {
        value,
      },
      () => {
        this.handleRegex();
      }
    );
  };

  handleRegex() {
    const { inputChangeFromEditor, params } = this.props;

    const requiredParamsWithId = params && getRequiredParamsWithId(params);
    const requiredParams = params && getRequiredParams(params);
    const allParams = params && getAllParamsWithName(params);

    const tokenRegex = /(--(?<option>.+?)\s+(?<value>.(?:[^-].+?)?(?:(?=--)|$))?)+?/gm;
    const tokens = [...matchAll(this.state.value, tokenRegex)];

    // Creating required and dropdown objects based on User input
    // If the user navigates to the form, the DOM will be re-created.

    let dropdownObject: InputType = {};
    let requiredObject: InputType = {};
    let errorCompilation: string[] = [];

    for (const token of tokens) {
      const [_, input, flag, editorValue] = token;

      let result: InputIndex = {};

      if (allParams && !allParams.includes(flag)) {
        let errorString = `-- ${flag} is not a valid parameter`;
        errorCompilation.push(errorString);
      }
      if (
        requiredParamsWithId &&
        requiredParams &&
        requiredParams.includes(flag)
      ) {
        for (let param of requiredParamsWithId) {
          if (param && param.split("_")[0] === flag) {
            const id = param.split("_")[1];
            result[flag] = editorValue && editorValue.trim();
            requiredObject[id] = result;
          }
        }
      } else if (allParams && allParams.includes(flag) && editorValue) {
        const id = uuid();
        result[flag] = editorValue.trim();
        dropdownObject[id] = result;
      }
    }

    this.setState({
      errors: errorCompilation,
    });

    inputChangeFromEditor(dropdownObject, requiredObject);
  }

  render() {
    const { value, errors } = this.state;

    const { params } = this.props;
    return (
      <div className="configuration">
        <div className="configuration__options">
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
const mapStateToProps = ({ plugin }: ApplicationState) => ({
  params: plugin.parameters,
});

export default connect(mapStateToProps, null)(Editor);
