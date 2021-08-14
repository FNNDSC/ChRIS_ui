import * as React from "react";
import { Dispatch } from "redux";
import { useDispatch, connect } from "react-redux";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import {
  PageSection,
  Pagination,
  EmptyState,
  EmptyStateBody,
  Popover,
  Button,
  Grid,
  GridItem,
  Tooltip,
  Card,
  CardBody,
  Split,
  SplitItem,
  Badge,
  Spinner,
  EmptyStateIcon,
  Title,
} from "@patternfly/react-core";
import {
  CodeBranchIcon,
  TrashAltIcon,
  ExclamationCircleIcon,
  CubesIcon,
} from "@patternfly/react-icons";
import { Feed } from "@fnndsc/chrisapi";
import { ApplicationState } from "../../../store/root/applicationState";
import { setSidebarActive } from "../../../store/ui/actions";
import { getAllFeedsRequest, deleteFeed } from "../../../store/feed/actions";
import { IFeedState } from "../../../store/feed/types";
import { DataTableToolbar } from "../../../components/index";
import { CreateFeed } from "../../../components/feed/CreateFeed/CreateFeed";
import { CreateFeedProvider } from "../../../components/feed/CreateFeed/context";
import { usePaginate } from "../../../components/common/pagination";
import pluralize from "pluralize";
import { ArchiveIcon } from "@patternfly/react-icons";

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive;
  getAllFeedsRequest: typeof getAllFeedsRequest;
}

type AllProps = IFeedState & IPropsFromDispatch;

const FeedListView: React.FC<AllProps> = ({
  setSidebarActive,
  allFeeds,
  getAllFeedsRequest,
}: AllProps) => {
  const {
    filterState,
    handlePageSet,
    handlePerPageSet,
    handleFilterChange,
    run,
  } = usePaginate();
  const [currentId, setCurrentId] = React.useState<string | number>("none");
  const { page, perPage } = filterState;
  const { data, error, loading, totalFeedsCount } = allFeeds;

  React.useEffect(() => {
    document.title = "All Feeds - ChRIS UI ";
    setSidebarActive({
      activeGroup: "feeds_grp",
      activeItem: "my_feeds",
    });
  }, [setSidebarActive]);

  const handleToggle = (currentId: number | string) => {
    setCurrentId(currentId);
  };

  const getAllFeeds = React.useCallback(() => {
    run(getAllFeedsRequest);
  }, [getAllFeedsRequest, run]);

  React.useEffect(() => {
    getAllFeeds();
  }, [getAllFeeds]);

  const generatePagination = () => {
    if (!data || !totalFeedsCount) {
      return null;
    }

    return (
      <Pagination
        itemCount={totalFeedsCount}
        perPage={perPage}
        page={page}
        onSetPage={handlePageSet}
        onPerPageSelect={handlePerPageSet}
      />
    );
  };

  if (error) {
    return (
      <React.Fragment>
        <EmptyState>
          <EmptyStateBody>
            Unable to fetch feeds at the moment. Please refresh the browser. If
            the issue persists, Contact the dev team at FNNDSC to report your
            error.
          </EmptyStateBody>
        </EmptyState>
      </React.Fragment>
    );
  }
  return (
    <article>
      <Grid>
        <GridItem>
          <PageSection className="feed-header">
            <Split>
              <SplitItem isFilled><h1>My Feeds</h1></SplitItem>
              <SplitItem>
                <CreateFeedProvider>
                  <CreateFeed />
                </CreateFeedProvider>
              </SplitItem>
            </Split>
          </PageSection>
        </GridItem>
        <GridItem>
          <PageSection className="feed-list">
            <div className="feed-list__split">
              <DataTableToolbar
                onSearch={handleFilterChange}
                label="filter by name"
              />
              {generatePagination()}
            </div>

            <Grid hasGutter>
            {
              (data && !loading) ? (
                data.map((feed)=> {
                  const { id, name, modification_date, creation_date, finished_jobs } = feed.data;
                  const { created_jobs, registering_jobs, scheduled_jobs, started_jobs, waiting_jobs } = feed.data;
                  const { errored_jobs, cancelled_jobs } = feed.data;

                  const runningJobsCount =
                    created_jobs +
                    registering_jobs +
                    scheduled_jobs +
                    started_jobs +
                    waiting_jobs;

                  const errorCount = errored_jobs + cancelled_jobs;

                  const jobsCountText = runningJobsCount > 0 
                  ? <b>{ runningJobsCount } {pluralize('job', runningJobsCount)} running</b>
                  : <b>Completed { finished_jobs } {pluralize('jobs', finished_jobs)}</b>

                  return <GridItem key={name}>
                    <Card isRounded isHoverable isCompact>
                      <CardBody>
                        <Split>
                          <SplitItem style={{ marginRight: "0.5em" }}><CodeBranchIcon /></SplitItem>
                          <SplitItem style={{ minWidth: "25%" }}>
                            <div>
                              <Link to={`/feeds/${id}`}>{name}</Link> {
                                runningJobsCount > 0 &&
                                <Badge>Running</Badge>
                              }
                            </div>
                            <div style={{ fontSize: "small", color: "grey" }}>
                              { jobsCountText }
                            </div>
                          </SplitItem>

                          { errorCount > 0 &&
                            <SplitItem style={{ margin: "0 1em" }}>
                              <Tooltip content={`${errored_jobs} errors, ${cancelled_jobs} cancelled`}>
                                <div style={{ color: "firebrick" }}>
                                  <ExclamationCircleIcon /> <b>{ errorCount } {pluralize('error', errorCount)}</b>
                                </div>
                              </Tooltip>
                            </SplitItem>
                          }

                          <SplitItem isFilled/>

                          <SplitItem style={{ textAlign: "right", color: "grey", margin: "0 1em" }}>
                            <div><b>Last Commit</b></div>
                            <div>
                              <Moment fromNow>{modification_date}</Moment>
                            </div>
                          </SplitItem>

                          <SplitItem style={{ textAlign: "right", color: "grey", margin: "0 1em" }}>
                            <div><b>Created on</b></div>
                            <div><Moment format="DD MMM, HH:mm">{creation_date}</Moment></div>
                          </SplitItem>

                          <SplitItem>
                            <Button variant="link"
                                style={{ display: "flex", height: "100%" }}
                                // onClick={() => setCurrentId(feed.data.id)}
                              >
                              <Tooltip content="Archive">
                                <ArchiveIcon style={{ margin: "auto" }} />
                              </Tooltip>
                            </Button>
                          </SplitItem>

                          <SplitItem>
                            <Popover
                              key={feed.data.id}
                              isVisible={feed.data.id === currentId}
                              aria-label="delete-feed"
                              position="bottom"
                              shouldClose={() => setCurrentId("none")}
                              bodyContent={
                                <DeleteFeed
                                  key={feed.data.id}
                                  feed={feed}
                                  onTogglePopover={handleToggle}
                                />
                              }
                            >
                              <Button variant="link"
                                style={{ display: "flex", height: "100%" }}
                                onClick={() => setCurrentId(feed.data.id)}
                              >
                                <Tooltip content="Delete">
                                  <TrashAltIcon style={{ margin: "auto" }} />
                                </Tooltip>
                              </Button>
                            </Popover>
                          </SplitItem>
                        </Split>
                      </CardBody>
                    </Card>
                  </GridItem>
                })
              ) :
              loading ? (
                <EmptyState>
                  <EmptyStateIcon variant="container" component={Spinner} />
                  <Title size="lg" headingLevel="h4">Loading</Title>
                  <EmptyStateBody>
                    Fetching your Feeds
                  </EmptyStateBody>
                </EmptyState>
              ) : (
                <EmptyState>
                  <EmptyStateIcon variant="container" component={CubesIcon} />
                  <Title size="lg" headingLevel="h4">No Feeds Found</Title>
                  <EmptyStateBody>
                    Create a Feed by clicking on the &apos;Create Feed&apos; button
                  </EmptyStateBody>
                </EmptyState>
              )
            }
            </Grid>
          </PageSection>
        </GridItem>
      </Grid>
    </article>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string; activeGroup: string }) =>
    dispatch(setSidebarActive(active)),
  getAllFeedsRequest: (name?: string, limit?: number, offset?: number) =>
    dispatch(getAllFeedsRequest(name, limit, offset)),
});

const mapStateToProps = ({ feed }: ApplicationState) => ({
  allFeeds: feed.allFeeds,
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedListView);

function DeleteFeed({
  feed,
  onTogglePopover,
}: {
  feed: Feed;
  onTogglePopover: (currentId: number | string) => void;
}) {
  const dispatch = useDispatch();
  return (
    <>
      <p>Are you sure you want to delete this feed?</p>
      <Button
        style={{
          marginRight: "0.5em",
        }}
        onClick={() => {
          dispatch(deleteFeed(feed));
        }}
      >
        Yes
      </Button>
      <Button variant="secondary" onClick={() => onTogglePopover("none")}>No</Button>
    </>
  );
}
