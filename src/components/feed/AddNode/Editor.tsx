import React, { SyntheticEvent } from "react";
import matchall from "string.prototype.matchall";

import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import {
  Expandable,
  TextInput,
  ActionGroup,
  Form,
  FormGroup,
  Button
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";

interface Data {
  [key: string]: string | null;
}

function objectify(key: string, value: string = "null") {
  let obj = {} as Data;

  obj[key] = value;
  return obj;
}

const validate = (
  paramString: string,
  params: PluginParameter[]
): [string[], {}] => {
  const tokenRegex = /([^\s=]+)(?:(?:=|\s+|[^--])([^ --][\w,]+))?/g;
  const errors = [];
  let data = [];

  const tokens = [...matchall(paramString, tokenRegex)];

  for (const token of tokens) {
    const [_, flag, value] = token;

    const paramName = flag.replace(/-/g, "");
    const validParam = params.find(param => param.data.flag === flag);

    if (!validParam) {
      errors.push(`${paramName} is not a valid Parameter name`);
    } else {
      data.push(objectify(paramName, value));
    }
  }
  return [errors, data];
};

interface EditorState {
  paramString: string;
  errors: string[];
  params: PluginParameter[];
  docsExpanded: boolean;
}
interface PluginData {
  data: [
    {
      [key: string]: string;
    }
  ];
}

interface EditorProps {
  plugin: Plugin;
  handleModalClose: () => void;
  handleCreate: (data: any) => void;
  handleBackClick: () => void;
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

    this.handleInput = this.handleInput.bind(this);
    this.handleDocsToggle = this.handleDocsToggle.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  handleInput(paramString: string) {
    this.setState({
      paramString
    });
  }

  handleDocsToggle() {
    this.setState((prevState: EditorState) => ({
      docsExpanded: !prevState.docsExpanded
    }));
  }

  handleSubmit() {
    const { paramString, params } = this.state;
    const { handleCreate } = this.props;

    const [errors, data] = validate(paramString, params);
    if (errors !== null && errors.length > 0) {
      this.setState({
        errors
      });
      setTimeout(() => {
        this.setState({
          errors: []
        });
      }, 5000);
    } else {
      handleCreate(data);
    }
  }

  render() {
    const { params, paramString, errors, docsExpanded } = this.state;
    const { handleBackClick, handleModalClose } = this.props;

    return (
      <div className="screen-two">
        <Form>
          <FormGroup fieldId="selected-plugin" label="Selected Plugin:">
            <TextInput
              value={this.props.plugin.data.name}
              className="plugin-name"
              aria-label="Selected Plugin Name"
              spellCheck={false}
            />
          </FormGroup>

          <FormGroup fieldId="parameter-input" label="Plugin Configuration:">
            <TextInput
              type="text"
              value={paramString}
              onChange={this.handleInput}
              className="plugin-input"
              aria-label="Plugin Parameters"
            />
          </FormGroup>

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
            {params
              .filter(param => param.data.ui_exposed)
              .map(param => {
                return (
                  <div key={param.data.id} className="param-item">
                    <b className="param-title">
                      [{param.data.flag} &lt;{param.data.type} :{" "}
                      {param.data.name}
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
          <ActionGroup>
            <Button onClick={this.handleSubmit}>Add a Node</Button>
            <Button onClick={() => handleModalClose()}>Cancel</Button>
            <Button onClick={() => handleBackClick()}>Back</Button>
          </ActionGroup>
        </Form>
      </div>
    );
  }
}
export default Editor;
