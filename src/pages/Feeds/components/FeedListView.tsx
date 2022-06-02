import * as React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
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
  Spinner
} from '@patternfly/react-core'
import { Table, TableBody, Thead, Tr, Th } from '@patternfly/react-table'
import { ChartDonutUtilization } from '@patternfly/react-charts'
import { ApplicationState } from '../../../store/root/applicationState'
import { setSidebarActive } from '../../../store/ui/actions'
import {
  getAllFeedsRequest,
  setBulkSelect,
  removeBulkSelect,
  getFeedResourcesRequest,
  removeAllSelect,
  setAllSelect,
  toggleSelectAll,
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
  setAllSelect: typeof setAllSelect
  removeAllSelect: typeof removeAllSelect
  toggleSelectAll: typeof toggleSelectAll
}

type AllProps = IFeedState & IPropsFromDispatch

const FeedListView: React.FC<AllProps> = ({
  setSidebarActive,
  selectAllToggle,
  allFeeds,
  bulkSelect,
  getAllFeedsRequest,
  setBulkSelect,
  removeBulkSelect,
  feedResources,
  setAllSelect,
  removeAllSelect,
  toggleSelectAll,
}: AllProps) => {
  const {
    filterState,
    handlePageSet,
    handlePerPageSet,
    handleFilterChange,
    run,
    dispatch,
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

  const getFeedResources = React.useCallback(
    (feed) => {
      dispatch(getFeedResourcesRequest(feed))
    },
    [dispatch],
  )

  React.useEffect(() => {
    getAllFeeds()
  }, [getAllFeeds])

  React.useEffect(() => {
    if (allFeeds.data && allFeeds.data.length > 0) {
      allFeeds.data.map((feed) => {
        getFeedResources(feed)
      })
    }
  }, [allFeeds.data, getFeedResources])

  React.useEffect(() => {
    if (selectAllToggle && allFeeds.data && allFeeds.data.length > 0) {
      setAllSelect(allFeeds.data)
    }
  }, [allFeeds.data, setAllSelect, selectAllToggle])

  const generateTableRow = (feed: Feed) => {
    const { id, name: feedName, creation_date } = feed.data


    const fontFamily = {
      fontFamily: 'monospace',
    }

    const size =
      feedResources[feed.data.id] && feedResources[feed.data.id].details.size
    const feedError =
      feedResources[feed.data.id] && feedResources[feed.data.id].details.error
    const runtime =
      feedResources[feed.data.id] && feedResources[feed.data.id].details.time
    const progress =
      feedResources[feed.data.id] &&
      feedResources[feed.data.id].details.progress
    const feedProgressText =
      feedResources[feed.data.id] &&
      feedResources[feed.data.id].details.feedProgressText
      


    const name = {
      title: (
        <span className="feed-list__name">
          <Link to={`/feeds/${id}`}>{feedName}</Link>
        </span>
      ),
    }


    const created = {
      title: (
        <span style={fontFamily}>
          <Moment format="DD MMM YYYY, HH:mm">{creation_date}</Moment>{' '}
        </span>
      ),
    }

    const feedSize = {
      title: (
        <p style={{
          ...fontFamily,
          textAlign: 'center',
          margin: '0 auto'
        }}>{size ? `${size.padStart(10, '')}` : '---'}</p>
      ),
    }

    const runTime = {
      title: <p style={fontFamily}>{runtime ? `${runtime}` : '---'}</p>,
    }


    let threshold = Infinity
    let color = "#0000ff"

    // If error in a feed => reflect in progress
    if (feedError) {
      color = "#ff0000"
      threshold = progress
    }
    let title = (progress ? progress : 0) + '%'
    
    // If initial node in a feed fails
    if (progress == 0 && feedError) {
      title = '❌'
    }
    
    // If progress less than 100%, display green
    if(progress < 100 && !feedError){

      color =  "#00ff00"

      threshold = progress
    }
    if(progress == 100)
    {
      title='✔️'
    }

    const circularProgress = {
      title: (
        <div
          style={{
            textAlign: 'right',
            height: '40px',
            width: '40px',
            display: 'block',
          }}
        >
          <ChartDonutUtilization
            ariaTitle={feedProgressText}
            data={{ x: 'Feed Progress', y: progress }}
            height={125}
            title={title}
            thresholds={[{ value: threshold, color: color }]}
            width={125}
          />
        </div>
      ),
    }
    
    const CustomSize = {
    title :(
   <Spinner isSVG size="lg" aria-label="Contents of the custom size example"/>
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
      cells: [bulkChecbox, name, created, runTime, feedSize, circularProgress],
    }
  }

  const cells = [
    '',
    'Analysis',
    'Created',
    'Run Time',
    'Size',
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
                  <Th>
                    <Checkbox
                      id="test"
                      isChecked={selectAllToggle}
                      onChange={() => {
                        if (!selectAllToggle) {
                          if (allFeeds.data) setAllSelect(allFeeds.data)
                          toggleSelectAll(true)
                        } else {
                          if (allFeeds.data) removeAllSelect(allFeeds.data)
                          toggleSelectAll(false)
                        }
                      }}
                    />
                  </Th>
                  <Th>Analysis</Th>
                  <Th>Created</Th>
                  <Th>Run Time</Th>
                    <Th style={{
                      textAlign: 'center',
                      margin: '0 auto'
                    }}>Size</Th>
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
  setAllSelect: (feeds: Feed[]) => dispatch(setAllSelect(feeds)),
  removeAllSelect: (feeds: Feed[]) => dispatch(removeAllSelect(feeds)),
  toggleSelectAll: (flag: boolean) => dispatch(toggleSelectAll(flag)),
})

const mapStateToProps = ({ feed }: ApplicationState) => ({
  bulkSelect: feed.bulkSelect,
  allFeeds: feed.allFeeds,
  downloadStatus: feed.downloadStatus,
  feedResources: feed.feedResources,
  selectAllToggle: feed.selectAllToggle,
})

export default connect(mapStateToProps, mapDispatchToProps)(FeedListView)
