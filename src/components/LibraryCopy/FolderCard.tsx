import {
  Card,
  CardHeader,
  Split,
  SplitItem,
  Button,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import FaFolder from "@patternfly/react-icons/dist/esm/icons/folder-icon";
import ChrisAPIClient from "../../api/chrisapiclient";
import MdOutlineOpenInNew from "@patternfly/react-icons/dist/esm/icons/open-drawer-right-icon";
import useLongPress, { elipses } from "./utils";

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

  const fetchFeedDetails = async (id: number) => {
    if (!id) return;
    const client = ChrisAPIClient.getClient();
    const feed = await client.getFeed(id);
    return feed;
  };

  const id = folder.split("_")[1];

  const { data: feed } = useQuery({
    queryKey: ["feed", id],
    queryFn: () => fetchFeedDetails(+id),
    enabled: !!folder.startsWith("feed"),
  });

  return (
    <Card
      isClickable
      isRounded
      onMouseDown={handleOnMouseDown}
      onClick={(e) => {
        handlePath(e);
      }}
    >
      <CardHeader
        actions={{
          actions:
            feed && feed.data.id ? (
              <span>
                <Link to={`/feeds/${feed.data.id}`}>
                  {" "}
                  <MdOutlineOpenInNew />
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
                handlePath(e);
              }}
            >
              {feed ? elipses(feed.data.name, 40) : elipses(folder, 40)}
            </Button>
            <div>
              {feed && new Date(feed.data.creation_date).toDateString()}
            </div>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  );
}

export default FolderCard;
