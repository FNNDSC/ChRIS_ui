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
import { differenceInSeconds, format } from "date-fns";
import { isEmpty } from "lodash";
import { useContext, useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { elipses } from "../../../api/common";
import { useTypedSelector } from "../../../store/hooks";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { FolderIcon } from "../../Icons";
import { OperationContext } from "../context";
import useLongPress, {
  getBackgroundRowColor,
  useAssociatedFeed,
} from "../utils/longpress";
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

interface SubFolderCardProps {
  folder: FileBrowserFolder;
  computedPath: string;
  handleFolderClick: (path: string) => void;
}

export function getFolderName(folder: FileBrowserFolder, computedPath: string) {
  const folderPathParts = folder.data.path.split("/");
  const pathName = folderPathParts[folderPathParts.length - 1];
  const folderName = computedPath === "/" ? folder.data.path : pathName;
  return folderName;
}

export const SubFolderCard: React.FC<SubFolderCardProps> = (props) => {
  const { folder, computedPath, handleFolderClick } = props;
  const isDarkTheme = useContext(ThemeContext).isDarkTheme;
  const selectedPaths = useTypedSelector((state) => state.cart.selectedPaths);
  const { handlers } = useLongPress();

  const { handleOnClick, handleOnMouseDown, handleCheckboxChange } = handlers;
  const folderName = getFolderName(folder, computedPath);
  const { data: feedName, isLoading } = useAssociatedFeed(folderName);

  const creationDate = folder.data.creation_date;
  const secondsSinceCreation = differenceInSeconds(new Date(), creationDate);

  const [isNewFolder, setIsNewFolder] = useState<boolean>(
    secondsSinceCreation <= 15,
  );

  useEffect(() => {
    if (isNewFolder) {
      const timeoutId = setTimeout(() => {
        setIsNewFolder(false);
      }, 2000); // 60 seconds

      // Cleanup the timeout if the component unmounts before the timeout completes
      return () => clearTimeout(timeoutId);
    }
  }, [isNewFolder]);

  const isSelected = selectedPaths.some(
    (payload) => payload.path === folder.data.path,
  );

  const shouldHighlight = isNewFolder || isSelected;
  const highlightedBgRow = getBackgroundRowColor(shouldHighlight, isDarkTheme);

  return (
    <GridItem xl={3} lg={4} md={6} sm={12} key={folder.data.id}>
      <FolderContextMenu
        origin={{
          type: OperationContext.LIBRARY,
          additionalKeys: [computedPath],
        }}
      >
        <Card
          style={{
            background: highlightedBgRow,
            cursor: "pointer",
          }}
          isSelected={isSelected}
          isClickable
          isSelectable
          isCompact
          isFlat
          onClick={(e) => {
            handleOnClick(e, folder, folder.data.path, "folder", () => {
              handleFolderClick(folderName);
            });
          }}
          onContextMenu={(e) =>
            handleOnClick(e, folder, folder.data.path, "folder")
          }
          onMouseDown={handleOnMouseDown}
          isRounded
        >
          <CardHeader
            actions={{
              actions: (
                <Checkbox
                  className="large-checkbox"
                  isChecked={isSelected}
                  id={folder.data.id}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleCheckboxChange(e, folder.data.path, folder, "folder")
                  }
                />
              ),
            }}
          >
            <Split>
              <SplitItem style={{ marginRight: "1em" }}>
                <FolderIcon />
              </SplitItem>
              <SplitItem>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFolderClick(folderName);
                  }}
                  variant="link"
                  style={{ padding: 0 }}
                >
                  {!feedName && !isLoading
                    ? elipses(folderName, 40)
                    : feedName
                      ? elipses(feedName, 40)
                      : "Fetching..."}
                </Button>
                <div
                  style={{
                    fontSize: "0.85rem",
                  }}
                >
                  {!isEmpty(creationDate)
                    ? format(new Date(creationDate), "dd MMM yyyy, HH:mm")
                    : "N/A"}
                </div>
              </SplitItem>
            </Split>
          </CardHeader>
        </Card>
      </FolderContextMenu>
    </GridItem>
  );
};
