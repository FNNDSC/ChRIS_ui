import React from "react";
import { TextArea, FormGroup, Form } from "@patternfly/react-core";

type FeedNoteProps = {
  note: string;
  handleEditNote: (note: string) => void;
};

const FeedNote = ({ note, handleEditNote }: FeedNoteProps) => {
  const [value, setValue] = React.useState(note ? note : "");
  const [typing, setTyping] = React.useState(false);
  const handleChange = (value: string) => {
    setValue(value);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTyping(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [typing]);

  return (
    <div className="feed-details__note">
      <Form>
        <FormGroup
          type="string"
          helperText={
            typing ? <i>Typing...</i> : <span>Hit Enter to Save</span>
          }
          fieldId="selection"
        >
          <TextArea
            className="feed-details__textarea"
            value={value}
            onChange={handleChange}
            onKeyDown={(event: any) => {
              if (event.key === "Enter") {
                handleEditNote(value);
              } else {
                setTyping(true);
              }
            }}
            isRequired
            aria-label="invalid text area example"
          />
        </FormGroup>
      </Form>
    </div>
  );
};

export default FeedNote;
