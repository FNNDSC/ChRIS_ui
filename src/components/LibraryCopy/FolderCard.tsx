import {
  Card,
  CardHeader,
  Split,
  SplitItem,
  Button,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FolderIcon as FaFolder } from "../Icons";
import { ExternalLinkSquareAltIcon } from "../Icons";
import useLongPress, { elipses } from "./utils";
import { fetchAuthenticatedFeed, fetchPublicFeed } from "../Feeds/utilties";

function FolderCard({
  folder,
  handleFolderClick,
  path,
}: {
  folder: string;
  handleFolderClick: (path: string) => void;
  path: string;
}) {
  const { handlers } = useLongPress();
  const { handleOnClick, handleOnMouseDown } = handlers;

  const handlePath = (e: any) => {
    handleOnClick(e, folder, `${path}/${folder}`, handleFolderClick);
  };

  const isRoot = folder.startsWith("feed");

  const fetchFeedDetails = async (id: string) => {
    if (!id) return;

    const publicFeed = await fetchPublicFeed(id);

    if (publicFeed) {
      return {
        feed: publicFeed,
        type: "public",
      };
    }
    const authenticatedFeed = await fetchAuthenticatedFeed(id);

    return {
      feed: authenticatedFeed,
      type: "private",
    };
  };

  const id = folder.split("_")[1];

  const { data } = useQuery({
    queryKey: ["feed", id],
    queryFn: () => fetchFeedDetails(id),
    enabled: !!folder.startsWith("feed"),
  });

  return (
    <Card
      isRounded
      onMouseDown={handleOnMouseDown}
      onClick={(e) => {
        if (!isRoot) {
          handlePath(e);
        }
      }}
    >
      <CardHeader
        actions={{
          actions: data?.feed?.data.id ? (
            <span>
              <Link to={`/feeds/${data?.feed?.data.id}?type=${data?.type}`}>
                {" "}
                <ExternalLinkSquareAltIcon />
              </Link>
            </span>
          ) : null,
        }}
      >
        <Split style={{ overflow: "hidden" }}>
          <SplitItem style={{ marginRight: "1em" }}>
            <FaFolder />
          </SplitItem>
          <SplitItem isFilled>
            <Button
              variant="link"
              style={{ padding: 0 }}
              onClick={(e) => {
                if (isRoot) {
                  handlePath(e);
                }
              }}
            >
              {data ? elipses(data?.feed?.data.name, 40) : elipses(folder, 40)}
            </Button>
            <div>
              {data && new Date(data?.feed?.data.creation_date).toDateString()}
            </div>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  );
}

export default FolderCard;
