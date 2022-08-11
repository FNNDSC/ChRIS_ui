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
  destroyExplorer,
  setExplorerMode,
  setExplorerRequest,
} from '../../../store/explorer/actions'
import { getPluginFilesRequest } from '../../../store/resources/actions'
import FileViewerModel from '../../../api/models/file-viewer.model'
import { createTreeFromFiles, getPluginName } from './utils'
import { PluginInstance } from '@fnndsc/chrisapi'
import { isEmpty } from 'lodash'
import { getFeedTree } from './data'
import { DataNode, ExplorerMode } from '../../../store/explorer/types'
import { useSafeDispatch } from '../../../utils'
import './FeedOutputBrowser.scss'

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
  const dispatch = useDispatch()
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances,
  )
  const pluginFiles = useTypedSelector((state) => state.resource.pluginFiles)
  const selected = useTypedSelector((state) => state.instance.selectedPlugin)
  const { data: plugins, loading } = pluginInstances

  const pluginFilesPayload = selected && pluginFiles[selected.data.id]
  const status = ['finishedSuccessfully', 'finishedWithError', 'cancelled']

  React.useEffect(() => {
    if (selected && status.includes(selected.data.status)) {
      dispatch(
        getPluginFilesRequest({
          id: selected.data.id,
          path: selected.data.output_path,
        }),
      )
    }
  }, [selected])

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

  return (
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
          {pluginFilesPayload && (
            <FileBrowser
              selected={selected}
              handleFileClick={handleFileClick}
              pluginFilesPayload={pluginFilesPayload}
            />
          )}
        </React.Suspense>
      </GridItem>
    </Grid>
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
