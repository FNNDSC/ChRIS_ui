import React, { Component } from "react";
import { TextArea } from "@patternfly/react-core";

interface EditorState {
  value: string;
}

class Editor extends React.Component<{}, EditorState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      value: ""
    };
  }

  handleInputChange = (value: string) => {
    this.setState({
      value
    });
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
