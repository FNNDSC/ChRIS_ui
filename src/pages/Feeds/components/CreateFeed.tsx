import * as React from "react";

import { Typeahead } from "react-bootstrap-typeahead";
import { 
  Button, Wizard, Form, FormGroup,
  TextInput, TextArea, Badge, Chip, 
  Dropdown, DropdownToggle, DropdownItem, DropdownDirection,
  Split, SplitItem
} from "@patternfly/react-core";

/**
 * Wizard too large
 * Reset after close
 */

interface CreateFeedData {
  feedName: string,
  feedDescription: string,
  tags: Array<string>,
}

function getDefaultCreateFeedData(): CreateFeedData {
  return {
    feedName: '',
    feedDescription: '',
    tags: [],
  }
}

interface BasicInformationProps {
  feedName: string,
  feedDescription: string,
  tags: Array<string>,
  availableTags: Array<string>,
  handleFeedNameChange: (val: string, ev: React.ChangeEvent<HTMLInputElement>) => void,
  handleFeedDescriptionChange: (val: string, ev: React.ChangeEvent<HTMLInputElement>) => void,
  handleTagsChange: (tags: Array<string>) => void,
}

const BasicInformation:React.FunctionComponent<BasicInformationProps> = (
  props: BasicInformationProps
) => {
    
  return (
    <Form className="pf-u-w-75">
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
          value={ props.feedName }
          onChange={ props.handleFeedNameChange }
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
          value={ props.feedDescription }
          onChange={ props.handleFeedDescriptionChange }
        />
      </FormGroup>
      <FormGroup
        label="Tags"
        fieldId="tags"
      >
        
        <Typeahead
          id="tags"
          multiple
          options={ props.availableTags }
          placeholder="Choose a tag..."
          onChange={ props.handleTagsChange }
        />
      
      </FormGroup>
    </Form>
  )
}

class ChrisFileSelect extends React.Component {
  render() {
    return <div>Hi</div>;
  }
}

interface LocalFileUploadProps {}
interface LocalFileUploadState {
  fileNames: Array<string>,
}

class LocalFileUpload extends React.Component<LocalFileUploadProps, LocalFileUploadState> {
  constructor(props: LocalFileUploadProps) {
    super(props);
    this.state = {
      fileNames: []
    }
  }
  choseFiles() {

  }
  render() {
    return (
      <Button>Chose Files...</Button>
    )
  }
}

interface ReviewProps {
  data: CreateFeedData,
}

const Review:React.FunctionComponent<ReviewProps> = (
  props: ReviewProps
) => {
  const { data } = props;
  return (
    <div>
      <h1 className="pf-c-title pf-m-2xl">Review</h1>
      <p>Review the information below and click 'Finish' to create your new feed.</p>
      <p>Use the 'Back' button to make changes.</p>
      <br /><br />
      <Split gutter="lg">
        <SplitItem isMain={ false }>
          <p>Feed Name</p>
          <p>Feed Description</p>
          <p>Tags</p>
        </SplitItem>
        <SplitItem isMain>
          <p>{ data.feedName }</p>
          <p>{ data.feedDescription }</p>
          <p>
            { 
              // the installed version of patternfly doesn't support read-only chips
              data.tags.map(tag => (
                <div className="pf-c-chip pf-m-read-only review-tag">
                  <span className="pf-c-chip__text">
                      { tag }
                  </span>
                </div> 
              ))
            }
          </p>
        </SplitItem>
      </Split>
    </div>
  )
}

interface CreateFeedProps {
}
interface CreateFeedState {
  wizardOpen: boolean,
  availableTags: Array<string>,
  data: CreateFeedData
}

class CreateFeed extends React.Component<CreateFeedProps, CreateFeedState> {
  
  constructor(props: CreateFeedProps) {
    super(props);
    this.state = {
      wizardOpen: false,
      availableTags: ['tractography', 'brain', 'example', 'lorem', 'ipsum'],
      data: getDefaultCreateFeedData()
    }
    this.toggleCreateWizard = this.toggleCreateWizard.bind(this);
    this.handleFeedNameChange = this.handleFeedNameChange.bind(this);
    this.handleFeedDescriptionChange = this.handleFeedDescriptionChange.bind(this);
    this.handleTagsChange = this.handleTagsChange.bind(this);
  }

  toggleCreateWizard() {
    if (this.state.wizardOpen) {
      this.setState({ data: getDefaultCreateFeedData() })
    }
    this.setState({
      wizardOpen: !this.state.wizardOpen
    })
  }

  handleFeedNameChange(val: string, e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ data: { ...this.state.data, feedName: val }});3
  }
  handleFeedDescriptionChange(val: string, e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ data: { ...this.state.data, feedDescription: val }});
  }
  handleTagsChange(tags: Array<string>) {
    this.setState({ data: { ...this.state.data, tags }});
  }

  render() {

    const basicInformation = <BasicInformation
      feedName={ this.state.data.feedName }
      feedDescription={ this.state.data.feedDescription }
      tags={ this.state.data.tags }
      availableTags={ this.state.availableTags }
      handleFeedNameChange={ this.handleFeedNameChange }
      handleFeedDescriptionChange={ this.handleFeedDescriptionChange }
      handleTagsChange={ this.handleTagsChange }
    />

    const steps = [
      { 
        name: 'Basic Information', 
        component: basicInformation,
        enableNext: !!this.state.data.feedName
      },
      { 
        name: 'Data Configuration',
        steps: [
          { name: 'ChRIS File Select', component: <ChrisFileSelect /> },
          { name: 'Local File Upload', component: <LocalFileUpload /> },
        ] 
      },
      { name: 'Review', component: <Review data={ this.state.data} /> },
    ];

    return (
      <React.Fragment>
        <Button className="create-feed-button" variant="primary" onClick={this.toggleCreateWizard}>
          Create Feed
        </Button>
        {
          this.state.wizardOpen && (
            <Wizard
              isOpen={this.state.wizardOpen}
              onClose={this.toggleCreateWizard}
              title="Create a New Feed"
              description="This wizard allows you to create a new feed and add an initial dataset to it."
              steps={steps}
            />
          )
        }
      </React.Fragment>
    )
  }
}

export default CreateFeed;