import React, { Component } from "react";
import { TextArea, ExpandableSection, Label } from "@patternfly/react-core";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { isEmpty } from "lodash";

import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { InputType } from "./types";
import { EditorState, EditorProps } from "./types";
import {
  unpackParametersIntoString,
  getRequiredParams,
  getAllParamsWithName,
  getRequiredParamsWithName
} from "./lib/utils";
import { Plugin,  } from "@fnndsc/chrisapi";

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

  handleGetTokens(value: string) {
    let test: { [key: string]: string }[] = [];
    let errors:string[] = [];
    let paramDict: {
      [key: string]: {
        [key:string]:string
      }
    } = {};

    const userValue = value.trim().split(" ").slice(1);
    const { params } = this.props;

    if (params && params.length > 0) {
      test = params.map((param) => {
        return {
          id:`${param.data.id}`,
          flag: param.data.flag,
          type: param.data.type,
          placeholder:param.data.help
        };
      });
    }

    
    let paramFlags  = params && params.map(param =>  param.data.flag)

    if (userValue.length > 0) {  
      for (let i = 0; i <= userValue.length; i++) {
        const flag = userValue[i];
        let value = userValue[i + 1];
       

        test.forEach((param) => {
          if (param.flag === flag) {
            if (
              !value ||
              ((value.startsWith("--") || value.startsWith("-")) &&
                (paramFlags && paramFlags.includes(value)))
            ) {
              paramDict[flag] = {
                value:'',
                id:param.id,
                placeholder:param.placeholder,
                type:param.type
              }       
            } else if (param.type === "boolean" && value) {
              paramDict[flag] = {
                value:'',
                id:param.id,
                placeholder:param.placeholder,
                type:param.type
              }
              errors.push(
                `Please don't provide values for boolean flag ${param.flag}`
              );
            } else {
              paramDict[flag] = {
                value,
                id:param.id,
                placeholder:param.placeholder,
                type:param.type
              }   
            }
          }
        });
      }
    }
    

    return {paramDict, errors};
  }

  handleRegex(value: string) {
    const { inputChangeFromEditor, params } = this.props;
    const requiredParams = params && getRequiredParams(params);
    const {paramDict, errors}= this.handleGetTokens(value);
   

    
    let dropdownObject: InputType = {};
    let requiredObject: InputType = {};

    for (let token in paramDict) {
      const id = paramDict[token].id;
      const editorValue=paramDict[token].value;
      const flag = token;
      const type=paramDict[token].type;
      const placeholder=paramDict[token].placeholder;
      if (requiredParams && requiredParams.length>0 && requiredParams.includes(flag)) {
        const value =
          params && getRequiredParamsWithName(flag, editorValue,type,placeholder);
        if (value) requiredObject[id] = value;
      } else {
        const value = params && getAllParamsWithName(flag, editorValue,type,placeholder);
        if (value) dropdownObject[id] = value;
      }
    }

   inputChangeFromEditor(dropdownObject, requiredObject);
  }

  render() {
    const { value, errors, docsExpanded } = this.state;
    const { params, plugin } = this.props;

    return (
      <div className="configuration">
        <div className="configuration__options">
          <h1 className="pf-c-title pf-m-2xl">
            {`Configure ${plugin?.data.name}`}
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

          <ExpandableSection
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
                      <b className="param-title">[{param.data.flag}]</b>
                      {!param.data.optional && (
                        <span className="required-star"> *</span>
                      )}
                      <div className="param-help">{param.data.help}</div>
                    </div>
                  );
                })}
          </ExpandableSection>
        </div>
      </div>
    );
  }
}
const mapStateToProps = ({ plugin }: ApplicationState) => ({
  params: plugin.parameters,
});

export default connect(mapStateToProps, null)(Editor);
