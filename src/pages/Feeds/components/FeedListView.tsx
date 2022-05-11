import * as React from 'react'
import { Dispatch } from 'redux'
import {  connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Moment from 'react-moment'
import '@patternfly/react-core/dist/styles/base.css'

import {
  PageSection,
  PageSectionVariants,
  Title,
  Pagination,
  EmptyState,
  EmptyStateBody,
  Hint,
  HintBody,
  Checkbox,
} from '@patternfly/react-core'
import { Table, TableBody, Thead, Tr, Th } from '@patternfly/react-table'
import { ChartDonutUtilization } from '@patternfly/react-charts'
import { ApplicationState } from '../../../store/root/applicationState'
import { setSidebarActive } from '../../../store/ui/actions'
import {
  getAllFeedsRequest,
  setBulkSelect,
  removeBulkSelect,
} from '../../../store/feed/actions'
import { IFeedState } from '../../../store/feed/types'
import { DataTableToolbar } from '../../../components/index'
import { CreateFeed } from '../../../components/feed/CreateFeed/CreateFeed'
import { CreateFeedProvider } from '../../../components/feed/CreateFeed/context'
import {
  EmptyStateTable,
  generateTableLoading,
} from '../../../components/common/emptyTable'
import { usePaginate } from '../../../components/common/pagination'
import { Feed } from '@fnndsc/chrisapi'
import IconContainer from './IconContainer'

interface IPropsFromDispatch {
  setSidebarActive: typeof setSidebarActive
  getAllFeedsRequest: typeof getAllFeedsRequest
  setBulkSelect: typeof setBulkSelect
  removeBulkSelect: typeof removeBulkSelect
}

type AllProps = IFeedState & IPropsFromDispatch

const FeedListView: React.FC<AllProps> = ({
  setSidebarActive,
  allFeeds,
  bulkSelect,
  getAllFeedsRequest,
  setBulkSelect,
  removeBulkSelect,
}: AllProps) => {
  const {
    filterState,
    handlePageSet,
    handlePerPageSet,
    handleFilterChange,
    run,
  } = usePaginate()

  const { page, perPage } = filterState
  const { data, error, loading, totalFeedsCount } = allFeeds

  React.useEffect(() => {
    document.title = 'All Analyses - ChRIS UI '
    setSidebarActive({
      activeItem: 'analyses',
    })
  }, [setSidebarActive])

  const getAllFeeds = React.useCallback(() => {
    run(getAllFeedsRequest)
  }, [getAllFeedsRequest, run])

  React.useEffect(() => {
    getAllFeeds()
  }, [getAllFeeds])

  const generateTableRow = (feed: Feed) => {
    const {
      id,
      name: feedName,

      creation_date,
      finished_jobs,
    } = feed.data
    const {
      created_jobs,
      registering_jobs,
      scheduled_jobs,
      started_jobs,
      waiting_jobs,
    } = feed.data
    const { errored_jobs, cancelled_jobs } = feed.data
    const name = {
      title: (
        <span className="feed-list__name">
          <Link to={`/feeds/${id}`}>{feedName}</Link>
        </span>
      ),
    }

    const runningJobsCount =
      created_jobs +
      registering_jobs +
      scheduled_jobs +
      started_jobs +
      waiting_jobs

    const error = errored_jobs + cancelled_jobs

    const created = {
      title: (
        <span>
          <Moment format="DD MMM , HH:mm">{creation_date}</Moment>{' '}
        </span>
      ),
    }

    const feedSize = {
      title: <p>coming soon</p>,
    };

    const runTime = {
      title: <p>coming soon</p>,
    };
      
    const getProgress = function (feed: Feed) {
      let progress = 0

      if (runningJobsCount == 0) {
        progress = 100
      } else {
        progress = (finished_jobs / (runningJobsCount + finished_jobs)) * 100
      }

      return Math.round(progress)
    }

    let feedProgressText =
      finished_jobs +
      '/' +
      (runningJobsCount + finished_jobs) +
      ' jobs completed'
    let progress = getProgress(feed)
    let threshold = Infinity;
    
    // If error in a feed => reflect in progress
    if (error) {
      progress = Math.round((finished_jobs/(finished_jobs + error))*100);
      feedProgressText = error + "/" + (finished_jobs + error) + " jobs failed";
      threshold = progress;
    }
    const percentage = progress + '%';

    const circularProgress = {
      title: (
        <div style={{ height: '40px', width: '40px', display: 'block' }}>
          <ChartDonutUtilization
            ariaTitle={feedProgressText}
            data={{ x: 'Feed Progress', y: progress }}
            height={125}
            title={percentage}
            thresholds={[{ value: threshold, color :'#C9190B' }]}
            width={125}
          />
        </div>
      ),
    }

    const bulkChecbox = {
      title: (
        <Checkbox
          isChecked={bulkSelect.includes(feed)}
          id="check"
          aria-label="toggle icon bar"
          onChange={() => {
            if (!bulkSelect.includes(feed)) {
              setBulkSelect(feed)
            } else {
              removeBulkSelect(feed)
            }
          }}
        />
      ),
    }

    return {
      cells: [bulkChecbox, name, created, feedSize, runTime, circularProgress],
    }
  }

  const cells = [
    '',
    'Analysis',
    'Created',
    'Size',
    'Run Time',
    'Progress',
    'Download',
    '',
  ]

  const rows = data && data.length > 0 ? data.map(generateTableRow) : []

  const generatePagination = () => {
    if (!data || !totalFeedsCount) {
      return null
    }

    return (
      <Pagination
        itemCount={totalFeedsCount}
        perPage={perPage}
        page={page}
        onSetPage={handlePageSet}
        onPerPageSelect={handlePerPageSet}
      />
    )
  }

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
    )
  }
  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light} className="feed-header">
        <div className="feed-header__split">
          <Title headingLevel="h1" size="3xl">
            New and Existing Analyses
            {totalFeedsCount > 0 ? (
              <span className="feed-header__count">({totalFeedsCount})</span>
            ) : null}
          </Title>
          <CreateFeedProvider>
            <CreateFeed />
          </CreateFeedProvider>
        </div>

        <Hint
          //@ts-ignore
          style={{
            width: '50%',
            paddingBottom: '0',
          }}
        >
          <HintBody>
            All Analyses that you have completed are recorded here. You can
            easily return to a completed analysis and add more analysis
            components, or you can create a brand new analysis from scratch.
          </HintBody>
        </Hint>
      </PageSection>

      <PageSection className="feed-list">
        <div className="feed-list__split">
          <DataTableToolbar
            onSearch={handleFilterChange}
            label="filter by name"
          />
          {bulkSelect.length > 0 && <IconContainer />}

          {generatePagination()}
        </div>
        {(!data && !loading) || (data && data.length === 0) ? (
          <EmptyStateTable
            cells={cells}
            rows={rows}
            caption="Empty Feed List"
            title="No Feeds Found"
            description="Create a Feed by clicking on the 'Create Feed' button"
          />
        ) : (
          <Table
            variant="compact"
            aria-label="Data table"
            cells={cells}
            rows={rows}
          >
            {
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th>Analysis</Th>
                  <Th>Created</Th>
                  <Th>Size</Th>
                  <Th>Run Time</Th>
                  <Th></Th>
                </Tr>
              </Thead>
            }

            {loading ? generateTableLoading() : <TableBody />}
          </Table>
        )}
      </PageSection>
    </React.Fragment>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setSidebarActive: (active: { activeItem: string }) =>
    dispatch(setSidebarActive(active)),
  getAllFeedsRequest: (name?: string, limit?: number, offset?: number) =>
    dispatch(getAllFeedsRequest(name, limit, offset)),
  setBulkSelect: (feed: Feed) => dispatch(setBulkSelect(feed)),
  removeBulkSelect: (feed: Feed) => dispatch(removeBulkSelect(feed)),
})

const mapStateToProps = ({ feed }: ApplicationState) => ({
  bulkSelect: feed.bulkSelect,
  allFeeds: feed.allFeeds,
  downloadStatus: feed.downloadStatus,
})

export default connect(mapStateToProps, mapDispatchToProps)(FeedListView)
