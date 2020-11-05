import React, { useContext } from "react";
import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
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
