import React from 'react';

import { Form, FormGroup, TextInput, TextArea } from '@patternfly/react-core';
import { Typeahead } from 'react-bootstrap-typeahead';

interface BasicInformationProps {
  feedName: string,
  feedDescription: string,
  tags: string[],
  availableTags: string[],
  handleFeedNameChange: (val: string, ev: React.ChangeEvent<HTMLInputElement>) => void,
  handleFeedDescriptionChange: (val: string, ev: React.ChangeEvent<HTMLInputElement>) => void,
  handleTagsChange: (tags: string[]) => void,
}

const BasicInformation: React.FunctionComponent<BasicInformationProps> = (
  props: BasicInformationProps
) => {

  return (
    <Form className="pf-u-w-75 basic-information">
      <h1 className="pf-c-title pf-m-2xl">Basic Information</h1>
      <FormGroup
        label="Feed Name"
        isRequired
        fieldId="feed-name"
      >
        <TextInput
          isRequired
          type="text"
          id="feed-name"
          name="feed-name"
          placeholder="e.g. Tractography Study"
          value={props.feedName}
          onChange={props.handleFeedNameChange}
        />
      </FormGroup>

      <FormGroup
        label="Feed Description"
        fieldId="feed-description"
      >
        <TextArea
          id="feed-description"
          name="feed-description"
          placeholder="Use this field to describe the purpose of your feed, the type of data you're processing, or any other details or notes that might be handy to store in the feed."
          rows={5}
          value={props.feedDescription}
          onChange={props.handleFeedDescriptionChange}
        />
      </FormGroup>

      <FormGroup
        label="Tags"
        fieldId="tags"
      >
        <Typeahead
          id="tags"
          multiple
          options={props.availableTags}
          placeholder="Choose a tag..."
          onChange={props.handleTagsChange}
        />
      </FormGroup>
    </Form>
  )
}

export default BasicInformation;