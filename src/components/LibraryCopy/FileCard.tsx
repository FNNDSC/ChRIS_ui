import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalVariant,
  Progress,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import axios, { AxiosProgressEvent } from "axios";
import { useContext, useEffect, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { FileViewerModel } from "../../api/model";
import { DownloadIcon, FileIcon } from "../Icons";
import FileDetailView from "../Preview/FileDetailView";
import { LibraryContext } from "./context";
import useLongPress, { elipses } from "./utils";

const FileCard = ({ file }: { file: any }) => {
  const { state } = useContext(LibraryContext);
  const { handlers } = useLongPress();
  const { handleOnClick, handleOnMouseDown } = handlers;

  const [largePreview, setLargePreview] = useState(false);
  const [status, setDownloadStatus] = useState(-1);
  const handlePreview = () => {
    setLargePreview(!largePreview);
  };
  const fileNameArray = file.data.fname.split("/");
  const fileName = fileNameArray[fileNameArray.length - 1];
  const { previewAll } = state;

  const downloadFile = useMutation({
    mutationFn: () => {
      const url = file.collection.items[0].links[0].href;
      if (!url) {
        throw new Error("Count not fetch the file from this url");
      }
      const client = ChrisAPIClient.getClient();
      const token = client.auth.token;

      const downloadPromise = axios.get(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent?.progress) {
            setDownloadStatus(progressEvent.progress * 100);
          }
        },
      });
      return downloadPromise;
    },
  });

  useEffect(() => {
    if (downloadFile.isSuccess) {
      const { data: response } = downloadFile;
      const link = document.createElement("a");
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const fileViewer = new FileViewerModel();
      const fileName = fileViewer.getFileName(file);
      link.target = "_blank";
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      notification.info({
        message: `Triggered download for ${fileName}`,
        duration: 0.5,
      });
      downloadFile.reset();
      setDownloadStatus(-1);
    }

    if (downloadFile.isError) {
      notification.error({
        message: `${downloadFile.error.message}`,
        duration: 2,
      });
      downloadFile.reset();
    }
  }, [downloadFile.isSuccess, downloadFile.isError]);

  return (
    <Card
      onClick={(e) => {
        if (!largePreview) {
          handleOnClick(e, file.data.fname, file.data.fname, handlePreview);
        }
      }}
      onMouseDown={() => {
        if (!largePreview) {
          handleOnMouseDown();
        }
      }}
      isClickable
      isSelectable
      isRounded
    >
      <CardHeader>
        <Split style={{ overflow: "hidden", alignItems: "center" }}>
          <SplitItem>
            <FileIcon />
          </SplitItem>
          <SplitItem isFilled>
            <Button variant="link">{elipses(fileName, 40)}</Button>
          </SplitItem>
        </Split>
      </CardHeader>
      <CardBody>
        {previewAll && (
          <div
            style={{
              margin: "-1.15em -1.15em 1em -1.15em",
              maxHeight: "10em",
              overflow: "hidden",
            }}
          >
            <FileDetailView selectedFile={file} preview="small" />
          </div>
        )}
        <div>
          <span>{(file.data.fsize / (1024 * 1024)).toFixed(3)} MB</span>
          <Button
            style={{ marginLeft: "0.5rem" }}
            variant="link"
            onClick={async (event) => {
              event.stopPropagation();
              downloadFile.mutate();
            }}
            icon={<DownloadIcon style={{ cursor: "pointer" }} />}
          />
          {status > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Progress
                style={{
                  width: "100%",
                }}
                size="sm"
                value={status}
              />
            </div>
          )}
        </div>
      </CardBody>
      {largePreview && (
        <Modal
          className="library-preview"
          variant={ModalVariant.large}
          title="Preview"
          aria-label="viewer"
          isOpen={largePreview}
          onClose={() => setLargePreview(false)}
        >
          <FileDetailView selectedFile={file} preview="large" />
        </Modal>
      )}
    </Card>
  );
};

export default FileCard;
