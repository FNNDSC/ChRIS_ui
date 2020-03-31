import React, { Component } from "react";
import { TextArea } from "@patternfly/react-core";
import matchAll from "string.prototype.matchall";

interface EditorState {
  value: string;
}

interface EditorProps {
  editorInput(input: {}): void;
  editorState: {
    [key: string]: string;
  };
}

class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      value: ""
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
        value: result
      });
    }
  }

  handleInputChange = (value: string) => {
    this.setState(
      prevState => ({
        value
      }),
      () => {
        this.handleRegex();
      }
    );
  };

  handleRegex() {
    const { value } = this.state;
    const { editorInput } = this.props;
    const tokenRegex = /(--(?<option>.+?)\s+(?<value>.(?:[^-].+?)?(?:(?=--)|$))?)+?/gm;
    const tokens = [...matchAll(this.state.value, tokenRegex)];
    let result: any = {};

    for (const token of tokens) {
      const [_, input, flag, value] = token;
      result[flag] = value && value.trim();
    }

    editorInput(result);
  }

  render() {
    const { value } = this.state;
    return (
      <TextArea
        type="text"
        aria-label="text"
        className="editor"
        resizeOrientation="vertical"
        onChange={this.handleInputChange}
        value={value}
      />
    );
  }
}

export default Editor;
