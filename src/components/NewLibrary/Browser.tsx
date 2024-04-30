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
<<<<<<< HEAD
import useDownload from "./useDownloadHook";
import useLongPress from "../LibraryCopy/utils";
=======
import ChrisAPIClient from "../../api/chrisapiclient";
>>>>>>> 3c50fa9a (refactor: fix merge conflicts)

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
  folders: FileBrowserFolder[];
  handleFolderClick: (path: string) => void;
  computedPath: string;
  pagination?: Pagination;
}) => {
  return (
    <Fragment>
      {folders.map((folder) => {
        return (
          <SubFolderCard
            key={`sub_folder_${folder.data.path}`}
            val={folder}
            computedPath={computedPath}
            handleFolderClick={handleFolderClick}
          />
        );
      })}
    </Fragment>
  );
};

export const SubFolderCard = ({
  val,
  computedPath,
  handleFolderClick,
}: {
  val: FileBrowserFolder;
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
          onClick={async (e) => {
            e.stopPropagation();
            setPreview(!isPreview);
          }}
          key="action"
        >
          Download
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  const valSplitList = val.data.path.split("/");
  const pathName = valSplitList[valSplitList.length - 1];
  const folderName = computedPath === "/" ? val.data.path : pathName;
  const creation_date = val.data.creation_date;

  return (
    <GridItem sm={1} lg={4} md={4} xl={4} xl2={4} key={val.data.id}>
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
  linkFiles: FileBrowserFolderLinkFile[];
  pagination?: Pagination;
}) => {
  const navigate = useNavigate();
  return (
    <Fragment>
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
      })}
    </Fragment>
  );
};

export const FilesCard = ({
  files,
  pagination,
}: {
  files: FileBrowserFolderFile[];
  pagination?: Pagination;
}) => {
  return (
    <Fragment>
      {files.map((file) => {
        return (
          <GridItem sm={1} lg={4} md={4} xl={4} xl2={4} key={file.data.fname}>
            <SubFileCard file={file} />
          </GridItem>
        );
      })}
    </Fragment>
  );
};

export const SubFileCard = ({ file }: { file: FileBrowserFolderFile }) => {
<<<<<<< HEAD
  const handleDownloadMutation = useDownload();
  const { handlers } = useLongPress();
  const { handleOnClick, handleOnMouseDown } = handlers;
  const [api, contextHolder] = notification.useNotification();
=======
>>>>>>> 3c50fa9a (refactor: fix merge conflicts)
  const [preview, setIsPreview] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const listOfPaths = file.data.fname.split("/");
  const fileName = listOfPaths[listOfPaths.length - 1];
  const creation_date = file.data.creation_date;
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

  const onSelect = () => {
    setIsOpen(!isOpen);
  };

  const dropdownItems = (
    <>
      <DropdownItem
        onClick={async (e) => {
          e.stopPropagation();
<<<<<<< HEAD
          handleDownloadMutation.mutate(file);
=======
          const client = ChrisAPIClient.getClient();
          const token = await client.createDownloadToken();
          const url = file.collection.items[0].links[0].href;
          if (!url) {
            throw new Error("Failed to construct the url");
          }
          const authorizedUrl = `${url}?${token}`;
          const link = document.createElement("a");
          link.href = authorizedUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
>>>>>>> 3c50fa9a (refactor: fix merge conflicts)
        }}
        key="action"
      >
        Download
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
            onClick={(e) => {
              e?.stopPropagation();
              setIsOpen(!isOpen);
            }}
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
    <>
      <Card
        onClick={() => {
          setIsPreview(!preview);
        }}
        isRounded
      >
<<<<<<< HEAD
        {contextHolder}
=======
>>>>>>> 3c50fa9a (refactor: fix merge conflicts)
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
  );
};
