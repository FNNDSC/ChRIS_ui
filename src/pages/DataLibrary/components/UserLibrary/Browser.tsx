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
} from "@patternfly/react-core";
import {
  FaFile,
  FaFolder,
  FaEye,
  FaTrashAlt,
  FaDownload,
} from "react-icons/fa";
import FileDetailView from "../../../../components/feed/Preview/FileDetailView";
import { Paginated } from ".";

export function Browser({
  initialPath,
  handleFolderClick,
  folders,
  files,
  paginated,
  handlePagination,
  resetPaginated,
  previewAll,
}: {
  initialPath: string;
  handleFolderClick: (path: string) => void;
  folders: string[];
  files: any[];
  paginated: {
    [key: string]: Paginated;
  };
  handlePagination: (path: string) => void;
  resetPaginated: (path: string) => void;
  previewAll: boolean;
}) {
  return (
    <Grid hasGutter>
      {files.length > 0
        ? files.map((file) => {
            return (
              <GridItem key={file.data.fname} sm={12} lg={4}>
                <FileCard previewAll={previewAll} file={file} />
              </GridItem>
            );
          })
        : folders.map((folder, index) => {
            return (
              <GridItem key={`${folder}_${index}`} sm={12} lg={4}>
                <FolderCard
                  initialPath={initialPath}
                  handleFolderClick={handleFolderClick}
                  key={index}
                  folder={folder}
                />
              </GridItem>
            );
          })}

      {files.length > 0 && paginated[initialPath].hasNext == true ? (
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
      ) : folders.length > 0 && paginated[initialPath].hasNext ? (
        <GridItem>
          <Split>
            <SplitItem isFilled>
              <Button
                onClick={() => {
                  handlePagination(initialPath);
                }}
                variant="link"
              >
                Read more folders
              </Button>
            </SplitItem>
          </Split>
        </GridItem>
      ) : (
        <div></div>
      )}
    </Grid>
  );
}

function FileCard({ file, previewAll }: { file: any; previewAll: boolean }) {
  const fileNameArray = file.data.fname.split("/");
  const fileName = fileNameArray[fileNameArray.length - 1];

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
              onClick={() => {
                const url = file.url;
                const nameSplit = file.data.fname.split("/");
                const name = nameSplit[nameSplit.length - 1];
                const link = document.createElement("a");
                link.href = `${url}/${name}`;
                link.setAttribute("download", fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              variant="link"
              icon={<FaDownload />}
            />
          </div>
        </CardBody>
      </Card>
    </>
  );
}

function FolderCard({
  initialPath,
  folder,
  handleFolderClick,
}: {
  initialPath: string;
  folder: string;
  handleFolderClick: (path: string) => void;
}) {
  const [dropdown, setDropdown] = useState(false);
  const toggle = (
    <KebabToggle
      onToggle={() => setDropdown(!dropdown)}
      style={{ padding: "0" }}
    />
  );
  const pad = <span style={{ padding: "0 0.25em" }} />;
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
            dropdownItems={[
              <DropdownItem
                key="view"
                component="button"
                onClick={() => {
                  console.log("Test");
                }}
              >
                <FaEye />
                {pad} View
              </DropdownItem>,
              <DropdownItem
                key="delete"
                component="button"
                onClick={() => {
                  console.log("Test");
                }}
              >
                <FaTrashAlt />
                {pad} Delete
              </DropdownItem>,
            ]}
          ></Dropdown>
        </CardActions>
        <Split style={{ overflow: "hidden" }}>
          <SplitItem style={{ marginRight: "1em" }}>
            <FaFolder />
          </SplitItem>
          <SplitItem isFilled>
            <Button
              style={{ padding: 0 }}
              variant="link"
              onClick={() => {
                handleFolderClick(`${initialPath}/${folder}`);
              }}
            >
              <b>{elipses(folder, 36)}</b>
            </Button>
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
