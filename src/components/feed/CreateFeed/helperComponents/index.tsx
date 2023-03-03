import React, { useContext } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import { FaTrash, FaFile } from "react-icons/fa";
import { CreateFeedContext } from "../context";
import { Types, LocalFile } from "../types/feed";
import { notification } from "antd";

export const FileList = ({ file, index }: { file: string; index: number }) => {
  const { dispatch } = useContext(CreateFeedContext);

  return (
    <>
      <Grid className="file-preview" key={index}>
        <GridItem span={10}>
          <Breadcrumb>
            {file.split("/").map((path: string, index: number) => {
              return <BreadcrumbItem key={index}>{path}</BreadcrumbItem>;
            })}
          </Breadcrumb>
        </GridItem>
        <GridItem span={2}>
          <span className="trash-icon">
            <FaTrash
              onClick={() => {
                dispatch({
                  type: Types.RemoveChrisFile,
                  payload: {
                    file: file,
                    checkedKeys: [],
                  },
                });
                notification.info({
                  message: `File(s) removed`,
                  description: `${file} file(s) removed`,
                  duration: 1,
                });
              }}
            />
          </span>
        </GridItem>
      </Grid>
    </>
  );
};

export const LocalFileList = ({
  file,
  handleDeleteDispatch,
  showIcon,
}: {
  file: LocalFile;
  index: number;
  showIcon: boolean;
  handleDeleteDispatch?: (file: string) => void;
}) => {
  return (
    <>
      <Grid className="file-preview" key={file.name}>
        <GridItem span={10} className="file-name">
          <span className="file-icon">
            <FaFile />
          </span>
          {file.name}
        </GridItem>
        {showIcon && (
          <GridItem span={2} className="trash-icon">
            <FaTrash
              onClick={() => {
                handleDeleteDispatch && handleDeleteDispatch(file.name);
              }}
            />
          </GridItem>
        )}
      </Grid>
    </>
  );
};

function generateLocalFileList(
  localFiles: LocalFile[],
  handleDeleteDispatch: (file: string) => void
) {
  return localFiles.map((file: LocalFile, index: number) => {
    return (
      <React.Fragment key={index}>
        <LocalFileList
          handleDeleteDispatch={handleDeleteDispatch}
          showIcon={true}
          file={file}
          index={index}
        />
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
    <>
      <p>Existing Files to add to new feed:</p>
      {generateChrisFileList(chrisFiles)}
    </>
  );
};

export const LocalFileDetails = ({
  localFiles,
}: {
  localFiles: LocalFile[];
}) => {
  const { dispatch } = useContext(CreateFeedContext);
  const handleDeleteDispatch = (file: string) => {
    dispatch({
      type: Types.RemoveLocalFile,
      payload: {
        filename: file,
      },
    });
    notification.info({
      message: "File removed",
      description: `${file} file removed`,
      duration: 1,
    });
  };
  return (
    <>
      <p>Local Files to add to new feed:</p>
      {generateLocalFileList(localFiles, handleDeleteDispatch)}
    </>
  );
};

export function ErrorMessage({ error }: any) {
  return (
    <div
      role="alert"
      style={{
        color: "red",
      }}
    >
      <span>There was an error:</span>
      <pre
        style={{
          whiteSpace: "break-spaces",
          margin: "0",
          marginBottom: -5,
        }}
      >
        {error.message && error.message}
      </pre>
    </div>
  );
}
