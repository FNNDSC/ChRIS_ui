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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { isEmpty } from "lodash";
import { useContext } from "react";
import { Fragment } from "react/jsx-runtime";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { elipses } from "../../../api/common";
import { useTypedSelector } from "../../../store/hooks";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { FolderIcon } from "../../Icons";
import useLongPress, { getBackgroundRowColor } from "../utils/longpress";
import { FolderContextMenu } from "./ContextMenu";
import { OperationContext } from "../context";

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

  const creationDate = folder.data.creation_date;

  const isSelected = selectedPaths.some(
    (payload) => payload.path === folder.data.path,
  );
  const selectedBgRow = getBackgroundRowColor(isSelected, isDarkTheme);

  // When users create an analysis, they have a specific name in mind. Showing the user the underlying
  // folder path (e.g., feed_98) can be confusing if the analysis is titled 'Freesurfer Analysis'.
  // Therefore, we perform an additional fetch to display the feed folders with their analysis titles.

  const feedMatches = folderName.match(/feed_(\d+)/);
  const { data, isLoading } = useQuery({
    queryKey: ["associatedFeed", folder.data.path],
    queryFn: async () => {
      const id = feedMatches ? feedMatches[1] : null;

      if (id) {
        const client = ChrisAPIClient.getClient();
        const feed = await client.getFeed(Number(id));
        if (!feed) throw new Error("Failed to fetch the feed");
        return feed.data.name;
      }
      return null;
    },
    enabled: feedMatches?.length > 0,
  });

  return (
    <GridItem xl={3} lg={4} md={6} sm={12} key={folder.data.id}>
      <FolderContextMenu
        origin={{
          type: OperationContext.LIBRARY,
          additionalKeys: [computedPath],
        }}
      >
        <Card
          style={{ background: selectedBgRow, cursor: "pointer" }}
          isSelected={isSelected}
          isClickable
          isSelectable
          isCompact
          isFlat
          onClick={(e) => handleOnClick(e, folder, folder.data.path, "folder")}
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
                  {!data && !isLoading
                    ? elipses(folderName, 40)
                    : data
                      ? elipses(data, 40)
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
