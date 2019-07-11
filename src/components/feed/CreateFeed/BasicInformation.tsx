import React from 'react';

import { Form, FormGroup, TextInput, TextArea } from '@patternfly/react-core';
import Client, { Tag } from '@fnndsc/chrisapi';
import { Typeahead } from 'react-bootstrap-typeahead';

export declare var process: { 
  env: {
    REACT_APP_CHRIS_UI_URL: string
  }
}

interface BasicInformationProps {
  authToken: string,
  feedName: string,
  feedDescription: string,
  tags: Tag[],
  handleFeedNameChange: (val: string, ev: React.ChangeEvent<HTMLInputElement>) => void,
  handleFeedDescriptionChange: (val: string, ev: React.ChangeEvent<HTMLInputElement>) => void,
  handleTagsChange: (tags: Tag[]) => void,
}

interface BasicInformationState {
  availableTagsLoaded: boolean,
  availableTags: Tag[], 
}

class BasicInformation extends React.Component<BasicInformationProps, BasicInformationState> {
  
  constructor(props: BasicInformationProps) {
    super(props);
    this.state = {
      availableTagsLoaded: false,
      availableTags: [],
    }
  }

  componentWillMount() {
    this.fetchTagList().then((tags: Tag[]) => {
      this.setState({
        availableTagsLoaded: true,
        availableTags: tags
      })
    });
  }

  async fetchTagList() {
    const client = new Client(process.env.REACT_APP_CHRIS_UI_URL, { token: this.props.authToken} );
    await client.getFeeds(); // getFeeds must be called on new Client objects
    const tagList = await client.getTags();
    const tags: Tag[] = await tagList.getItems() || [];
    return tags;
  }

  render() {  
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
            value={this.props.feedName}
            onChange={this.props.handleFeedNameChange}
            maxLength={100}
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
            value={this.props.feedDescription}
            onChange={this.props.handleFeedDescriptionChange}
          />
        </FormGroup>

        <FormGroup
          label="Tags"
          fieldId="tags"
        >
          <Typeahead
            id="tags"
            placeholder={ this.state.availableTagsLoaded ? 'Chose a tag...' : 'Loading tags...' }
            multiple
            options={this.state.availableTags}
            onChange={this.props.handleTagsChange}
            selected={this.props.tags}
            labelKey={ (tag: Tag) => tag.data.name }
            emptyLabel={ this.state.availableTagsLoaded ? 'No tags found' : 'Loading tags...' }
          />
        </FormGroup>
      </Form>
    )
  }
}

export default BasicInformation;