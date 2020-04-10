import React, { Component } from "react";
import { TextArea, Expandable } from "@patternfly/react-core";
import matchAll from "string.prototype.matchall";
import { PluginParameter, Plugin } from "@fnndsc/chrisapi";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import _ from "lodash";
import { uuid } from "uuidv4";

interface EditorState {
  value: string;
  docsExpanded: boolean;
}

interface EditorProps {
  plugin: Plugin;
  params?: PluginParameter[];
  inputChange(
    id: string,
    paramName: string,
    value: string,
    required: boolean
  ): void;
  dropdownInput: {
    [key: number]: {
      [key: string]: string;
    };
  };
  requiredInput: {
    [key: number]: {
      [key: string]: string;
    };
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
    const { dropdownInput, requiredInput } = this.props;
    console.log("DropdownInput,requiredInput", dropdownInput, requiredInput);

    let test = {
      ...dropdownInput,
      ...requiredInput,
    };
    let test1: { [key: string]: string } = {};

    for (let object in test) {
      const flag = Object.keys(test[object])[0];
      const value = test[object][flag];
      test1[flag] = value;
    }

    let finalTest = {
      ...test1,
    };

    let result = "";

    if (finalTest) {
      for (let inputString in finalTest) {
        const value = finalTest[inputString];

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
    const { inputChange, params, dropdownInput } = this.props;

    const requiredParams =
      params &&
      params.map((param) => {
        if (param.data.optional === false)
          return `${param.data.name}_${param.data.id}`;
      });

    const tokenRegex = /(--(?<option>.+?)\s+(?<value>.(?:[^-].+?)?(?:(?=--)|$))?)+?/gm;
    const tokens = [...matchAll(this.state.value, tokenRegex)];

    for (const token of tokens) {
      const [_, input, flag, editorValue] = token;

      if (requiredParams) {
        for (let param of requiredParams) {
          if (param && param.split("_")[0] === flag) {
            const id = param.split("_")[1];
            inputChange(id, flag, editorValue, true);
          }
        }
      }

      if (Object.keys(dropdownInput).length > 0) {
        for (let id in dropdownInput) {
          let existingId = Object.keys(dropdownInput)[0];
          let existingFlag = dropdownInput[id][existingId];
          if (flag === existingFlag) {
            inputChange(existingId, flag, editorValue, false);
          }
        }
      }
    }
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
