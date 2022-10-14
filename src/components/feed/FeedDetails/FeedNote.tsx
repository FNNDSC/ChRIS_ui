import React from "react";
import { TextArea, Button } from "@patternfly/react-core";

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
  const [value, setValue] = React.useState(note || "");

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
};

export default FeedNote;
