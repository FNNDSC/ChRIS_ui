import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Split,
  SplitItem,
  Progress,
  Modal,
  ModalVariant,
} from "@patternfly/react-core";
import { notification } from "antd";
import { useContext, useState } from "react";
import FaFile from "@patternfly/react-icons/dist/esm/icons/file-icon";
import FaDownload from "@patternfly/react-icons/dist/esm/icons/download-icon";
import AiOutlineClose from "@patternfly/react-icons/dist/esm/icons/close-icon";
import useLongPress from "./utils";
import FileDetailView from "../Preview/FileDetailView";
import { FileViewerModel } from "../../api/model";
import { DotsIndicator } from "../Common";
import { elipses } from "./utils";
import { LibraryContext } from "./context";

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
        <Split style={{ overflow: "hidden" }}>
          <SplitItem>
            <FaFile />
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
            icon={
              <FaDownload
                style={{ cursor: "pointer" }}
                onClick={async (event) => {
                  event.stopPropagation();
                  FileViewerModel.startDownload(
                    file,
                    notification,
                    (statusCallbackValue: any) => {
                      const statusValue = statusCallbackValue[file.data.fname];
                      setDownloadStatus(statusValue);
                    },
                  );
                }}
              />
            }
          />
          {status === 0 && <DotsIndicator title="Processing Download..." />}
          {status && status > 0 ? (
            <div style={{ display: "flex" }}>
              <Progress
                style={{
                  width: "100%",
                }}
                size="sm"
                value={status}
              />{" "}
              <AiOutlineClose
                style={{
                  color: "red",
                  marginLeft: "0.25rem",
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  FileViewerModel.abortControllers[file.data.fname].abort();
                }}
              />
            </div>
          ) : null}
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
