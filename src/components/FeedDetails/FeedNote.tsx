import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Button, Form, FormGroup, TextArea } from "@patternfly/react-core";
import { type ChangeEvent, useEffect, useState } from "react";
import { fetchNote } from "../../api/common";
import * as DoFeed from "../../reducers/feed";

type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

type Props = {
  useFeed: UseThunk<DoFeed.State, TDoFeed>;
};
export default (props: Props) => {
  const { useFeed } = props;
  const [classStateFeed, _] = useFeed;
  const feedState = getState(classStateFeed) || DoFeed.defaultState;
  const { data: feed } = feedState;

  const [value, setValue] = useState("");

  useEffect(() => {
    fetchNote(feed).then((note) => {
      setValue(note?.data.content);
    });
  }, [feed]);

  const [typing, setTyping] = useState(false);
  const handleChange = (
    _event: ChangeEvent<HTMLTextAreaElement>,
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
