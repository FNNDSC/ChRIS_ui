import React from "react";
import { TextArea, FormGroup, Form } from "@patternfly/react-core";

type FeedNoteProps = {
  note: string;
  handleEditNote: (note: string) => void;
  handleClose: () => void;
  status: boolean;
};

const FeedNote = ({
  note,
  status,
  handleEditNote,
  handleClose,
}: FeedNoteProps) => {
  const [value, setValue] = React.useState(note ? note : "");
  const handleChange = (value: string) => {
    setValue(value);
  };
  return (
    <div
      style={{
        padding: "0.25em",
      }}
    >
      <Form>
        <FormGroup
          label="Feed Note:"
          type="string"
          helperText="Hit enter to save"   
          fieldId="selection"
        
        >
          <TextArea
            value={value}
            onChange={handleChange}
            isRequired
           
            aria-label="invalid text area example"
          />
        </FormGroup>
      </Form>
    </div>
  );

  /*

  const handleChange = (value: string) => {
    setValue(value);
  };

  return (
    <div>
      <TextArea
        spellCheck={false}
        aria-label="Edit or View the Feed Notes"
        value={value}
        onChange={handleChange}
        className="feed-details__textarea"
      />
      <div className="feed-details__actions">
        <Button onClick={() => handleEditNote(value)} type="button">
          {status ? "Saving" : "Save"}
        </Button>
        <Button onClick={handleClose} type="button">
          Cancel
        </Button>
      </div>
    </div>
  );
  */
};

export default FeedNote;
