import React from 'react';

import { FolderCloseIcon, FileIcon } from "@patternfly/react-icons";
import { Split, SplitItem } from '@patternfly/react-core';

import { ChrisFile, CreateFeedData, File } from "./CreateFeed";

interface ReviewProps {
  data: CreateFeedData,
}

class Review extends React.Component<ReviewProps> {

  generateFileList(files: File[]) {
    return files.map(file => {
      let icon = (file as ChrisFile).children ? // file is a ChrisFile folder
        <FolderCloseIcon /> :
        <FileIcon />;
      return (
        <div className="file-preview" key={file.name}>
          {icon}
          <span className="file-name">{file.name}</span>
        </div>
      )
    })
  }

  render() {
    const { data } = this.props;

    // the installed version of @patternfly/react-core doesn't support read-only chips
    const tags = data.tags.map(tag => (
      <div className="pf-c-chip pf-m-read-only tag" key={ tag.data.id }>
        <span className="pf-c-chip__text">
          { tag.data.name }
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
            <div>{data.feedName}</div>
            <div>{data.feedDescription || <span>&nbsp;</span>}</div>
            <div>{tags}</div>
          </SplitItem>
        </Split>

        <br />
        <Split>
          <SplitItem isMain className="file-list">
            <p>ChRIS files to add to new feed:</p>
            {this.generateFileList(data.chrisFiles)}
          </SplitItem>
          <SplitItem isMain className="file-list">
            <p>Local files to add to new feed:</p>
            {this.generateFileList(data.localFiles)}
          </SplitItem>
        </Split>
      </div>
    )

  }
}

export default Review;