import React, { useState } from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import { Upload, message } from "antd";
import { AiOutlineInbox } from "react-icons/ai";
const { Dragger } = Upload;

export interface OriRcFile extends File {
  uid: string;
}

export interface RcFile extends OriRcFile {
  readonly lastModifiedDate: Date;
}

export declare type UploadFileStatus =
  | "error"
  | "success"
  | "done"
  | "uploading"
  | "removed";

export interface UploadFile<T = any> {
  uid: string;
  size?: number;
  name: string;
  fileName?: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  url?: string;
  status?: UploadFileStatus;
  percent?: number;
  thumbUrl?: string;
  originFileObj?: RcFile;
  response?: T;
  error?: any;
  linkProps?: any;
  type?: string;
  xhr?: T;
  preview?: string;
}

const VisualizationPage = () => {
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

  return (
    <Wrapper>
      <>
        <Dragger
          fileList={fileList}
          name="file"
          multiple={true}
          onChange={(info) => {
            const { status } = info.file;
            if (status !== "uploading") {
            }
            if (status === "done") {
              message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === "error") {
              message.error(`${info.file.name} file upload failed.`);
            }
            setFileList(info.fileList);
          }}
          onDrop={(e) => {
            // setFileList(e.dataTransfer.files);
          }}
        >
          <p className="ant-upload-drag-icon">
            <AiOutlineInbox />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">Support for a single or bulk upload</p>
        </Dragger>
        <span>{fileList.length}</span>
      </>
    </Wrapper>
  );
};

export default VisualizationPage;
