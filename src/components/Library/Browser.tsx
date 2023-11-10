import React, { useState, useContext } from "react";
import {
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Split,
  SplitItem,
  Button,
  Modal,
  ModalVariant,
} from "@patternfly/react-core";
import { Spin, notification, Progress } from "antd";
import { Link } from "react-router-dom";
import FaFile from "@patternfly/react-icons/dist/esm/icons/file-icon";
import FaFolder from "@patternfly/react-icons/dist/esm/icons/folder-icon";
import FaDownload from "@patternfly/react-icons/dist/esm/icons/download-icon";
import AiOutlineClose from "@patternfly/react-icons/dist/esm/icons/close-icon";
import MdOutlineOpenInNew from "@patternfly/react-icons/dist/esm/icons/open-drawer-right-icon";
import FileDetailView from "../Preview/FileDetailView";
import { LibraryContext } from "./context";
import ChrisAPIClient from "../../api/chrisapiclient";
import useLongPress from "./useLongPress";
import { FileViewerModel } from "../../api/model";
import { DotsIndicator } from "../Common";

export function Browser({
  folders,
  files,
  handleFolderClick,
  browserType,
  columnLayout,
}: {
  folders: {
    path: string;
    name: string;
  }[];
  files: any[];
  handleFolderClick: (path: string) => void;
  browserType: string;
  columnLayout: string;
}) {
  return (
    <Grid hasGutter>
      {files &&
        files.length > 0 &&
        files.map((file) => {
          return (
            <GridItem
              key={file.data.fname}
              sm={12}
              lg={columnLayout === "single" ? 12 : 4}
            >
              <FileCard file={file} browserType={browserType} />
            </GridItem>
          );
        })}
      {folders &&
        folders.length > 0 &&
        folders.map((folder, index) => {
          return (
            <GridItem
              key={`${folder}_${index}`}
              sm={12}
              lg={columnLayout === "single" ? 12 : 3}
            >
              <FolderCard
                folder={folder}
                browserType={browserType}
                handleFolderClick={handleFolderClick}
              />
            </GridItem>
          );
        })}
    </Grid>
  );
}

function FolderCard({
  folder,
  browserType,
  handleFolderClick,
}: {
  folder: {
    path: string;
    name: string;
  };
  browserType: string;
  handleFolderClick: (path: string) => void;
}) {
  const { state } = useContext(LibraryContext);
  const { handlers } = useLongPress();
  const { handleOnClick, handleOnMouseDown } = handlers;
  const { selectedFolder, columnLayout } = state;
  const [feedDetails, setFeedDetails] = useState({
    id: "",
    name: "",
    commitDate: "",
  });

  const background = selectedFolder.some((file) => {
    return file.folder.path === `${folder.path}/${folder.name}`;
  });

  const isRoot = browserType === "feed" && folder.name.startsWith("feed");

  React.useEffect(() => {
    async function fetchFeedName() {
      if (isRoot) {
        const client = ChrisAPIClient.getClient();
        const id = folder.name.split("_")[1];
        const feed = await client.getFeed(parseInt(id));
        setFeedDetails({
          id: id,
          name: feed.data.name,
          commitDate: feed.data.creation_date,
        });
      }
    }
    fetchFeedName();
    return () => {
      setFeedDetails({
        id: "",
        name: "",
        commitDate: "",
      });
    };
  }, [browserType, folder, isRoot]);

  const handlePath = (e: any) => {
    const path = `${folder.path}/${folder.name}`;
    handleOnClick(
      e,
      folder.path,
      path,
      folder,
      browserType,
      "folder",
      handleFolderClick
    );
  };

  return (
    <Card
      isClickable
      isSelectable
      isRounded
      isSelected={background}
      onMouseDown={handleOnMouseDown}
      onClick={(e) => {
        if (!isRoot) {
          handlePath(e);
        }
      }}
    >
      <CardHeader
        actions={{
          actions: feedDetails.id ? (
            <span>
              <Link to={`/feeds/${feedDetails.id}`}>
                {" "}
                <MdOutlineOpenInNew />
              </Link>
            </span>
          ) : null,
        }}
      >
        <Split style={{ overflow: "hidden" }}>
          <SplitItem style={{ marginRight: "1em" }}>
            <FaFolder />
          </SplitItem>
          <SplitItem isFilled>
            <Button
              onClick={(e) => {
                if (isRoot) {
                  handlePath(e);
                }
              }}
              style={{ padding: 0 }}
              variant="link"
            >
              {" "}
              {isRoot ? (
                !feedDetails.name ? (
                  <Spin />
                ) : columnLayout === "single" ? (
                  feedDetails.name
                ) : (
                  elipses(feedDetails.name, 40)
                )
              ) : columnLayout === "single" ? (
                folder.name
              ) : (
                elipses(folder.name, 40)
              )}
            </Button>
            <div>
              {feedDetails.commitDate
                ? new Date(feedDetails.commitDate).toDateString()
                : ""}
            </div>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  );
}

function FileCard({ file, browserType }: { file: any; browserType: string }) {
  const { handlers } = useLongPress();
  const { state } = useContext(LibraryContext);
  const { previewAll, columnLayout } = state;
  const { handleOnClick, handleOnMouseDown } = handlers;
  const fileNameArray = file.data.fname.split("/");
  const fileName = fileNameArray[fileNameArray.length - 1];
  const [largePreview, setLargePreview] = React.useState(false);
  const [status, setDownloadStatus] = React.useState(-1);
  const handlePreview = () => {
    setLargePreview(!largePreview);
  };

  return (
    <>
      <Card
        isClickable
        isSelectable
        isRounded
        onClick={(e) => {
          if (!largePreview) {
            const path = file.data.fname;
            const folder = {
              path,
              name: fileName,
            };
            const previousPath = fileNameArray
              .slice(0, fileNameArray.length - 1)
              .join("/");

            handleOnClick(
              e,
              previousPath,
              path,
              folder,
              browserType,
              "file",
              handlePreview
            );
          }
        }}
        onMouseDown={() => {
          if (!largePreview) {
            handleOnMouseDown();
          }
        }}
        key={file.data.fname}
      >
        <CardHeader>
          <Split style={{ overflow: "hidden" }}>
            <SplitItem style={{ marginRight: "1em" }}>
              <FaFile />
            </SplitItem>
            <SplitItem isFilled>
              <Button variant="link" style={{ padding: "0" }}>
                {columnLayout === "single" ? fileName : elipses(fileName, 40)}
              </Button>
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
                        const statusValue =
                          statusCallbackValue[file.data.fname];
                        setDownloadStatus(statusValue);
                      }
                    );
                  }}
                />
              }
            />
            {status === 0 && <DotsIndicator />}
            {status && status > 0 ? (
              <div style={{ display: "flex" }}>
                <Progress size="small" percent={status} />{" "}
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
    </>
  );
}

function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return str.slice(0, len - 3) + "...";
}
