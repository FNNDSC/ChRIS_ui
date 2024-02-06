import React, { useEffect } from "react";
import { TextArea, FormGroup, Form, Button } from "@patternfly/react-core";
import { useTypedSelector } from "../../store/hooks";
import { fetchNote } from "../../api/common";

const FeedNote = () => {
  const [value, setValue] = React.useState("");

  const feed = useTypedSelector((state) => state.feed.currentFeed.data);

  useEffect(() => {
    fetchNote(feed).then((note) => {
      setValue(note?.data.content);
    });
  }, [feed]);

  const [typing, setTyping] = React.useState(false);
  const handleChange = (
    _event: React.ChangeEvent<HTMLTextAreaElement>,
    value: string,
  ) => {
    setValue(value);
  };

  const handleSave = async () => {
    setTyping(true);
    try {
      const note = await fetchNote(feed);
      await note?.put({
        title: "Description",
        content: value,
      });
      setTimeout(() => {
        setTyping(false);
      }, 1000);
    } catch (error) {
      setTyping(false);
    }
  };

  return (
    <>
      <Form>
        <FormGroup type="string" fieldId="selection">
          <TextArea
            className="feed-details__textarea"
            value={value}
            onChange={handleChange}
            onKeyDown={async (event: any) => {
              if (event.key === "Enter") {
                handleSave();
              }
            }}
            isRequired
            aria-label="invalid text area example"
          />
        </FormGroup>
      </Form>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          style={{
            width: "fit-content",
            marginTop: "1rem",
            marginBottom: "1rem",
          }}
          variant="primary"
          onClick={handleSave}
        >
          Save
        </Button>
        {typing && "Saving your note..."}
      </div>
    </>
  );
};

export default FeedNote;
