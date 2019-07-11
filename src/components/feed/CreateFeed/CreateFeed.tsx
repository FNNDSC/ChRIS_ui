import * as React from "react";
import { connect, MapDispatchToPropsFunction } from 'react-redux';
import { Dispatch } from "redux";

import Client, { Plugin, Request, Feed, UploadedFile, Tag } from "@fnndsc/chrisapi";
import { Button, Wizard } from "@patternfly/react-core";

import { IFeedItem } from "../../../api/models/feed.model";
import { addFeed } from "../../../store/feed/actions";

import BasicInformation from "./BasicInformation";
import ChrisFileSelect from "./ChrisFileSelect";
import LocalFileUpload from "./LocalFileUpload";
import Review from "./Review";

import './createfeed.scss'; 

/* 
  ===========
  === API ===
  ===========
*/

let client: Client;

async function getAuthedClient(): Promise<Client> {
  if (!process.env.REACT_APP_CHRIS_UI_AUTH_URL || !process.env.REACT_APP_CHRIS_UI_URL) {
    return new Promise(res => res(new Client('', { token: '' }))); // this should never be reached
  }; // TEMPORARY!
  if (client) {
    return client;
  }
  const token = await Client.getAuthToken(process.env.REACT_APP_CHRIS_UI_AUTH_URL, 'chris', 'chris1234');
  client = new Client(process.env.REACT_APP_CHRIS_UI_URL, { token });
  return client;
}

function getDataValue(data: Array<{ name: string, value: string }>, name: string) {
  const dataItem =  data.find((dataItem: { name: string, value: string }) => dataItem.name === name);
  if (dataItem) {
    return dataItem.value;
  }
  return '';
}

// async function api() {

//     const token = await Client.getAuthToken(process.env.REACT_APP_CHRIS_UI_AUTH_URL, 'chris', 'chris1234');
//     const client = new Client(process.env.REACT_APP_CHRIS_UI_URL, { token });
//     const feeds = (await client.getFeeds({ limit: 0, offset: 0})).getItems();
//     if (!feeds) {
//       return;
//     }
//     // const newFeeds: Feed[] = (await client.getFeeds({limit:100,offset:0})).getItems() || [];
//     // const newFeed = newFeeds[0];
//     // newFeed.put({ name: 'test' }).then(console.log)
//     for (const feed of feeds) {
//       (feed as Feed).delete();
//     }
// }

// api();

export interface ChrisFile {
  name: string,
  path: string, // full path, including file name
  id?: number, // only defined for files
  blob?: Blob, // only defined for files
  children?: ChrisFile[],
  collapsed?: boolean,
}

export interface LocalFile {
  name: string,
  blob: Blob,
}

export type File = ChrisFile | LocalFile;

export interface CreateFeedData {
  feedName: string,
  feedDescription: string,
  tags: Tag[],
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

interface CreateFeedPropsFromDispatch {
  addFeed: (feed: IFeedItem) => void
}

type CreateFeedProps = CreateFeedPropsFromDispatch;

interface CreateFeedState {
  wizardOpen: boolean,
  step: number,
  availableTags: Tag[],
  data: CreateFeedData,
}

class CreateFeed extends React.Component<CreateFeedProps, CreateFeedState> {

  constructor(props: CreateFeedProps) {
    super(props);
    this.state = {
      wizardOpen: false,
      step: 1,
      data: getDefaultCreateFeedData(),
    }
    this.toggleCreateWizard = this.toggleCreateWizard.bind(this);
    this.handleStepChange = this.handleStepChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.getStepName = this.getStepName.bind(this);
    this.handleFeedNameChange = this.handleFeedNameChange.bind(this);
    this.handleFeedDescriptionChange = this.handleFeedDescriptionChange.bind(this);
    this.handleTagsChange = this.handleTagsChange.bind(this);
    this.handleChrisFileAdd = this.handleChrisFileAdd.bind(this);
    this.handleChrisFileRemove = this.handleChrisFileRemove.bind(this);
    this.handleLocalFilesAdd = this.handleLocalFilesAdd.bind(this);
    this.handleLocalFileRemove = this.handleLocalFileRemove.bind(this);
  }


  /*
    -------------- 
    EVENT HANDLERS 
    --------------
  */
  // WIZARD HANDLERS

  toggleCreateWizard() {
    if (this.state.wizardOpen) {
      this.setState({ data: getDefaultCreateFeedData(), step: 1 })
    }
    this.setState({
      wizardOpen: !this.state.wizardOpen
    })
  }

  handleStepChange(step: any) {
    this.setState({ step: step.id });
  }

  handleSave() {
    this.createFeed();
  }

  getStepName(): string {
    const stepNames = ['basic-information', 'chris-file-select', 'local-file-upload', 'review'];
    return stepNames[this.state.step - 1]; // this.state.step starts at 1
  }

  // BASIC INFORMATION HANDLERS

  handleFeedNameChange(val: string) {
    this.setState({ data: { ...this.state.data, feedName: val }});3
  }
  handleFeedDescriptionChange(val: string) {
    this.setState({ data: { ...this.state.data, feedDescription: val }});
  }
  handleTagsChange(tags: Tag[]) {
    this.setState({ data: { ...this.state.data, tags }});
  }

  // CHRIS FILE SELECT HANDLERS

  handleChrisFileAdd(file: ChrisFile) {
    this.setState({ data: { 
      ...this.state.data, 
      chrisFiles: [...this.state.data.chrisFiles, file ]
    }});
  }
  
  handleChrisFileRemove(file: ChrisFile) {
    this.setState({ data: {
      ...this.state.data,
      chrisFiles: this.state.data.chrisFiles.filter(f => f.path !== file.path)
    }});
  }

  // LOCAL FILE UPLOAD HANDLERS
  
  handleLocalFilesAdd(files: LocalFile[]) {
    this.setState({ data: { ...this.state.data, localFiles: [ ...this.state.data.localFiles, ...files ] } })
  }
  handleLocalFileRemove(fileName: string) {
    this.setState({ 
      data: {
        ...this.state.data,
        localFiles: this.state.data.localFiles.filter(file => file.name !== fileName)
      }
    })
  }

  // CREATION

  // dircopy is run on a single directory, so all selected/uploaded files need to be moved into
  // a temporary directory. This fn generates its name, based on the feed name.
  // TODO: something better, esp. if the folder already exists.
  // TODO: replace special chars - esp. slashes - etc.
  // TODO: error handling
  getTempDirName() {
    return '/' + this.state.data.feedName.toLowerCase().replace(/ /g, '-').replace(/\//g, '') + '-temp';
  }

  async getUploadedFiles() {
    const client = await getAuthedClient();
    const feeds = await client.getFeeds({ limit: 0, offset: 0});
    return await feeds.getUploadedFiles({ limit: 0, offset: 0 });
  }

  // Local files are uploaded into the temp directory
  async uploadLocalFiles() {
    const files = this.state.data.localFiles;
    const uploadedFiles = await this.getUploadedFiles();
    const dirname = this.getTempDirName();
    for (const file of files) {
      uploadedFiles.post({
        upload_path: `${dirname}/${file.name}`,
      }, {
        fname: new Blob([file.contents])
      });
    }
  }
  
  // Selected ChRIS files are copied into the temp directory
  async copyChrisFiles() {
    const files = this.state.data.chrisFiles;
    const uploadedFiles = await this.getUploadedFiles();
  }

  createFeed = async () => {
    // this.uploadLocalFiles();
    // const client = getAuthedClient();
    // const feeds = await client.getFeeds({ limit: 0, offset: 0});
    // const plugins = (await feeds.getPlugins({ limit: 100, offset: 0 })).getItems() || [];
    // const dircopy: Plugin = plugins.find(plugin => {
    //   const { data } = plugin;
    //   return data.name === 'dircopy';
    // })
    // if (!dircopy) {
    //   alert('dircopy not found...')
    //   return;
    // }
    // const id = dircopy.data.id;
    // const req = new Request({ token }, 'application/vnd.collection+json');
    // req.get(`${process.env.REACT_APP_CHRIS_UI_URL}plugins/instances/37/`);
    // req.post(`${process.env.REACT_APP_CHRIS_UI_URL}plugins/${id}/instances/`, {
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   template: {
    //     "data": [
    //       { name:"dir", value: this.state.data.chrisFiles[0].path },
    //     ]
    //   }
    // }).then(async res => {
    //   // console.log(res.data.collection.items[0].data);
    //   const instanceId = getDataValue(res.data.collection.items[0].data, 'id');
    //   console.log(instanceId);
      
    //   req.get(`${process.env.REACT_APP_CHRIS_UI_URL}plugins/instances/${instanceId}/`).then(res => {
    //     console.log(res.data);
    //     this.toggleCreateWizard();
    //   })
      // const newFeeds: Feed[] = (await client.getFeeds({limit:100,offset:0})).getItems() || [];
      // const newFeed = newFeeds[0];
      // newFeed.put({ name: this.state.data.feedName }).then(feed => {
      //   const date = new Date().toISOString();
      //   const f: IFeedItem = {
      //     id: 200,
      //     creation_date: date,
      //     modification_date: date,
      //     name: this.state.data.feedName,
      //     creator_username: 'cube',
      //     url: 'https://www.google.com',
      //     files: '/hi/there/',
      //     comments: 'nope',
      //     owner: ['cube_owner1', 'cube_owner2'],
      //     note: 'imanote',
      //     tags: 'tag1 tag2',
      //     taggings: 'taggins??',
      //     plugin_instances: 'instanceyay',
      //   }
      //   this.props.addFeed(f);
      // })
    // })
    // req.get(`${process.env.REACT_APP_CHRIS_UI_URL}plugins/instances/4/`).then(res => console.log(res));
  }

  render() {

    const basicInformation = <BasicInformation
      authToken={ this.props.authToken }
      feedName={ this.state.data.feedName }
      feedDescription={ this.state.data.feedDescription }
      tags={ this.state.data.tags }
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
              onSave={this.handleSave}
            />
          )
      }
      </React.Fragment>
    )
  }
}

const mapDispatchToProps: MapDispatchToPropsFunction<CreateFeedPropsFromDispatch, {}> = (dispatch: Dispatch) => ({
  addFeed: (feed: IFeedItem) => dispatch(addFeed(feed))
});

export default connect<{}, CreateFeedPropsFromDispatch, {}, CreateFeedState>(
  () => ({}),
  mapDispatchToProps,
)(CreateFeed);