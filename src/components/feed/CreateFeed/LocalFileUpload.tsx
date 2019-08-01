import React from 'react'; 

import { Split, SplitItem, Button } from "@patternfly/react-core";
import { FileIcon, CloseIcon } from "@patternfly/react-icons";

import { LocalFile } from "./CreateFeed";

interface LocalFileUploadProps {
  files: LocalFile[],
  handleFilesAdd: (files: LocalFile[]) => void,
  handleFileRemove: (name: string) => void,
}

class LocalFileUpload extends React.Component<LocalFileUploadProps> {

  openLocalFilePicker(): Promise<LocalFile[]> {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.click();
    return new Promise((res) => {
      input.onchange = async () => {
        if (input.files) {
          const files = Array.from(input.files).map(file => {
            return {
              name: file.name,
              blob: file
            }
          })
          res(files);
        }
      }
    });
  }

  handleChoseFilesClick() {
    this.openLocalFilePicker().then(this.props.handleFilesAdd);
  }

  render() {
    const {
      files,
      handleFileRemove,
    } = this.props;

    const fileList = files.map(file => (
      <div className="file-preview" key={file.name}>
        <FileIcon />
        <span className="file-name">{file.name}</span>
        <CloseIcon className="file-remove" onClick={() => handleFileRemove(file.name)} />
      </div>
    ))

    return (
      <div className="local-file-upload">
        <h1 className="pf-c-title pf-m-2xl">Data Configuration: Local File Upload</h1>
        <p>Please choose the data files you'd like to add to your feed.</p>
        <br />
        <Split gutter="lg">
          <SplitItem isFilled>
            <p className="section-header">File Upload</p>
            <Button onClick={this.handleChoseFilesClick.bind(this)}>
              Choose Files...
              </Button>
          </SplitItem>
          <SplitItem isFilled className="file-list-wrap">
            <p className="section-header">Local files to add to new feed:</p>
            <div className="file-list">
              {fileList}
            </div>
          </SplitItem>
        </Split>
      </div>
    )
  }

}

export default LocalFileUpload;