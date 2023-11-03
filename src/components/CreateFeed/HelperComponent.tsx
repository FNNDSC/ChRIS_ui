import React, { useContext } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { notification } from "antd";
import { IconTrash, IconFile } from "@tabler/icons-react";

import { CreateFeedContext } from "./context";
import { Types } from "./types/feed";

export const FileList = ({ file, index }: { file: string; index: number }) => {
  const { dispatch } = useContext(CreateFeedContext);

  return (
    <>
      <Flex className="file-preview" key={index}>
        <Flex flex={{ default: "flex_1" }} direction={{ default: "column" }}>
          <FlexItem>
            <Breadcrumb>
              {file.split("/").map((path: string, index: number) => {
                return <BreadcrumbItem key={index}>{path}</BreadcrumbItem>;
              })}
            </Breadcrumb>
          </FlexItem>
        </Flex>

        <Flex direction={{ default: "column" }}>
          <FlexItem>
            <span className="file-icon">
              <IconTrash
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
}: {
  file: any;
  index: number;
  showIcon: boolean;
  handleDeleteDispatch?: (file: string) => void;
}) => {
  return (
    <Flex className="file-preview" key={file.name}>
      <Flex flex={{ default: "flex_1" }} direction={{ default: "column" }}>
        <FlexItem className="file-name">
          <span className="file-icon">
            <IconFile />
          </span>
          {file.name}
        </FlexItem>
      </Flex>

      <Flex direction={{ default: "column" }}>
        <FlexItem>
          {showIcon && (
            <span className="file-icon">
              <IconTrash
                onClick={() => {
                  handleDeleteDispatch && handleDeleteDispatch(file.name);
                }}
              />
            </span>
          )}
        </FlexItem>
      </Flex>
    </Flex>
  );
};

function generateLocalFileList(
  localFiles: File[],
  handleDeleteDispatch: (file: string) => void
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
