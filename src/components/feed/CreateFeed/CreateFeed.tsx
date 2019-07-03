import * as React from "react";

import { Button, Wizard } from "@patternfly/react-core";

import { IFeedItem } from "../../../api/models/feed.model";

import BasicInformation from "./BasicInformation";
import ChrisFileSelect from "./ChrisFileSelect";
import LocalFileUpload from "./LocalFileUpload";
import Review from "./Review";

import './createfeed.scss'; 

export interface ChrisFile {
  name: string,
  path: string, // full path, including file name
  children?: ChrisFile[],
  collapsed?: boolean,
}

export interface LocalFile {
  name: string,
  data: string,
}

export interface CreateFeedData {
  feedName: string,
  feedDescription: string,
  tags: string[],
  chrisFiles: ChrisFile[],
  localFiles: LocalFile[],
}

function getDefaultCreateFeedData(): CreateFeedData {
  return {
    feedName: '',
    feedDescription: '',
    tags: [],
    chrisFiles: [],
    localFiles: [],
  }
}

interface CreateFeedState {
  wizardOpen: boolean,
  step: number,
  availableTags: string[],
  data: CreateFeedData,
}

class CreateFeed extends React.Component<{}, CreateFeedState> {
  
  constructor(props: {}) {
    super(props);
    this.state = {
      wizardOpen: false,
      step: 1,
      availableTags: ['tractography', 'brain', 'example', 'lorem', 'ipsum'],
      data: getDefaultCreateFeedData()
    }
  }

  // WIZARD HANDLERS

  toggleCreateWizard = () => {
    if (this.state.wizardOpen) {
      this.setState({ data: getDefaultCreateFeedData(), step: 1 })
    }
    this.setState({
      wizardOpen: !this.state.wizardOpen
    })
  }

  handleStepChange = (step: any) => {
    this.setState({ step: step.id });
  }

  getStepName = (): string => {
    const stepNames = ['basic-information', 'chris-file-select', 'local-file-upload', 'review'];
    return stepNames[this.state.step - 1]; // this.state.step starts at 1
  }

  // BASIC INFORMATION HANDLERS

  handleFeedNameChange = (val: string) => {
    this.setState({ data: { ...this.state.data, feedName: val }});3
  }
  handleFeedDescriptionChange = (val: string) => {
    this.setState({ data: { ...this.state.data, feedDescription: val }});
  }
  handleTagsChange = (tags: string[]) => {
    this.setState({ data: { ...this.state.data, tags }});
  }

  // CHRIS FILE SELECT HANDLERS

  handleChrisFileAdd = (file: ChrisFile) => {
    this.setState({ data: { 
      ...this.state.data, 
      chrisFiles: [...this.state.data.chrisFiles, file ]
    }});
  }
  
  handleChrisFileRemove = (file: ChrisFile) => {
    this.setState({ data: {
      ...this.state.data,
      chrisFiles: this.state.data.chrisFiles.filter(f => f.path !== file.path)
    }});
  }

  // LOCAL FILE UPLOAD HANDLERS
  
  handleLocalFilesAdd = (files: LocalFile[]) => {
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
    />;

    const chrisFileSelect = <ChrisFileSelect
      files={ this.state.data.chrisFiles }
      handleFileAdd={ this.handleChrisFileAdd }
      handleFileRemove={ this.handleChrisFileRemove }
    />;
    
    const localFileUpload = <LocalFileUpload
      files={ this.state.data.localFiles }
      handleFilesAdd={ this.handleLocalFilesAdd }
      handleFileRemove={ this.handleLocalFileRemove }
    />;

    const review = <Review data={ this.state.data } />

    const steps = [
      { 
        id: 1, // id corresponds to step number
        name: 'Basic Information', 
        component: basicInformation,
        enableNext: !!this.state.data.feedName
      },
      { 
        name: 'Data Configuration',
        steps: [
          { id: 2, name: 'ChRIS File Select', component: chrisFileSelect },
          { id: 3, name: 'Local File Upload', component: localFileUpload },
        ] 
      },
      { id: 4, name: 'Review', component: review },
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
              className={`feed-create-wizard ${this.getStepName()}-wrap`}
              steps={steps}
              startAtStep={this.state.step}
              onNext={this.handleStepChange}
              onBack={this.handleStepChange}
              onGoToStep={this.handleStepChange}
            />
          )
      }
      </React.Fragment>
    )
  }
}

export default CreateFeed;