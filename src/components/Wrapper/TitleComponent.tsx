import { useLocation } from "react-router";

import { Typography } from "antd";
import { InfoIcon } from "../Common";
const { Paragraph } = Typography;
import { matchPath } from "react-router";
import {
  useFeedListData,
  useSearchQueryParams,
} from "../Feeds/useFeedListData";
import { useFetchFeed } from "../Feeds/useFetchFeed";
import { useTypedSelector } from "../../store/hooks";
import { CodeBranchIcon } from "../Icons";

const FeedsNameComponent = () => {
  const { feedCount, loadingFeedState } = useFeedListData();

  return (
    <InfoIcon
      data-test-id="analysis-count"
      title={`New and Existing Analyses (${
        !feedCount && loadingFeedState
          ? "Fetching..."
          : feedCount === -1
            ? 0
            : feedCount
      })`}
      p1={
        <Paragraph>
          Analyses (aka ChRIS feeds) are computational experiments where data
          are organized and processed by ChRIS plugins. In this view you may
          view your analyses and also the ones shared with you.
        </Paragraph>
      }
    />
  );
};

const { Title } = Typography;
const FeedsDetailComponent = ({ id }: { id?: string }) => {
  const query = useSearchQueryParams();
  const type = query.get("type");
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);

  const { feed } = useFetchFeed(id, type, isLoggedIn);

  return (
    <Title level={4} style={{ marginBottom: 0 }}>
      <CodeBranchIcon style={{ marginRight: "0.25em" }} />
      {feed?.data.name}
    </Title>
  );
};

const TitleComponent = () => {
  const location = useLocation();

  const match = matchPath("/feeds/:id", location.pathname);

  if (match) {
    const { id } = match.params;
    return <FeedsDetailComponent id={id} />;
  }

  return location.pathname === "/feeds" ? <FeedsNameComponent /> : null;
};

export default TitleComponent;
