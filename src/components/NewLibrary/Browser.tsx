<<<<<<< HEAD
import {
  FileBrowserFolderFile,
  FileBrowserFolder,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import {
  Button,
  Card,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownList,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalVariant,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { notification } from "antd";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  EllipsisVIcon,
  ExternalLinkSquareAltIcon,
  FileIcon,
  FolderIcon,
} from "../Icons";
import { elipses } from "../LibraryCopy/utils";
import FileDetailView from "../Preview/FileDetailView";
import useDownload from "./useDownloadHook";
import useLongPress from "../LibraryCopy/utils";
=======
import { Fragment, useEffect, useState, useRef } from "react";
import {
  Card,
  CardHeader,
  GridItem,
  Split,
  SplitItem,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import {
  FileIcon,
  FolderIcon,
  EllipsisVIcon,
  ExternalLinkSquareAltIcon,
} from "../Icons";
import { elipses } from "../LibraryCopy/utils";
import { useNavigate } from "react-router";
>>>>>>> 8412135d (feat: A mvp for the library page)

type Pagination = {
  totalCount: number;
  hasNextPage: boolean;
};

export const FolderCard = ({
  folders,
  handleFolderClick,
  computedPath,
  pagination,
}: {
<<<<<<< HEAD
  folders: FileBrowserFolder[];
=======
  folders: any;
>>>>>>> 8412135d (feat: A mvp for the library page)
  handleFolderClick: (path: string) => void;
  computedPath: string;
  pagination?: Pagination;
}) => {
  return (
    <Fragment>
<<<<<<< HEAD
      {folders.map((folder) => {
        return (
          <SubFolderCard
            key={`sub_folder_${folder.data.path}`}
            val={folder}
            computedPath={computedPath}
            handleFolderClick={handleFolderClick}
          />
        );
=======
      {Array.from(folders.entries()).map(([key, value, index]) => {
        if (value.length > 0) {
          return (
            <Fragment key={`folder_${index}`}>
              {value.map((val: any, innerIndex) => (
                <SubFolderCard
                  key={`sub_folder_${innerIndex}`}
                  val={val}
                  computedPath={computedPath}
                  handleFolderClick={handleFolderClick}
                />
              ))}
            </Fragment>
          );
        }
        return null;
>>>>>>> 8412135d (feat: A mvp for the library page)
      })}
    </Fragment>
  );
};

<<<<<<< HEAD
export const SubFolderCard = ({
=======
const SubFolderCard = ({
>>>>>>> 8412135d (feat: A mvp for the library page)
  val,
  computedPath,
  handleFolderClick,
}: {
<<<<<<< HEAD
  val: FileBrowserFolder;
=======
  val: any;
>>>>>>> 8412135d (feat: A mvp for the library page)
  computedPath: string;
  handleFolderClick: (path: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPreview, setPreview] = useState(true);

  const onSelect = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(!isOpen);
  };

  const headerActions = (
    <Dropdown
      onSelect={onSelect}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          isExpanded={isOpen}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          variant="plain"
          aria-label="Card header images and actions example kebab toggle"
        >
          <EllipsisVIcon aria-hidden="true" />
        </MenuToggle>
      )}
      isOpen={isOpen}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
    >
      <DropdownList>
        <DropdownItem
<<<<<<< HEAD
          onClick={async (e) => {
            e.stopPropagation();
=======
          onClick={() => {
>>>>>>> 8412135d (feat: A mvp for the library page)
            setPreview(!isPreview);
          }}
          key="action"
        >
<<<<<<< HEAD
          Download
=======
          File Preview
>>>>>>> 8412135d (feat: A mvp for the library page)
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  const valSplitList = val.data.path.split("/");
  const pathName = valSplitList[valSplitList.length - 1];
  const folderName = computedPath === "/" ? val.data.path : pathName;
  const creation_date = val.data.creation_date;

  return (
<<<<<<< HEAD
    <GridItem sm={1} lg={4} md={4} xl={4} xl2={4} key={val.data.id}>
=======
    <GridItem sm={1} lg={4} md={4} xl={4} xl2={4} key={val.id}>
>>>>>>> 8412135d (feat: A mvp for the library page)
      <Card
        onClick={() => {
          handleFolderClick(folderName);
        }}
        isRounded
      >
        <CardHeader actions={{ actions: headerActions }}>
          <Split>
            <SplitItem style={{ marginRight: "1em" }}>
              <FolderIcon />
            </SplitItem>
            <SplitItem>
              <Button variant="link" style={{ padding: 0 }}>
                {elipses(folderName, 40)}
              </Button>
              <div>{new Date(creation_date).toDateString()}</div>
            </SplitItem>
          </Split>
        </CardHeader>
      </Card>
    </GridItem>
  );
};

export const LinkCard = ({
  linkFiles,
  pagination,
}: {
<<<<<<< HEAD
  linkFiles: FileBrowserFolderLinkFile[];
=======
  linkFiles: any;
>>>>>>> 8412135d (feat: A mvp for the library page)
  pagination?: Pagination;
}) => {
  const navigate = useNavigate();
  return (
    <Fragment>
<<<<<<< HEAD
      {linkFiles.map((val) => {
        const pathList = val.data.path.split("/");
        const linkName = pathList[pathList.length - 1];
        const creation_date = val.data.creation_date;
        return (
          <GridItem sm={1} lg={4} md={4} xl={4} xl2={4} key={val.data.fname}>
            <Card
              onClick={() => {
                navigate(val.data.path);
              }}
              isRounded
            >
              <CardHeader>
                <Split>
                  <SplitItem style={{ marginRight: "1em" }}>
                    <ExternalLinkSquareAltIcon />
                  </SplitItem>
                  <SplitItem>
                    <Button variant="link" style={{ padding: 0 }}>
                      {elipses(linkName, 40)}
                    </Button>
                    <div>{new Date(creation_date).toDateString()}</div>
                  </SplitItem>
                </Split>
              </CardHeader>
            </Card>
          </GridItem>
        );
=======
      {Array.from(linkFiles.entries()).map(([key, value, index]) => {
        if (value.length > 0) {
          return (
            <Fragment key={index}>
              {value.map((val: any) => {
                const pathList = val.data.path.split("/");
                const linkName = pathList[pathList.length - 1];
                const creation_date = val.data.creation_date;
                return (
                  <GridItem
                    sm={1}
                    lg={4}
                    md={4}
                    xl={4}
                    xl2={4}
                    key={val.data.fname}
                  >
                    <Card
                      onClick={() => {
                        navigate(val.data.path);
                      }}
                      isRounded
                    >
                      <CardHeader>
                        <Split>
                          <SplitItem style={{ marginRight: "1em" }}>
                            <ExternalLinkSquareAltIcon />
                          </SplitItem>
                          <SplitItem>
                            <Button variant="link" style={{ padding: 0 }}>
                              {elipses(linkName, 40)}
                            </Button>
                            <div>{new Date(creation_date).toDateString()}</div>
                          </SplitItem>
                        </Split>
                      </CardHeader>
                    </Card>
                  </GridItem>
                );
              })}
            </Fragment>
          );
        }
        return null;
>>>>>>> 8412135d (feat: A mvp for the library page)
      })}
    </Fragment>
  );
};

export const FilesCard = ({
  files,
  pagination,
}: {
<<<<<<< HEAD
  files: FileBrowserFolderFile[];
=======
  files: any;
>>>>>>> 8412135d (feat: A mvp for the library page)
  pagination?: Pagination;
}) => {
  return (
    <Fragment>
<<<<<<< HEAD
      {files.map((file) => {
        return (
          <GridItem sm={1} lg={4} md={4} xl={4} xl2={4} key={file.data.fname}>
            <SubFileCard file={file} />
          </GridItem>
        );
=======
      {Array.from(files.entries()).map(([key, value, index]) => {
        if (value.length > 0) {
          return (
            <Fragment key={`file_${index}`}>
              {value.map((val: any) => {
                return (
                  <GridItem
                    sm={1}
                    lg={4}
                    md={4}
                    xl={4}
                    xl2={4}
                    key={val.data.fname}
                  >
                    <SubFileCard file={val} />
                  </GridItem>
                );
              })}
            </Fragment>
          );
        }
        return null;
>>>>>>> 8412135d (feat: A mvp for the library page)
      })}
    </Fragment>
  );
};

<<<<<<< HEAD
export const SubFileCard = ({ file }: { file: FileBrowserFolderFile }) => {
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const { handleOnClick, handleOnMouseDown } = handlers;
  const [api, contextHolder] = notification.useNotification();
  const [preview, setIsPreview] = useState(false);
=======
export const SubFileCard = ({ file }: { file: any }) => {
>>>>>>> 8412135d (feat: A mvp for the library page)
  const [isOpen, setIsOpen] = useState(false);
  const listOfPaths = file.data.fname.split("/");
  const fileName = listOfPaths[listOfPaths.length - 1];
  const creation_date = file.data.creation_date;
<<<<<<< HEAD
  const { isSuccess, isError, error: downloadError } = handleDownloadMutation;

  useEffect(() => {
    if (isSuccess) {
      api.success({
        message: "Successfully Triggered the Download",
        duration: 1,
      });

      setTimeout(() => {
        handleDownloadMutation.reset();
      }, 1000);
    }

    if (isError) {
      api.error({
        message: "Download Error",
        //@ts-ignore
        description: downloadError.message,
      });
    }
  }, [isSuccess, isError, downloadError]);
=======
>>>>>>> 8412135d (feat: A mvp for the library page)

  const onSelect = () => {
    setIsOpen(!isOpen);
  };

  const dropdownItems = (
    <>
<<<<<<< HEAD
      <DropdownItem
        onClick={async (e) => {
          e.stopPropagation();
          handleDownloadMutation.mutate(file);
        }}
        key="action"
      >
        Download
=======
      <DropdownItem onClick={async () => {}} key="action">
        File Preview
>>>>>>> 8412135d (feat: A mvp for the library page)
      </DropdownItem>
    </>
  );

  const headerActions = (
    <>
      <Dropdown
        onSelect={onSelect}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            isExpanded={isOpen}
<<<<<<< HEAD
            onClick={(e) => {
              e?.stopPropagation();
              setIsOpen(!isOpen);
            }}
=======
            onClick={() => setIsOpen(!isOpen)}
>>>>>>> 8412135d (feat: A mvp for the library page)
            variant="plain"
            aria-label="Card header images and actions example kebab toggle"
          >
            <EllipsisVIcon aria-hidden="true" />
          </MenuToggle>
        )}
        isOpen={isOpen}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      >
        <DropdownList>{dropdownItems}</DropdownList>
      </Dropdown>
    </>
  );

  return (
<<<<<<< HEAD
    <>
      <Card
        onClick={() => {
          setIsPreview(!preview);
        }}
        isRounded
      >
        {contextHolder}
        <CardHeader actions={{ actions: headerActions }}>
          <Split>
            <SplitItem style={{ marginRight: "1em" }}>
              <FileIcon />
            </SplitItem>

            <SplitItem>
              <Button
                variant="link"
                style={{
                  padding: 0,
                }}
              >
                {elipses(fileName, 40)}
              </Button>
              <div>{new Date(creation_date).toDateString()}</div>
            </SplitItem>
          </Split>
        </CardHeader>
      </Card>
      {
        <Modal
          className="library-preview"
          variant={ModalVariant.large}
          title="Preview"
          aria-label="viewer"
          isOpen={preview}
          onClose={() => setIsPreview(false)}
        >
          <FileDetailView selectedFile={file} preview="large" />
        </Modal>
      }
    </>
=======
    <Card isRounded>
      <CardHeader actions={{ actions: headerActions }}>
        <Split>
          <SplitItem style={{ marginRight: "1em" }}>
            <FileIcon />
          </SplitItem>

          <SplitItem>
            <Button
              variant="link"
              style={{
                padding: 0,
              }}
            >
              {elipses(fileName, 40)}
            </Button>
            <div>{new Date(creation_date).toDateString()}</div>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
>>>>>>> 8412135d (feat: A mvp for the library page)
  );
};
