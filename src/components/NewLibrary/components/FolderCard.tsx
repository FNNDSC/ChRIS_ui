import type { FileBrowserFolder } from "@fnndsc/chrisapi";
import {
  Button,
  Card,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownList,
  GridItem,
  MenuToggle,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { EllipsisVIcon, FolderIcon } from "../../Icons";
import { elipses } from "../../LibraryCopy/utils";
import useLongPress from "../utils/longpress";

type Pagination = {
  totalCount: number;
  hasNextPage: boolean;
};

export const FolderCard = ({
  folders,
  handleFolderClick,
  computedPath,
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
            folder={folder}
            computedPath={computedPath}
            handleFolderClick={handleFolderClick}
          />
        );
      })}
    </Fragment>
  );
};

export const SubFolderCard = ({
  folder,
  computedPath,
  handleFolderClick,
}: {
  folder: FileBrowserFolder;
  computedPath: string;
  handleFolderClick: (path: string) => void;
}) => {
  const { handlers } = useLongPress();
  const { handleOnClick, handleOnMouseDown } = handlers;
  const [isOpen, setIsOpen] = useState(false);

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
          }}
          key="action"
        >
          Share
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  const folderSplitList = folder.data.path.split("/");
  const pathName = folderSplitList[folderSplitList.length - 1];
  const folderName = computedPath === "/" ? folder.data.path : pathName;
  const creation_date = folder.data.creation_date;

  return (
    <GridItem xl={3} lg={4} xl2={3} md={6} sm={12} key={folder.data.id}>
      <Card
        isCompact
        isSelectable
        isClickable
        isFlat
        onClick={(e) => {
          handleOnClick(
            e,
            folder,
            folderName,
            folder.data.path,
            "folder",
            handleFolderClick,
          );
        }}
        onMouseDown={() => {
          handleOnMouseDown();
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
