import React, { SyntheticEvent } from "react";
import matchall from "string.prototype.matchall";

import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import { Expandable, TextInput } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";

interface Data {
  param: string;
}

const validate = (
  paramString: string,
  params: PluginParameter[]
): [string[], {}] => {
  const tokenRegex = /([^\s=]+)(?:(?:=|\s+|[^--])([^ --]+))?/g;
  const errors = [];
  let data = {} as Data;

  const tokens = [...matchall(paramString, tokenRegex)];

  for (const token of tokens) {
    const [_, flag, value] = token;

    const paramName = flag.replace(/-/g, "");
    const validParam = params.find(param => param.data.flag.startsWith(flag));

    if (!validParam) {
      errors.push(`${paramName} is not a valid Parameter name`);
    } else {
      const param = validParam.data.flag;
      data.param = value;
    }
    console.log("Displaying Data", data);
  }
  return [errors, data];
};

/* NOTE: The string parsing is done "outside" of react 
   (not using state, etc.) to enable selection restoration 
  */

interface EditorState {
  paramString: string;
  errors: string[];
  params: PluginParameter[];
  docsExpanded: boolean;
}

interface EditorProps {
  plugin: Plugin;
}

class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      paramString: "",
      params: [],
      errors: [],
      docsExpanded: true
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleDocsToggle = this.handleDocsToggle.bind(this);
  }

  componentDidMount() {
    this.fetchParams();
  }

  componendDidUpdate(prevProps: EditorProps) {
    if (prevProps.plugin.data.id !== this.props.plugin.data.id) {
      this.fetchParams();
    }
  }

  async fetchParams() {
    const { plugin } = this.props;
    const paramList = await plugin.getPluginParameters();
    const params = paramList.getItems();
    const paramString = this.generateDefaultParamString(params);
    this.setState({ params, paramString });
  }

  generateDefaultParamString(params: PluginParameter[]) {
    return params
      .map(param => `${param.data.flag} ${param.data.default}`)
      .join(" ");
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { paramString, params } = this.state;
    const [errors, data] = validate(paramString, params);
    console.log("Errors", errors);
    if (errors) {
      this.setState({
        errors
      });
    }
  }

  handleInput(e: React.FormEvent<HTMLInputElement>) {
    const { value } = e.target as HTMLInputElement;
    this.setState({
      paramString: value
    });
  }

  handleDocsToggle() {
    this.setState((prevState: EditorState) => ({
      docsExpanded: !prevState.docsExpanded
    }));
  }

  render() {
    const { params, paramString, errors, docsExpanded } = this.state;

    return (
      <div className="screen-two">
        <TextInput
          value={this.props.plugin.data.name}
          className="plugin-name"
          aria-label="Selected Plugin Name"
          spellCheck={false}
        />
        <form onSubmit={this.handleSubmit}>
          <input type="text" value={paramString} onChange={this.handleInput} />
        </form>
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
          isExpanded={docsExpanded}
          onToggle={this.handleDocsToggle}
        >
          {this.state.params
            .filter(param => param.data.ui_exposed)
            .map(param => {
              return (
                <div key={param.data.id} className="param-item">
                  <b className="param-title">
                    [{param.data.flag} &lt;{param.data.type} : {param.data.name}
                    &gt;]
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
export default Editor;
