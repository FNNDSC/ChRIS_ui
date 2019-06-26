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
 */

interface LocalFile {
  name: string,
  data: string,
}

interface CreateFeedData {
  feedName: string,
  feedDescription: string,
  tags: Array<string>,
  localFiles: Array<LocalFile>
}

function getDefaultCreateFeedData(): CreateFeedData {
  return {
    feedName: '',
    feedDescription: '',
    tags: [],
    localFiles: [],
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

function readFileFromInput(file: File): Promise<string> {
  return new Promise(res => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const data = reader.result || '';
        res(data);
      }
    }
    reader.readAsText(file);
  })
}  

function openLocalFilePicker(): Promise<Array<LocalFile>> {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.click();
  return new Promise((res) => {
    input.onchange = async () => {
      if (input.files) {
        const files = await Promise.all(Array.from(input.files).map(async file => {
          return {
            name: file.name,
            data: await readFileFromInput(file),
          }
        }))
        res(files);
      }
    }
  })
}

interface LocalFileUploadProps {
  files: CreateFeedData['localFiles'],
  handleFilesAdd: (files: Array<LocalFile>) => void,
  handleFileRemove: (name: string) => void,
}

const LocalFileUpload:React.FunctionComponent<LocalFileUploadProps> = ({
  files,
  handleFilesAdd,
  handleFileRemove,
}) => {

  const fileList = files.map(file => (
    <div className="file-preview" key={ file.name }>
      <FileIcon />
      <span className="file-name">{ file.name }</span>
      <CloseIcon className="file-remove" onClick={ () => handleFileRemove(file.name) }/>
    </div>
  ))

  const chooseFilesButton = <Button 
    onClick={ () => openLocalFilePicker().then(handleFilesAdd)}
  >
    Choose Files...
  </Button>

  return (
    <div className="local-file-upload">
      <h1 className="pf-c-title pf-m-2xl">Data Configuration: Local File Upload</h1>
      <p>Please choose the data files you'd like to add to your feed.</p>
      <br />
      <Split gutter="lg">
        <SplitItem isMain>
          <p className="section-header">File Upload</p>
          { chooseFilesButton }
        </SplitItem>
        <SplitItem isMain>
          <p className="section-header">Local files to add to new feed:</p>
          { fileList }
        </SplitItem>
      </Split>
    </div>
  )
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

  // BASIC INFORMATION HANDLERS

  handleFeedNameChange = (val: string, e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ data: { ...this.state.data, feedName: val }});3
  }
  handleFeedDescriptionChange(val: string, e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ data: { ...this.state.data, feedDescription: val }});
  }
  handleTagsChange(tags: Array<string>) {
    this.setState({ data: { ...this.state.data, tags }});
  }

  // LOCAL FILE UPLOAD HANDLERS
  
  handleLocalFilesAdd = (files: Array<LocalFile>) => {
    this.setState({ data: { ...this.state.data, localFiles: [ ...this.state.data.localFiles, ...files ] } })
  }
  handleLocalFileRemove = (fileName: string) => {
    this.setState({ 
      data: {
        ...this.state.data,
        localFiles: this.state.data.localFiles.filter(file => file.name !== fileName)
      }
    })
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
    
    const localFileUpload = <LocalFileUpload
      files={ this.state.data.localFiles }
      handleFilesAdd={ this.handleLocalFilesAdd }
      handleFileRemove={ this.handleLocalFileRemove }
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
          { name: 'Local File Upload', component: localFileUpload },
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