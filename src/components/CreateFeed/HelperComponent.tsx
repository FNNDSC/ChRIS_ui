import React, { useContext } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { notification } from "antd";
import TrashIcon from "@patternfly/react-icons/dist/esm/icons/trash-icon";
import FileIcon from "@patternfly/react-icons/dist/esm/icons/file-icon";
import FolderIcon from "@patternfly/react-icons/dist/esm/icons/folder-icon";

import { CreateFeedContext } from "./context";
import { Types } from "./types/feed";

export const FileList = ({ file, index }: { file: string; index: number }) => {
  const { dispatch } = useContext(CreateFeedContext);

  return (
    <>
      <Flex className="file-preview" key={index}>
        <Flex flex={{ default: "flex_1" }} direction={{ default: "column" }}>
          <FlexItem>
            <Breadcrumb className="file-name">
              {file.split("/").map((path: string, index: number) => {
                return <BreadcrumbItem key={index}>{path}</BreadcrumbItem>;
              })}
            </Breadcrumb>
          </FlexItem>
        </Flex>

        <Flex direction={{ default: "column" }}>
          <FlexItem>
            <span className="file-icon">
              <TrashIcon
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
          </FlexItem>
        </Flex>
      </Flex>
    </>
  );
};

export const LocalFileList = ({
  file,
  handleDeleteDispatch,
  showIcon,
  isFolder,
}: {
  file: any;
  index: number;
  showIcon: boolean;
  handleDeleteDispatch?: (file: string, type?: string) => void;
  isFolder?: boolean;
}) => {
  const fileName = isFolder ? file.webkitRelativePath.split("/")[0] : file.name;

  return (
    <Flex className="file-preview" key={fileName}>
      <Flex flex={{ default: "flex_1" }} direction={{ default: "row" }}>
        <FlexItem className="file-icon">
          <span>{isFolder ? <FolderIcon /> : <FileIcon />}</span>
        </FlexItem>
        <FlexItem>
          <div className="file-name-text">{fileName}</div>
        </FlexItem>
      </Flex>

      <FlexItem>
        {showIcon && (
          <span style={{ cursor: "pointer" }}>
            <TrashIcon
              className="file-icon"
              onClick={() => {
                handleDeleteDispatch?.(fileName, isFolder ? "folder" : "files");
              }}
            />
          </span>
        )}
      </FlexItem>
    </Flex>
  );
};

function generateLocalFileList(
  localFiles: File[],
  handleDeleteDispatch: (file: string) => void,
) {
  return localFiles.map((file: File, index: number) => {
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

export const LocalFileDetails = ({ localFiles }: { localFiles: File[] }) => {
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
      <p style={{ marginTop: "1rem" }}>Local Files to add to new feed:</p>
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
