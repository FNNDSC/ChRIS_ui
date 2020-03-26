import React, { Component } from "react";
import { TextArea } from "@patternfly/react-core";
import matchAll from "string.prototype.matchall";

interface EditorState {
  value: string;
}

interface EditorProps {
  editorInput(input: {}): void;
}

class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      value: ""
    };
  }

  handleInputChange = (value: string) => {
    const { editorInput } = this.props;
    this.setState(
      {
        value
      },
      () => {
        const tokenRegex = /(--(?<option>.+?)\s+(?<value>.(?:[^-].+?)?(?:(?=--)|$))?)+?/gm;
        const tokens = [...matchAll(this.state.value, tokenRegex)];
        let result: any = {};

        for (const token of tokens) {
          const [_, input, flag, value] = token;
          result[flag] = value && value.trim();
        }
      
        editorInput(result);
      }
    );
  };

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
