import React, { Component } from "react";
import {
  TextArea,
  Expandable,
  Checkbox,
  Label,
  Alert,
  AlertActionCloseButton,
} from "@patternfly/react-core";
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
      isChecked: false,
      runtimeParam: "",
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDocsToggle = this.handleDocsToggle.bind(this);
    this.handleRuntimeParameters = this.handleRuntimeParameters.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  componentDidMount() {
    const { dropdownInput, requiredInput, runtimeInput } = this.props;

    let generatedCommand = "";
    let runtimeCommand = "";
    if (!isEmpty(requiredInput)) {
      generatedCommand += unpackParametersIntoString(requiredInput);
    }
    if (!isEmpty(dropdownInput)) {
      generatedCommand += unpackParametersIntoString(dropdownInput);
    }

    if (!isEmpty(runtimeInput)) {
      runtimeCommand += unpackParametersIntoString(runtimeInput);
      this.setState({
        runtimeParam: runtimeCommand,
        isChecked: true,
      });
    }
    this.setState({
      value: generatedCommand,
      runtimeParam: runtimeCommand,
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

  handleRuntimeParameters(value: string) {
    this.setState(
      {
        runtimeParam: value,
      },
      () => {
        this.handleRuntimeRegex(this.state.runtimeParam);
      }
    );
  }

  handleCheckboxChange(checkbox: boolean) {
    this.setState(
      {
        isChecked: checkbox,
      },
      () => {
        if (this.state.isChecked === false) {
          this.props.inputChangeFromRuntimeEditor({});
        }
      }
    );
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

  handleRuntimeRegex = (value: string) => {
    const { inputChangeFromRuntimeEditor } = this.props;
    let runtimeObject: InputType = {};
    let result: InputIndex = {};

    const tokens = this.handleGetTokens(value);
    for (const token of tokens) {
      const [_, _input, flag, editorValue] = token;
      if (editorValue) {
        const id = uuid();
        result[flag] = editorValue;
        runtimeObject[id] = result;
      }
    }

    inputChangeFromRuntimeEditor(runtimeObject);
  };

  render() {
    const { value, errors, isChecked, runtimeParam, docsExpanded } = this.state;
    const { params } = this.props;
    return (
      <div className="configuration">
        <div className="configuration__options">
          <h1 className="pf-c-title pf-m-2xl">
            Configure MPC Volume Calculation Plugin
          </h1>

          <div className="editor">
            <Label className="editor__label">Edit Plugin Configuration:</Label>
            <TextArea
              type="text"
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

          <Checkbox
            id="runtime-parameters"
            label="Add optional advanced docker parameters"
            aria-label="Checkbox with description example"
            isChecked={isChecked}
            onChange={this.handleCheckboxChange}
          />

          {isChecked === true && (
            <div className="runtime-parameters">
              <div className="errors">
                <ExclamationTriangleIcon />
                <span className="error-message">
                  Warning ! This is an advanced feature to add runtime
                  parameters to your plugin.
                </span>
              </div>

              <TextArea
                type="text"
                aria-label="text"
                className="runtime-parameters__text"
                resizeOrientation="vertical"
                onChange={this.handleRuntimeParameters}
                value={runtimeParam}
                spellCheck={false}
              />
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
