import React from "react";
import {
  TextInput,
  Form,
  Label,
  Button,
  ActionGroup
} from "@patternfly/react-core";

interface InputUserProps {
  handleModalClose: () => void;
  handleCreate: (username: string) => void;
}

interface InputUserState {
  value: string;
}

class InputUser extends React.Component<InputUserProps, InputUserState> {
  constructor(props: InputUserProps) {
    super(props);

    this.state = {
      value: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(value: string) {
    this.setState({ value });
  }
  handleSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    const { value } = this.state;

    this.props.handleCreate(value);
  }

  render() {
    const { value } = this.state;
    const { handleModalClose } = this.props;
    return (
      <div>
        <Form>
          <Label className="share-feed-label">People</Label>
          <TextInput
            value={value}
            type="text"
            onChange={this.handleChange}
            aria-label="text input example"
          />
          <ActionGroup>
            <Button onClick={this.handleSubmit}>Save</Button>
            <Button onClick={() => handleModalClose()}>Cancel</Button>
          </ActionGroup>
        </Form>
      </div>
    );
  }
}
export default InputUser;
