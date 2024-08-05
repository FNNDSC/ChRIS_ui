import type { FileBrowserFolder } from "@fnndsc/chrisapi";
import {
  Button,
  Card,
  CardHeader,
  Checkbox,
  GridItem,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { useContext } from "react";
import { Fragment } from "react/jsx-runtime";
import { elipses } from "../../../api/common";
import { useTypedSelector } from "../../../store/hooks";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { FolderIcon } from "../../Icons";
import useLongPress, { getBackgroundRowColor } from "../utils/longpress";
import { FolderContextMenu } from "./ContextMenu";

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
  const { handleOnClick, handleOnMouseDown, handleCheckboxChange } = handlers;
  const folderSplitList = folder.data.path.split("/");
  const pathName = folderSplitList[folderSplitList.length - 1];
  const folderName = computedPath === "/" ? folder.data.path : pathName;
  const creation_date = folder.data.creation_date;
  const isSelected =
    selectedPaths.length > 0 &&
    selectedPaths.some((payload) => payload.path === folder.data.path);

  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);

  return (
    <GridItem xl={3} lg={4} xl2={3} md={6} sm={12} key={folder.data.id}>
      <FolderContextMenu folderPath={folder.data.path}>
        <Card
          style={{
            background: selectedBgRow,
            cursor: "pointer",
          }}
          isSelected={isSelected}
          isClickable
          isSelectable
          isCompact
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
          <CardHeader
            actions={{
              actions: (
                <Checkbox
                  className="large-checkbox"
                  isChecked={isSelected}
                  id={folder.data.id}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onChange={(e) => {
                    handleCheckboxChange(e, folder.data.path, folder, "folder");
                  }}
                />
              ),
            }}
          >
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
      </FolderContextMenu>
    </GridItem>
  );
};
