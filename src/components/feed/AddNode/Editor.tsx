import React from "react";

import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import {
  TextInput,
  ActionGroup,
  Form,
  Button,
  Checkbox,
  Label
} from "@patternfly/react-core";

interface EditorState {
  errors: string[];
  params: PluginParameter[];
  userInput: {
    [key: string]: string | null;
  };
  checked: {
    [key: string]: boolean;
  };
  docsExpanded: boolean;
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
      params: [],
      docsExpanded: true,
      userInput: {},
      checked: {},
      errors: []
    };

    this.handleChange = this.handleChange.bind(this);
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
    //const paramString = this.generateDefaultParamString(params);
    this.setState({ params });
  }

  generateDefaultParamString(params: PluginParameter[]) {
    return params
      .map(param => `[${param.data.name} = ${param.data.default}] ;`)
      .join(" ");
  }

  handleChange(value: string, event: React.FormEvent<HTMLInputElement>) {
    event.persist();
    const target = event.target as HTMLInputElement;
    const name = target.name;

    this.setState({
      userInput: {
        ...this.state.userInput,
        [name]: value.trim()
      }
    });
  }

  handleCheckboxChange = (checked: boolean, data: any) => {
    this.setState({
      checked: {
        ...this.state.checked,
        [data.name]: checked
      }
    });
  };

  handleDocsToggle() {
    this.setState((prevState: EditorState) => ({
      docsExpanded: !prevState.docsExpanded
    }));
  }

  handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    const test = Object.keys(this.state.checked)
      .filter(checkbox => this.state.checked[checkbox])
      .map(checkbox => {
        return {
          [checkbox]: this.state.userInput[checkbox]
        };
      });

    this.props.handleCreate(test);
  }

  render() {
    const { params, checked, userInput } = this.state;
    const { handleBackClick, handleModalClose } = this.props;

    return (
      <div className="screen-two">
        <Form>
          <TextInput
            value={this.props.plugin.data.name}
            className="plugin-name"
            aria-label="Selected Plugin Name"
            spellCheck={false}
          />

          {params.map(param => {
            return (
              <React.Fragment key={param.data.help}>
                <div className="param-form">
                  <Checkbox
                    className="param-form-item-1"
                    key={param.data.id}
                    id={param.data.flag}
                    isChecked={checked[param.data.name]}
                    name={param.data.name}
                    onChange={isChecked =>
                      this.handleCheckboxChange(isChecked, param.data)
                    }
                    aria-label="controlled checkbox example"
                  />
                  <Label
                    className={`param-form-item-2 ${
                      checked[param.data.name] ? "approved" : "not-approved"
                    } `}
                  >
                    <b>{param.data.flag} </b>{" "}
                  </Label>
                  <TextInput
                    className="param-form-item-3"
                    key={param.data.name}
                    type="text"
                    placeholder={`${param.data.default}`}
                    onChange={this.handleChange}
                    aria-label="simple-form-name-helper"
                    value={userInput[param.data.name] || ""}
                    name={param.data.name}
                  />{" "}
                </div>

                <Label className="param-form-item-help">
                  <b>{param.data.help}</b>{" "}
                </Label>
              </React.Fragment>
            );
          })}

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
