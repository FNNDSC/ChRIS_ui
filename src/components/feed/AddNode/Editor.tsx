import React, { Component } from "react";
import { TextArea, Expandable, Checkbox, Label } from "@patternfly/react-core";
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
import { Plugin } from "@fnndsc/chrisapi";

class Editor extends Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      value: "",
      docsExpanded: true,
      errors: [],
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDocsToggle = this.handleDocsToggle.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  componentDidMount() {
    const { dropdownInput, requiredInput, plugin } = this.props;
    this.generateCommand(dropdownInput, requiredInput, plugin);
  }

  generateCommand(
    dropdownInput: InputType,
    requiredInput: InputType,
    plugin: Plugin
  ) {
    let generatedCommand = `${plugin.data.name}: `;

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

  handleDocsToggle() {
    this.setState({
      docsExpanded: !this.state.docsExpanded,
    });
  }

  handleInputChange(value: string) {
    this.setState(
      {
        value,
      },
      () => {
        this.handleRegex(this.state.value);
      }
    );
  }

  handleCheckboxChange(checkbox: boolean) {
    const { handleRuntimeChecked } = this.props;
    handleRuntimeChecked(checkbox);
  }

  handleGetTokens(value: string) {
    const tokenRegex = /(--(?<option>.+?)\s+(?<value>.(?:[^-].+?)?(?:(?=--)|$))?)+?/gm;
    return [...matchAll(value, tokenRegex)];
  }

  handleRegex(value: string) {
    const { inputChangeFromEditor, params } = this.props;

    const requiredParamsWithId = params && getRequiredParamsWithId(params);
    const requiredParams = params && getRequiredParams(params);
    const allParams = params && getAllParamsWithName(params);

    const tokens = this.handleGetTokens(value);

    // Creating required and dropdown objects based on User input
    // If the user navigates to the form, the DOM will be re-created.

    let dropdownObject: InputType = {};
    let requiredObject: InputType = {};

    let errorCompilation: string[] = [];

    for (const token of tokens) {
      //eslint-disable-next-line
      const [_, _input, flag, editorValue] = token;

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
    const { value, errors, docsExpanded } = this.state;
    const { params, runtimeChecked, plugin } = this.props;

    return (
      <div className="configuration">
        <div className="configuration__options">
          <h1 className="pf-c-title pf-m-2xl">
            Configure MPC Volume Calculation Plugin
          </h1>

          <div className="editor">
            <Label className="editor__label">Edit Plugin Configuration:</Label>
            <TextArea
              aria-label="text"
              className="editor__text"
              resizeOrientation="vertical"
              onChange={this.handleInputChange}
              value={value}
              spellCheck={false}
            />
          </div>

          <div className="errors">
            {errors.map((error, i) => (
              <div key={i}>
                <ExclamationTriangleIcon />
                <span className="error-message">{error}</span>
              </div>
            ))}
          </div>

          {plugin.data.compute_resource_identifier === "host" && (
            <div className="runtime-parameters">
              <Checkbox
                id="runtime-parameters"
                aria-label="Checkbox with description "
                isChecked={runtimeChecked}
                onChange={this.handleCheckboxChange}
              />
              <Label className="runtime-parameters__label">
                Enable GPU Processing (toggles{" "}
                <pre className="runtime-parameters__flag">--runtime nvidia</pre>{" "}
                on the docker executable)
              </Label>
            </div>
          )}
          {runtimeChecked === true && (
            <div className="errors">
              <ExclamationTriangleIcon />
              <span className="error-message">
                Warning: This has no effect on plugins run on OpenShift
              </span>
            </div>
          )}

          <Expandable
            className="docs"
            toggleText="Plugin configuration documentation:"
            isExpanded={docsExpanded}
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
