import React from 'react'
import { useTypedSelector } from '../../../store/hooks'
import { useDispatch } from 'react-redux'
import JSZip from 'jszip'
import {
  Grid,
  GridItem,
  Skeleton,
  EmptyState,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core'
import { Spin, Alert, Tree } from 'antd'
import PluginViewerModal from '../../detailedView/PluginViewerModal'
import {
  clearSelectedFile,
  setExplorerMode,
  setSelectedFolder,
} from '../../../store/explorer/actions'
import { getPluginFilesRequest } from '../../../store/resources/actions'
import { PluginInstance, FeedFile } from '@fnndsc/chrisapi'
import { getFeedTree } from './data'
import { DataNode, ExplorerMode } from '../../../store/explorer/types'
import './FeedOutputBrowser.scss'
import usePluginInstanceResource from '../NodeDetails/usePluginInstanceResource'
import { getCurrentTitleFromStatus } from '../NodeDetails/StatusTitle'
import { generateTableLoading } from '../../common/emptyTable'

const FileBrowser = React.lazy(() => import('./FileBrowser'))
const { DirectoryTree } = Tree

export interface FeedOutputBrowserProps {
  handlePluginSelect: (node: PluginInstance) => void
  expandDrawer: (panel: string) => void
}

const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  handlePluginSelect,
  expandDrawer,
}) => {
  const [pluginModalOpen, setPluginModalOpen] = React.useState(false)
  const pluginInstanceResource = usePluginInstanceResource()
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginStatus
  const dispatch = useDispatch()
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances,
  )
  const { pluginFiles, loading: filesLoading } = useTypedSelector(
    (state) => state.resource,
  )
  const selected = useTypedSelector((state) => state.instance.selectedPlugin)
  const { data: plugins, loading: pluginInstanceLoading } = pluginInstances

  const pluginFilesPayload = selected && pluginFiles[selected.data.id]
  const status = ['finishedSuccessfully', 'finishedWithError', 'cancelled']
  let statusTitle:
    | {
        title: string
        icon: any
      }
    | undefined = undefined
  if (pluginStatus) {
    statusTitle = getCurrentTitleFromStatus(pluginStatus)
  }

  const finished = selected && status.includes(selected.data.status)

  React.useEffect(() => {
    if (!(pluginFilesPayload && pluginFilesPayload.files)) {
      if (selected && status.includes(selected.data.status)) {
        dispatch(
          getPluginFilesRequest({
            id: selected.data.id,
            path: selected.data.output_path,
          }),
        )
      }
    }
  }, [selected, finished])

  const handleFileClick = (path: string) => {
    if (selected) {
      dispatch(
        getPluginFilesRequest({
          id: selected.data.id,
          path,
        }),
      )
    }
  }

  const handleFileBrowserOpen = () => {
    dispatch(clearSelectedFile())
    setFolder()
    setPluginModalOpen(!pluginModalOpen)
  }

  const handlePluginModalClose = () => {
    setPluginModalOpen(!pluginModalOpen)
  }

  const setFolder = () => {
    if (pluginFilesPayload && pluginFilesPayload.files) {
      dispatch(setSelectedFolder(pluginFilesPayload.files))
    }
  }

  const handleDicomViewerOpen = () => {
    setFolder()
    setPluginModalOpen(!pluginModalOpen)
    dispatch(setExplorerMode(ExplorerMode.DicomViewer))
  }

  const handleXtkViewerOpen = () => {
    setFolder()
    setPluginModalOpen(!pluginModalOpen)
    dispatch(setExplorerMode(ExplorerMode.XtkViewer))
  }

  return (
    <>
      <Grid className="feed-output-browser ">
        <GridItem
          className="feed-output-browser__sidebar"
          xl={2}
          xlRowSpan={12}
          xl2={2}
          xl2RowSpan={12}
          lg={2}
          lgRowSpan={12}
          md={2}
          mdRowSpan={12}
          sm={12}
          smRowSpan={12}
        >
          {plugins && selected && (
            <SidebarTree
              plugins={plugins}
              selected={selected}
              handlePluginSelect={handlePluginSelect}
            />
          )}
        </GridItem>
        <GridItem
          className="feed-output-browser__main"
          xl={10}
          xlRowSpan={12}
          xl2={10}
          xl2RowSpan={12}
          lg={10}
          lgRowSpan={12}
          md={10}
          mdRowSpan={12}
          sm={12}
          smRowSpan={12}
        >
          <React.Suspense
            fallback={
              <div>
                <Skeleton
                  height="100%"
                  width="100%"
                  screenreaderText="Fetching the File Browser"
                />
              </div>
            }
          >
            {pluginFilesPayload ? (
              <FileBrowser
                selected={selected}
                handleFileClick={handleFileClick}
                pluginFilesPayload={pluginFilesPayload}
                handleFileBrowserToggle={handleFileBrowserOpen}
                handleDicomViewerOpen={handleDicomViewerOpen}
                handleXtkViewerOpen={handleXtkViewerOpen}
                expandDrawer={expandDrawer}
              />
            ) : statusTitle && statusTitle.title ? (
              <FetchFilesLoader title={statusTitle.title} />
            ) : filesLoading ? (
              generateTableLoading()
            ) : (
              <EmptyStateLoader />
            )}
          </React.Suspense>
        </GridItem>
      </Grid>
      <PluginViewerModal
        isModalOpen={pluginModalOpen}
        handleModalToggle={handlePluginModalClose}
      />
    </>
  )
}

export default FeedOutputBrowser

const SidebarTree = (props: {
  plugins: PluginInstance[]
  selected: PluginInstance
  handlePluginSelect: (node: PluginInstance) => void
}) => {
  const { selected, plugins, handlePluginSelect } = props
  const [tree, setTreeData] = React.useState<DataNode[]>()
  React.useEffect(() => {
    const pluginSidebarTree = getFeedTree(plugins)
    //@ts-ignore
    setTreeData(pluginSidebarTree)
  }, [plugins])

  return (
    <DirectoryTree
      multiple
      defaultExpandAll
      treeData={tree}
      selectedKeys={[selected.data.id]}
      onSelect={(node, selectedNode) => {
        //@ts-ignore
        handlePluginSelect(selectedNode.node.item)
      }}
    />
  )
}

const EmptyStateLoader = () => {
  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <Title headingLevel="h4" size="lg" />
      <EmptyStateBody>
        Files are not available yet and are being fetched. Please give it a
        moment...
      </EmptyStateBody>
    </EmptyState>
  )
}
const FetchFilesLoader = ({ title }: { title: string }) => {
  return (
    <Spin tip={title}>
      <Alert message="Waiting on the plugin to finish" type="info" />
    </Spin>
  )
}
