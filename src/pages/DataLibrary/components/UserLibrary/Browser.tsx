import React, { useState } from "react";
import {
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardActions,
  CardBody,
  Split,
  SplitItem,
  Button,
  Dropdown,
  KebabToggle,
  DropdownItem,
  Modal,
} from "@patternfly/react-core";
import {
  FaFile,
  FaFolder,
  FaTrashAlt,
  FaDownload,
  FaExpand,
} from "react-icons/fa";
import FileDetailView from "../../../../components/feed/Preview/FileDetailView";
import { Paginated } from "./context";
import FileViewerModel from "../../../../api/models/file-viewer.model";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { Spin } from "antd";
import { Link } from "react-router-dom";

interface BrowserInterface {
  initialPath: string;
  folders: string[];
  files: any[];
  paginated: {
    [key: string]: Paginated;
  };
  handlePagination: (path: string) => void;
  previewAll: boolean;
  handleDelete?: (path: string, folder: string) => void;
  handleDownload?: (path: string, folder: string) => void;
  browserType: string;
  username?: string | null;
}

export function Browser({
  initialPath,
  folders,
  files,
  paginated,
  handlePagination,
  previewAll,
  handleDelete,
  handleDownload,
  browserType,
  username,
}: BrowserInterface) {
  return (
    <Grid hasGutter>
      {files && files.length > 0
        ? files.map((file) => {
            return (
              <GridItem key={file.data.fname} sm={12} lg={4}>
                <FileCard previewAll={previewAll} file={file} />
              </GridItem>
            );
          })
        : folders &&
          folders.length > 0 &&
          folders.map((folder, index) => {
            return (
              <GridItem key={`${folder}_${index}`} sm={12} lg={4}>
                <FolderCard
                  browserType={browserType}
                  initialPath={initialPath}
                  handleDelete={handleDelete}
                  handleDownload={handleDownload}
                  key={index}
                  folder={folder}
                  username={username}
                />
              </GridItem>
            );
          })}

      {folders &&
        folders.length > 0 &&
        Object.keys(paginated).length > 0 &&
        initialPath &&
        paginated[initialPath] &&
        paginated[initialPath].hasNext && (
          <GridItem>
            <Split>
              <SplitItem isFilled>
                <Button
                  onClick={() => {
                    handlePagination(initialPath);
                  }}
                  variant="link"
                >
                  Read more Folders
                </Button>
              </SplitItem>
            </Split>
          </GridItem>
        )}

      {files &&
        files.length > 0 &&
        Object.keys(paginated).length > 0 &&
        initialPath &&
        paginated[initialPath] &&
        paginated[initialPath].hasNext && (
          <GridItem>
            <Split>
              <SplitItem isFilled>
                <Button
                  onClick={() => {
                    handlePagination(initialPath);
                  }}
                  variant="link"
                >
                  Read more files
                </Button>
              </SplitItem>
            </Split>
          </GridItem>
        )}
    </Grid>
  );
}

function FileCard({ file, previewAll }: { file: any; previewAll: boolean }) {
  const fileNameArray = file.data.fname.split("/");
  const fileName = fileNameArray[fileNameArray.length - 1];
  const [largePreview, setLargePreview] = React.useState(false);

  return (
    <>
      <Card key={file.data.fname} isRounded isHoverable isSelectable>
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

          <div
            style={{
              overflow: "hidden",
            }}
          >
            <Button icon={<FaFile />} variant="link" style={{ padding: "0" }}>
              <b>{elipses(fileName, 20)}</b>
            </Button>
          </div>
          <div>
            <span>{(file.data.fsize / (1024 * 1024)).toFixed(3)} MB</span>
            <Button
              onClick={async () => {
                const blob = await file.getFileBlob();
                const fileNameList = file.data.fname.split("/");
                const fileName = fileNameList[fileNameList.length - 1];
                FileViewerModel.downloadFile(blob, fileName);
              }}
              variant="link"
              icon={<FaDownload />}
            />

            <Button
              variant="link"
              onClick={() => {
                setLargePreview(true);
              }}
              icon={<FaExpand />}
            ></Button>
          </div>
        </CardBody>
        {largePreview && (
          <Modal
            title="Preview"
            aria-label="viewer"
            width={"50%"}
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

interface FolderCardInterface {
  browserType: string;
  initialPath: string;
  folder: string;
  handleDelete?: (path: string, folder: string) => void;
  handleDownload?: (path: string, folder: string) => void;
  username?: string | null;
}

function FolderCard({
  browserType,
  initialPath,
  folder,
  handleDelete,
  handleDownload,
  username,
}: FolderCardInterface) {
  const [dropdown, setDropdown] = useState(false);
  const [feedName, setFeedName] = useState("");
  const toggle = (
    <KebabToggle
      onToggle={() => setDropdown(!dropdown)}
      style={{ padding: "0" }}
    />
  );

  React.useEffect(() => {
    async function fetchFeedName() {
      if (browserType === "feed" && initialPath === username) {
        const client = ChrisAPIClient.getClient();
        const id = folder.split("_")[1];
        const feed = await client.getFeed(parseInt(id));
        setFeedName(feed.data.name);
      }
    }
    fetchFeedName();
  }, [browserType, folder, username, initialPath]);

  const pad = <span style={{ padding: "0 0.25em" }} />;

  const downloadDropdown = (
    <DropdownItem
      key="download folder"
      component="button"
      onClick={() => {
        //handleDownload()
        handleDownload && handleDownload(`${initialPath}/${folder}`, folder);
      }}
    >
      <FaDownload />
      {pad} Download
    </DropdownItem>
  );

  const deleteDropdown = (
    <DropdownItem
      key="delete"
      component="button"
      onClick={() => {
        handleDelete && handleDelete(`${initialPath}/${folder}`, folder);
      }}
    >
      <FaTrashAlt />
      {pad} Delete
    </DropdownItem>
  );

  return (
    <Card isHoverable isSelectable isRounded>
      <CardHeader>
        <CardActions>
          <Dropdown
            isPlain
            toggle={toggle}
            isOpen={dropdown}
            position="right"
            onSelect={() => {
              setDropdown(false);
            }}
            dropdownItems={
              browserType == "uploads"
                ? [deleteDropdown, downloadDropdown]
                : [downloadDropdown]
            }
          ></Dropdown>
        </CardActions>
        <Split style={{ overflow: "hidden" }}>
          <SplitItem style={{ marginRight: "1em" }}>
            <FaFolder />
          </SplitItem>
          <SplitItem isFilled>
            <Link to={`/library/${initialPath}/${folder}?type=${browserType}`}>
              <Button style={{ padding: 0 }} variant="link">
                <b>
                  {browserType === "feed" && initialPath === username ? (
                    !feedName ? (
                      <Spin />
                    ) : (
                      elipses(feedName, 36)
                    )
                  ) : (
                    elipses(folder, 36)
                  )}
                </b>
              </Button>
            </Link>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  );
}

function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return str.slice(0, len - 3) + "...";
}
