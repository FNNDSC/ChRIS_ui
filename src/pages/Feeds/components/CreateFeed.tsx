import * as React from "react";

import { Typeahead } from "react-bootstrap-typeahead";
import Tree from "react-ui-tree";

import Client, { UploadedFile } from '@fnndsc/chrisapi';
import { 
  Button, Wizard, Form, FormGroup, Checkbox,
  TextInput, TextArea, Split, SplitItem
} from "@patternfly/react-core";
import { FileIcon, CloseIcon, FolderOpenIcon, FolderCloseIcon } from "@patternfly/react-icons";

import { LoadingComponent } from "../../../components";

const CHRIS_API_URL = 'http://localhost:8000/api/v1';

function getDataValue(data: Array<{ name: string, value: string }>, name: string) {
  const dataItem =  data.find((dataItem: { name: string, value: string }) => dataItem.name === name);
  if (dataItem) {
    return dataItem.value;
  }
  return '';
}

interface ChrisFile {
  name: string,
  path: string, // full path, including file name
  children?: ChrisFile[],
  collapsed?: boolean,
}

interface LocalFile {
  name: string,
  data: string,
}

interface CreateFeedData {
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

function getEmptyTree() {
  return {
    name: 'ChRIS Files',
    path: '/',
    children: [],
  }
}

interface ChrisFileSelectProps {
  files: ChrisFile[],
  handleFileAdd: (file: ChrisFile) => void,
  handleFileRemove: (file: ChrisFile) => void,
}

interface ChrisFileSelectState {
  filter: string,
  initialTreeLoaded: boolean,
  initialTree: ChrisFile,
  visibleTree: ChrisFile,
}

class ChrisFileSelect extends React.Component<ChrisFileSelectProps, ChrisFileSelectState> {

  constructor(props: ChrisFileSelectProps) {
    super(props);
    this.state = {
      filter: '',
      initialTreeLoaded: false,
      initialTree: getEmptyTree(),
      visibleTree: getEmptyTree(),
    }
  }

  componentDidMount() {
    this.disableTreeDraggables();
    this.fetchChrisFiles().then((files: string[]) => {
      const tree = this.buildInitialFileTree(files);
      this.setState({
        initialTreeLoaded: true,
        initialTree: tree,
        visibleTree: tree,
      });
    })

  }

  componentDidUpdate() {
    this.disableTreeDraggables();
  }

  // finds all nodes and disables the draggable function that comes with the react-ui-tree
  // from FileExplorer.tsx
  disableTreeDraggables() {
    const arr = Array.from(document.getElementsByClassName('m-node'));
    for (const el of arr) {
      el.addEventListener('mousedown', (e: Event) => { e.stopPropagation() }, { passive: false });
    }
  }

  /* DATA FETCHING */

  /**
   * 
   * @param fileNames list of files, e.g. ['/data1.txt', 'data2.txt', /project/data2.txt']
   * @returns ChrisFile tree
   */
  buildInitialFileTree(fileNames: Array<string>) {
    const root = getEmptyTree();
    for (const path of fileNames) {

        const parts = path.split('/').slice(1); // remove initial '/'
        const name = parts[parts.length - 1];
        const dirs = parts.slice(0, parts.length - 1);

        let currentDir: ChrisFile[] = root.children;
        for (const dirName of dirs) {
            const existingDir = currentDir.find((pathObj: ChrisFile) => pathObj.name === dirName);

            if (existingDir && existingDir.children) {
                currentDir = existingDir.children;
                continue;
            }

            const newDir = {
              name: dirName,
              children: [],
              path: `${dirName.split(dirName)[0]}${dirName}`,
              collapsed: true,
            }
            currentDir.push(newDir);
            currentDir = newDir.children;
        }
        currentDir.push({ name: name, path: path });
    }
    return this.sortTree(root);
  }

  sortTree(root: ChrisFile) {
    let children: ChrisFile[] = [];
    if (root.children) {

      children = root.children.sort((a: ChrisFile, b: ChrisFile) => {
        if (a.children && !b.children) {
          return -1;
        } else if (!a.children && b.children) {
          return 1;
        } else { // both folders or both files
          return a.name.localeCompare(b.name);
        }
      });

      for (const child of root.children) {
        if (child.children) {
          child.children = this.sortTree(child).children;
        }
      }

    }
    return { ...root, children };
  }

  async fetchChrisFiles(): Promise<string[]> {
    const authUrl = `${CHRIS_API_URL}/auth-token/`;
    const authToken = await Client.getAuthToken(authUrl, 'chris', 'chris1234');
    const client = new Client(CHRIS_API_URL, { token: authToken });
    const feeds = await client.getFeeds({ limit:0, offset: 0 });
    const uploadedFileList = await feeds.getUploadedFiles({limit: 10, offset: 0});
    const files = uploadedFileList.getItems();
    if (!files) {
      return [];
    }

    const fileNames = files.map(file => {
      const fileData = (file as UploadedFile).item.data;
      return getDataValue(fileData, 'upload_path');
    })
    return fileNames;
  }

  /* EVENT HANDLERS */

  handleCheckboxChange = (isChecked: boolean, file: ChrisFile) => {
    if (isChecked) {
      this.props.handleFileAdd(file);
    } else {
      this.props.handleFileRemove(file);
    }
  }
  
  /* SEARCH */

  handleFilterChange = (value: string) => {
    this.setState({ filter: value }, () => {
      if (value) {
        this.recomputeVisibleTree();
      } else {
        this.resetVisibleTree();
      }
    });
  }

  recomputeVisibleTree() {
    if (this.state.initialTree.children) {
      const visibleTopLevelChildren = this.computeVisibleChildren(this.state.initialTree.children);
      this.setState({
        visibleTree: {
          name: 'ChRIS Files',
          path: '/',
          children: visibleTopLevelChildren,
        }
      })
    }
  }

  computeVisibleChildren(children: Array<ChrisFile>): Array<ChrisFile> {
    const shownChildren = [];
    for (const child of children) {
      if (!child.children && this.matchesFilter(child.name)) { // is file and matches
        shownChildren.push(child);
      } else if (child.children) { // if it's a folder
        const folderShownChildren = this.computeVisibleChildren(child.children); // get its shown children
        if (folderShownChildren.length) {
          const folder = {
            name: child.name,
            path: child.path,
            children: folderShownChildren,
          }
          shownChildren.push(folder);
        }
      }
    }
    return shownChildren;
  }

  resetVisibleTree() {
    this.setState({ visibleTree: this.state.initialTree })
  }

  normalizeString(str: string) {
    return str.toLowerCase().trim();
  }

  matchesFilter(name: string) {
    return this.normalizeString(name).includes(this.normalizeString(this.state.filter));
  }

  // generates file name, with match highlighted, for file explorer
  generateFileName(node: ChrisFile) {
    const name = node.name;
    if (!this.state.filter || !this.matchesFilter(name) || node.children) { // REMOVE THE LAST CLAUSE IF FOLDERS ARE SEARCHABLE
      return name;
    }
    const matchIndex = this.normalizeString(name).indexOf(this.normalizeString(this.state.filter));
    const before = name.substring(0, matchIndex);
    const match = name.substring(matchIndex, matchIndex + this.state.filter.length);
    const after = name.substring(matchIndex + this.state.filter.length);
    return (
      <React.Fragment>
        { before }
        <span className="match-highlight">{ match }</span>
        { after }
      </React.Fragment>
    );
  }

  renderTreeNode = (node: ChrisFile) => {
    const isSelected = !!this.props.files.find(f => f.path === node.path);
    const isFolder = node.children; 
    const icon = isFolder 
      ? (node.collapsed ? <FolderCloseIcon /> : <FolderOpenIcon></FolderOpenIcon>)
      : <FileIcon />
    return (
      <span className="name">
        <Checkbox
          checked={isSelected}
          id={`check-${node.path}`}
          aria-label="" 
          onChange={ isChecked => this.handleCheckboxChange(isChecked, node) }
        />
        { icon }
        { this.generateFileName(node) }
      </span>
    )
  }

  render() {
    
    const fileList = this.props.files.map(file => (
      <div className="file-preview" key={ file.path }>
        {
          file.children ? <FolderCloseIcon /> : <FileIcon />
        }
        <span className="file-name">{ file.name }</span>
        <CloseIcon className="file-remove" onClick={ () => this.props.handleFileRemove(file) }/>
      </div>
    ))

    return (
      <div className="chris-file-select">
        <h1 className="pf-c-title pf-m-2xl">Data Configuration: ChRIS File Select</h1>
        <p>Please choose the data files you'd like to add to your feed.</p>
        <br />
        <Split gutter="lg">
          <SplitItem isMain>
            <TextInput
              type="text"
              id="file-filter"
              value={ this.state.filter }
              placeholder="Filter by filename..."
              onChange={this.handleFilterChange}
            />
            {
              this.state.initialTreeLoaded ?
              <Tree
                tree={this.state.visibleTree}
                renderNode={ this.renderTreeNode }
                paddingLeft={ 20 }
              /> :
              <LoadingComponent />
            }
          </SplitItem>
          <SplitItem isMain className="file-list">
            <p className="section-header">Files to add to new feed:</p>
            { fileList }
          </SplitItem>
        </Split>
      </div>
    );
  }
}

interface LocalFileUploadProps {
  files: CreateFeedData['localFiles'],
  handleFilesAdd: (files: Array<LocalFile>) => void,
  handleFileRemove: (name: string) => void,
}

class LocalFileUpload extends React.Component<LocalFileUploadProps> {
  
  readFileFromInput = (file: File):Promise<string> => {
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
  
  openLocalFilePicker(): Promise<Array<LocalFile>> {
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
              data: await this.readFileFromInput(file),
            }
          }))
          res(files);
        }
      }
    })
  }

  handleChoseFilesClick = () => {
    this.openLocalFilePicker().then(this.props.handleFilesAdd);
  }

  render() {
    const {
      files,
      handleFileRemove,
    } = this.props;

    const fileList = files.map(file => (
      <div className="file-preview" key={ file.name }>
        <FileIcon />
        <span className="file-name">{ file.name }</span>
        <CloseIcon className="file-remove" onClick={ () => handleFileRemove(file.name) }/>
      </div>
    ))
  
    return (
      <div className="local-file-upload">
        <h1 className="pf-c-title pf-m-2xl">Data Configuration: Local File Upload</h1>
        <p>Please choose the data files you'd like to add to your feed.</p>
        <br />
        <Split gutter="lg">
          <SplitItem isMain>
            <p className="section-header">File Upload</p>
            <Button onClick={this.handleChoseFilesClick}>
              Choose Files...
            </Button>
          </SplitItem>
          <SplitItem isMain className="file-list">
            <p className="section-header">Local files to add to new feed:</p>
            { fileList }
          </SplitItem>
        </Split>
      </div>
    )
  }

}

interface ReviewProps {
  data: CreateFeedData,
}

class Review extends React.Component<ReviewProps> {

  generateFileList(files: Array<ChrisFile | LocalFile>) {
    return files.map(file => {
      let icon = (file as ChrisFile).children ? // file is a ChrisFile folder
        <FolderCloseIcon /> :
        <FileIcon />;
      return (
        <div className="file-preview" key={ file.name }>
          { icon }
          <span className="file-name">{ file.name }</span>
        </div>
      )
    })
  }
  
  render() {
    const { data } = this.props;
  
    // the installed version of @patternfly/react-core doesn't support read-only chips
    const tags = data.tags.map(tag => (
      <div className="pf-c-chip pf-m-read-only tag">
        <span className="pf-c-chip__text">
            { tag }
        </span>
      </div> 
    ))

    return (
      <div className="review">
        <h1 className="pf-c-title pf-m-2xl">Review</h1>
        <p>Review the information below and click 'Finish' to create your new feed.</p>
        <p>Use the 'Back' button to make changes.</p>
        <br /><br />

        <Split gutter="lg">
          <SplitItem isMain>
            <div>Feed Name</div>
            <div>Feed Description</div>
            <div>Tags</div>
          </SplitItem>
          <SplitItem isMain>
            <div>{ data.feedName }</div>
            <div>{ data.feedDescription || <span>&nbsp;</span> }</div>
            <div>{ tags}</div>
          </SplitItem>
        </Split>

        <br />
        <Split>
          <SplitItem isMain className="file-list">
            <p>ChRIS files to add to new feed:</p>
            { this.generateFileList(data.chrisFiles )}
          </SplitItem>
          <SplitItem isMain className="file-list">
            <p>Local files to add to new feed:</p>
            { this.generateFileList(data.localFiles) }
          </SplitItem>
        </Split>
      </div>
    )

  }
}

interface CreateFeedState {
  wizardOpen: boolean,
  step: number,
  availableTags: Array<string>,
  data: CreateFeedData
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
  handleTagsChange = (tags: Array<string>) => {
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
      { id: 4, name: 'Review', component: <Review data={ this.state.data} /> },
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