import React from 'react'

import { connect, useDispatch } from 'react-redux'
import ForceGraph3D, {
  NodeObject,
  ForceGraphMethods,
} from 'react-force-graph-3d'
import { PluginInstancePayload } from '../../../store/pluginInstance/types'
import { ApplicationState } from '../../../store/root/applicationState'
import TreeModel from '../../../api/models/tree.model'
import { PluginInstance } from '@fnndsc/chrisapi'
import { ErrorBoundary } from 'react-error-boundary'
import { Text, Button, Switch } from '@patternfly/react-core'
import useSize from './useSize'
import { setFeedLayout } from '../../../store/feed/actions'
import './FeedTree.scss'
import { FeedTreeScaleType, NodeScaleDropdown } from './Controls'
import { useTypedSelector } from '../../../store/hooks'

interface IFeedProps {
  pluginInstances: PluginInstancePayload
  selectedPlugin?: PluginInstance
  onNodeClick: (node: PluginInstance) => void
  isSidePanelExpanded: boolean
  isBottomPanelExpanded: boolean
  onExpand: (panel: string) => void
}

const FeedGraph = (props: IFeedProps) => {
  const dispatch = useDispatch()
  const currentLayout = useTypedSelector((state) => state.feed.currentLayout)
  const {
    pluginInstances,
    selectedPlugin,
    onNodeClick,
    isSidePanelExpanded,
    isBottomPanelExpanded,
    onExpand,
  } = props
  const { data: instances } = pluginInstances
  const graphRef = React.useRef<HTMLDivElement | null>(null)
  const fgRef = React.useRef<ForceGraphMethods | undefined>()

  const [nodeScale, setNodeScale] = React.useState<{
    enabled: boolean
    type: FeedTreeScaleType
  }>({ enabled: false, type: 'time' })

  const size = useSize(graphRef)

  const [graphData, setGraphData] = React.useState()

  const handleNodeClick = (node: NodeObject) => {
    const distance = 40
    if (node && node.x && node.y && node.z && fgRef.current) {
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z)

      fgRef.current.cameraPosition(
        {
          x: node.x * distRatio,
          y: node.y * distRatio,
          z: node.z * distRatio,
        }, // new position
        //@ts-ignore
        node, // lookAt ({ x, y, z })
        3000, // ms transition duration
      )
    }

    //@ts-ignore
    onNodeClick(node.item)
  }

  React.useEffect(() => {
    if (instances && instances.length > 0) {
      const tree = new TreeModel(instances)

      //@ts-ignore
      setGraphData(tree.treeChart)
    }
  }, [instances])

  return (
    <div className="feed-tree" ref={graphRef}>
      {size && graphData ? (
        <ErrorBoundary
          fallback={
            <Text>
              If you see this message, it means that the graph modules
              weren&apos;t loaded. Please refresh your browser.
            </Text>
          }
        >
          {!isSidePanelExpanded && (
            <div className="feed-tree__container--panelToggle node-graph-panel">
              <div className="feed-tree__orientation">
                <Button type="button" onClick={() => onExpand('side_panel')}>
                  Node Panel
                </Button>
              </div>
            </div>
          )}
          <div className="feed-tree__container--labels feed-graph__container--labels">
            <div className="feed-tree__control feed-tree__individual-scale">
              <Switch
                id="individual-scale"
                label="Scale Nodes On"
                labelOff="Scale Nodes Off"
                isChecked={nodeScale.enabled}
                onChange={() =>
                  setNodeScale({ ...nodeScale, enabled: !nodeScale.enabled })
                }
              />

              {nodeScale.enabled && (
                <div className="dropdown-wrap">
                  <NodeScaleDropdown
                    selected={nodeScale.type}
                    onChange={(type) => setNodeScale({ ...nodeScale, type })}
                  />
                </div>
              )}
            </div>
            <div className="feed-tree__control">
              <Switch
                id="layout"
                label="2D"
                labelOff="2D"
                isChecked={currentLayout}
                onChange={() => {
                  dispatch(setFeedLayout())
                }}
              />
            </div>
          </div>
          <ForceGraph3D
            ref={fgRef}
            //@ts-ignore
            height={size.height || 500}
            //@ts-ignore
            width={size.width || 500}
            graphData={graphData}
            nodeAutoColorBy={(d: any) => {
              if (selectedPlugin && d.item.data.id === selectedPlugin.data.id) {
                return '#fff'
              }
              return d.group
            }}
            nodeVal={
              nodeScale.enabled
                ? (node: any) => {
                    if (nodeScale.type === 'time') {
                      const instanceData = (node.item as PluginInstance).data
                      const start = new Date(instanceData?.start_date)
                      const end = new Date(instanceData?.end_date)
                      return Math.log10(end.getTime() - start.getTime()) * 10
                    }
                    return 1
                  }
                : undefined
            }
            onNodeClick={handleNodeClick}
            nodeLabel={(d: any) => {
              return `${d.item.data.title || d.item.data.plugin_name}`
            }}
            linkWidth={2}
          />
          {!isBottomPanelExpanded && (
            <div className="feed-tree__container--panelToggle graph">
              <div className="feed-tree__orientation">
                <Button type="button" onClick={() => onExpand('bottom_panel')}>
                  Feed Browser
                </Button>
              </div>
            </div>
          )}
        </ErrorBoundary>
      ) : (
        <Text>Fetching the Graph....</Text>
      )}
    </div>
  )
}

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstances: state.instance.pluginInstances,
  selectedPlugin: state.instance.selectedPlugin,
})

export default connect(mapStateToProps, {})(FeedGraph)
