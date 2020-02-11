import React from "react";

import { Form, FormGroup, TextInput, TextArea } from "@patternfly/react-core";
import { Tag } from "@fnndsc/chrisapi";
import { Typeahead } from "react-bootstrap-typeahead";

import ChrisAPIClient from "../../../api/chrisapiclient";

interface BasicInformationProps {
  feedName: string;
  feedDescription: string;
  tags: Tag[];
  handleFeedNameChange: (val: string) => void;
  handleFeedDescriptionChange: (val: string) => void;
  handleTagsChange: (tags: Tag[]) => void;
}

interface BasicInformationState {
  availableTagsLoaded: boolean;
  availableTags: Tag[];
}

class BasicInformation extends React.Component<
  BasicInformationProps,
  BasicInformationState
> {
  _ismounted = false;
  constructor(props: BasicInformationProps) {
    super(props);
    this.state = {
      availableTagsLoaded: false,
      availableTags: []
    };
  }

  componentWillMount() {
    this._ismounted = true;
    this.fetchTagList().then((tags: Tag[]) => {
      if (this._ismounted) {
        this.setState({
          availableTagsLoaded: true,
          availableTags: tags
        });
      }
    });
  }

  async fetchTagList() {
    const client = ChrisAPIClient.getClient();

    const params = { limit: 30, offset: 0 };
    let tagList = await client.getTags(params);
    const tags = tagList.getItems();

    while (tagList.hasNextPage) {
      try {
        params.offset += params.limit;
        tagList = await client.getTags(params);
        tags.push(...tagList.getItems());
      } catch (e) {
        console.error(e);
      }
    }
    return tags;
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  render() {
    const {
      feedName,
      feedDescription,
      tags,
      handleFeedNameChange,
      handleFeedDescriptionChange,
      handleTagsChange
    } = this.props;
    const { availableTagsLoaded, availableTags } = this.state;

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
            onChange={handleFeedNameChange}
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
            onChange={handleFeedDescriptionChange}
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
            onChange={handleTagsChange}
            selected={tags}
            labelKey={(tag: Tag) => tag.data.name}
            emptyLabel={
              availableTagsLoaded ? "No tags found" : "Loading tags..."
            }
          />
        </FormGroup>
      </Form>
    );
  }
}

export default BasicInformation;
