import React from 'react'

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
import { PluginInstance, } from '@fnndsc/chrisapi'
import { getFeedTree } from './data'
import { DataNode, } from '../../../store/explorer/types'
import { generateTableLoading } from '../../common/emptyTable'

import './FeedOutputBrowser.scss'
import { useFeedBrowser } from './useFeedBrowser'

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
  const { plugins, selected, pluginFilesPayload, statusTitle,
    handleFileClick, handleFileBrowserOpen,
    handleDicomViewerOpen, handleXtkViewerOpen, downloadAllClick, download,
    handlePluginModalClose, pluginModalOpen, filesLoading
  } = useFeedBrowser();

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
            {pluginFilesPayload && selected ? (
              <FileBrowser
                selected={selected}
                handleFileClick={handleFileClick}
                pluginFilesPayload={pluginFilesPayload}
                handleFileBrowserToggle={handleFileBrowserOpen}
                handleDicomViewerOpen={handleDicomViewerOpen}
                handleXtkViewerOpen={handleXtkViewerOpen}
                expandDrawer={expandDrawer}
                download={download}
                downloadAllClick={downloadAllClick}
                pluginModalOpen={pluginModalOpen}
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
