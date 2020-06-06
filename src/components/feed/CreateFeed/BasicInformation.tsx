import React, { useState, useEffect, useContext } from "react";
import { Form, FormGroup, TextInput, TextArea } from "@patternfly/react-core";
import { Tag } from "@fnndsc/chrisapi";
import { Typeahead } from "react-bootstrap-typeahead";
import { CreateFeedContext } from "./context";
import { Types } from "./types";
import { fetchTagList } from "./utils/basicInformation";

const BasicInformation: React.FC = () => {
  const { state, dispatch } = useContext(CreateFeedContext);
  const { feedName, feedDescription, tags } = state.data;
  const [availableTagsLoaded, setAvailableTagsLoaded] = useState<boolean>(
    false
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchTagList().then((tags: Tag[]) => {
      if (mounted) {
        setAvailableTagsLoaded(true);
        setAvailableTags(tags);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Form className="pf-u-w-75 basic-information">
      <h1 className="pf-c-title pf-m-2xl">Basic Information</h1>
      <FormGroup label="Feed Name" isRequired fieldId="feed-name">
        <TextInput
          isRequired
          type="text"
          id="feed-name"
          name="feed-name"
          placeholder="e.g. Tractography Study"
          value={feedName}
          onChange={(value: string) => {
            dispatch({
              type: Types.FeedNameChange,
              payload: {
                value,
              },
            });
          }}
          maxLength={100}
        />
      </FormGroup>

      <FormGroup label="Feed Description" fieldId="feed-description">
        <TextArea
          id="feed-description"
          name="feed-description"
          placeholder="Use this field to describe the purpose of your feed, the type of data you're processing, or any other details or notes that might be handy to store in the feed."
          rows={5}
          value={feedDescription}
          onChange={(value: string) => {
            dispatch({
              type: Types.FeedDescriptionChange,
              payload: {
                value,
              },
            });
          }}
        />
      </FormGroup>

      <FormGroup label="Tags" fieldId="tags">
        <Typeahead
          id="tags"
          placeholder={
            availableTagsLoaded ? "Chose a tag..." : "Loading tags..."
          }
          multiple
          options={availableTags}
          onChange={(tags: Tag[]) => {
            dispatch({
              type: Types.TagsChange,
              payload: {
                tags,
              },
            });
          }}
          selected={tags}
          labelKey={(tag: Tag) => tag.data.name}
          emptyLabel={availableTagsLoaded ? "No tags found" : "Loading tags..."}
        />
      </FormGroup>
    </Form>
  );
};

export default BasicInformation;
