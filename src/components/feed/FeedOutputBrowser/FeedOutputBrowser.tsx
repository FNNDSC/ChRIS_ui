import React from 'react'

import {
  Grid,
  GridItem,
  EmptyState,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core'
import { Tree } from 'antd'
import { PluginInstance } from '@fnndsc/chrisapi'
import PluginViewerModal from '../../detailedView/PluginViewerModal'
import { getFeedTree } from './data'
import { DataNode } from '../../../store/explorer/types'
import './FeedOutputBrowser.scss'
import { useFeedBrowser } from './useFeedBrowser'
import { SpinContainer } from '../../common/loading/LoadingContent'

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
  const {
    plugins,
    selected,
    pluginFilesPayload,
    statusTitle,
    handleFileClick,
    handleFileBrowserOpen,
    handleDicomViewerOpen,
    handleXtkViewerOpen,
    handlePluginModalClose,
    pluginModalOpen,
    filesLoading,
  } = useFeedBrowser()
  return (
    <>
      <Grid hasGutter className="feed-output-browser ">
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
          <React.Suspense fallback={<SpinContainer title="Loading the File Browser" />}>
            {pluginFilesPayload && selected ? (
              <FileBrowser
                selected={selected}
                handleFileClick={handleFileClick}
                pluginFilesPayload={pluginFilesPayload}
                handleFileBrowserToggle={handleFileBrowserOpen}
                handleDicomViewerOpen={handleDicomViewerOpen}
                handleXtkViewerOpen={handleXtkViewerOpen}
                expandDrawer={expandDrawer}
                pluginModalOpen={pluginModalOpen}
                filesLoading={filesLoading}
              />
            ) : statusTitle && statusTitle.title ? (
              <FetchFilesLoader title={statusTitle.title} />
            ) : (
              <EmptyStateLoader
                title="Files are not available yet and are being fetched. Please give it a
              moment..."
              />
            )}
          </React.Suspense>
        </GridItem>
      </Grid>
      <PluginViewerModal isModalOpen={pluginModalOpen} handleModalToggle={handlePluginModalClose} />
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
    // @ts-ignore
    setTreeData(pluginSidebarTree)
  }, [plugins, selected])

  return (
    <DirectoryTree
      autoExpandParent
      treeData={tree}
      defaultExpandAll
      defaultExpandParent
      expandedKeys={[selected.data.id]}
      selectedKeys={[selected.data.id]}
      onSelect={(node, selectedNode) => {
        // @ts-ignore
        handlePluginSelect(selectedNode.node.item)
      }}
      onExpand={(node, selectedNode) => {
        // @ts-ignore
        handlePluginSelect(selectedNode.node.item)
      }}
    />
  )
}

export const EmptyStateLoader = ({ title }: { title: string }) => (
  <EmptyState variant={EmptyStateVariant.large}>
    <Title headingLevel="h4" size="lg" />
    <EmptyStateBody>{title}</EmptyStateBody>
  </EmptyState>
)
const FetchFilesLoader = ({ title }: { title: string }) => <SpinContainer title={title} />
