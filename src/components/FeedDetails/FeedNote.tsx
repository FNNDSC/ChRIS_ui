import React, { useEffect } from "react";
import {
  TextArea,
  FormGroup,
  Form,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import { useTypedSelector } from "../../store/hooks";
import { Feed } from "@fnndsc/chrisapi";

async function fetchNote(feed?: Feed) {
  const note = await feed?.getNote();
  return note;
}

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
    value: string
  ) => {
    setValue(value);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTyping(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [typing]);

  return (
    <Form>
      <FormGroup type="string" fieldId="selection">
        <TextArea
          className="feed-details__textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={async (event: any) => {
            if (event.key === "Enter") {
              const note = await fetchNote(feed);
              await note?.put({
                title: "Description",
                content: value,
              });
            } else {
              setTyping(true);
            }
          }}
          isRequired
          aria-label="invalid text area example"
        />
        <HelperText>
          <HelperTextItem>
            {typing ? <i>Typing...</i> : <span>Hit Enter to Save</span>}
          </HelperTextItem>
        </HelperText>
      </FormGroup>
    </Form>
  );
};

export default FeedNote;
