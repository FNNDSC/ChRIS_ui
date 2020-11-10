import React, { useContext } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { OutlinedTrashAltIcon, FileIcon } from "@patternfly/react-icons";
import { CreateFeedContext } from "../context";
import { Types, LocalFile } from "../types";

export const FileList = ({ file, index }: { file: string; index: number }) => {
  const { dispatch } = useContext(CreateFeedContext);

  return (
    <div className="file-preview" key={index}>
      <Breadcrumb>
        {file.split("/").map((path: string, index: number) => {
          return <BreadcrumbItem key={index}>{path}</BreadcrumbItem>;
        })}
      </Breadcrumb>
      <span className="trash-icon">
        <OutlinedTrashAltIcon
          onClick={() => {
            dispatch({
              type: Types.RemoveChrisFile,
              payload: {
                file: file,
                checkedKeys: [],
              },
            });
          }}
        />
      </span>
    </div>
  );
};

export const LocalFileList = ({
  file,
  index,
}: {
  file: LocalFile;
  index: number;
}) => {
  const { dispatch } = useContext(CreateFeedContext);

  return (
    <div className="file-preview" key={file.name}>
      <span className="file-icon">
        <FileIcon />
      </span>
      <span className="file-name">{file.name}</span>
      <span className="trash-icon">
        <OutlinedTrashAltIcon
          onClick={() => {
            dispatch({
              type: Types.RemoveLocalFile,
              payload: {
                filename: file.name,
              },
            });
          }}
        />
      </span>
    </div>
  );
};

 function generateLocalFileList(localFiles: LocalFile[]) {
   return localFiles.map((file: LocalFile, index: number) => {
     return (
       <React.Fragment key={index}>
         <LocalFileList file={file} index={index} />
       </React.Fragment>
     );
   });
 }

 function generateChrisFileList(chrisFiles: string[]) {
   return chrisFiles.map((file: string, index: number) => {
     return (
       <React.Fragment key={index}>
         <FileList file={file} index={index} />
       </React.Fragment>
     );
   });
 }

 export const ChrisFileDetails = ({ chrisFiles }: { chrisFiles: string[] }) => {
   return (
     <Split>
       <SplitItem isFilled className="file-list">
         <p>Existing Files to add to new feed:</p>
         {generateChrisFileList(chrisFiles)}
       </SplitItem>
     </Split>
   );
 };

 export const LocalFileDetails = ({
   localFiles,
 }: {
   localFiles: LocalFile[];
 }) => {
   return (
     <Split>
       <SplitItem isFilled className="file-list">
         <p>Local Files to add to new feed:</p>
         {generateLocalFileList(localFiles)}
       </SplitItem>
     </Split>
   );
 };