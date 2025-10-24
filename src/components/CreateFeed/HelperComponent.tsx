import {
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import React, { useContext } from "react";
import { constants } from "../../datasets";
import { notification } from "../Antd";
import { FileIcon, FolderIcon, DeleteIcon as TrashIcon } from "../Icons";
import { CreateFeedContext } from "./context";
import { type ChRISFeed, Types } from "./types/feed";
import { displayFeedName } from "./utils";

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
                    message: "File(s) removed",
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

function generateChrisFeed(
  chrisFile: ChRISFeed,
  index: number,
  prefix: string,
) {
  const fullName = prefix
    ? `${prefix}${constants.ANALYSIS_CONCAT_CHAR}${chrisFile.name}`
    : chrisFile.name;
  const newName = displayFeedName(fullName, prefix);
  const theName = `(${chrisFile.theID}) ${chrisFile.createDateTime} ${chrisFile.name} => ${newName}`;
  return (
    <React.Fragment key={index}>
      <FileList file={theName} index={index} />
    </React.Fragment>
  );
}

export const ChrisFileDetails = ({
  chrisFiles,
  prefix,
}: {
  chrisFiles: ChRISFeed[];
  prefix: string;
}) => {
  return (
    <>
      <p>Existing Files to add to new feed:</p>
      {chrisFiles.map((each, idx) => generateChrisFeed(each, idx, prefix))}
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
