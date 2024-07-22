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
import { useContext, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { EllipsisVIcon, FolderIcon } from "../../Icons";
import { elipses } from "../../LibraryCopy/utils";
import useLongPress, { getBackgroundRowColor } from "../utils/longpress";
import { useTypedSelector } from "../../../store/hooks";
import { ThemeContext } from "../../DarkTheme/useTheme";

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
  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const { handlers } = useLongPress();
  const { handleOnClick, handleOnMouseDown } = handlers;
  const folderSplitList = folder.data.path.split("/");
  const pathName = folderSplitList[folderSplitList.length - 1];
  const folderName = computedPath === "/" ? folder.data.path : pathName;
  const creation_date = folder.data.creation_date;
  const isSelected = selectedPaths.some(
    (payload) => payload.path === folder.data.path,
  );

  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);

  return (
    <GridItem xl={3} lg={4} xl2={3} md={6} sm={12} key={folder.data.id}>
      <Card
        style={{
          background: selectedBgRow,
        }}
        isSelected={isSelected}
        isSelectable
        isCompact
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
        <CardHeader>
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
