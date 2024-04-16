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
  folders: any;
  handleFolderClick: (path: string) => void;
  computedPath: string;
  pagination?: Pagination;
}) => {
  return (
    <Fragment>
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
      })}
    </Fragment>
  );
};

const SubFolderCard = ({
  val,
  computedPath,
  handleFolderClick,
}: {
  val: any;
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
          onClick={() => {
            setPreview(!isPreview);
          }}
          key="action"
        >
          File Preview
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  const valSplitList = val.data.path.split("/");
  const pathName = valSplitList[valSplitList.length - 1];
  const folderName = computedPath === "/" ? val.data.path : pathName;
  const creation_date = val.data.creation_date;

  return (
    <GridItem sm={1} lg={4} md={4} xl={4} xl2={4} key={val.id}>
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
  linkFiles: any;
  pagination?: Pagination;
}) => {
  const navigate = useNavigate();
  return (
    <Fragment>
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
      })}
    </Fragment>
  );
};

export const FilesCard = ({
  files,
  pagination,
}: {
  files: any;
  pagination?: Pagination;
}) => {
  return (
    <Fragment>
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
      })}
    </Fragment>
  );
};

export const SubFileCard = ({ file }: { file: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const listOfPaths = file.data.fname.split("/");
  const fileName = listOfPaths[listOfPaths.length - 1];
  const creation_date = file.data.creation_date;

  const onSelect = () => {
    setIsOpen(!isOpen);
  };

  const dropdownItems = (
    <>
      <DropdownItem onClick={async () => {}} key="action">
        File Preview
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
            onClick={() => setIsOpen(!isOpen)}
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
  );
};
