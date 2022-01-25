import React, { useState } from "react";
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

const InputUser: React.FC<InputUserProps> = ({
  handleCreate,
  handleModalClose
}) => {
  const [value, setValue] = useState("");

  const handleChange = (value: string) => setValue(value);
  const handleSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    handleCreate(value);
  };

  return (
    <div>
      <Form>
        <Label className="share-feed-label">People</Label>
        <TextInput
          value={value}
          type="text"
          onChange={handleChange}
          aria-label="text input example"
        />
        <ActionGroup>
          <Button onClick={handleSubmit}>Save</Button>
          <Button onClick={() => handleModalClose()}>Cancel</Button>
        </ActionGroup>
      </Form>
    </div>
  );
};

export default InputUser;
