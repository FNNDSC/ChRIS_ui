import React, { useRef, Fragment } from 'react'
import { HierarchyPointNode } from 'd3-hierarchy'
import { select } from 'd3-selection'
import { TreeNode } from '../../utils'
import ChrisAPIClient from '../../api/chrisapiclient'

export interface Point {
  x: number
  y: number
}

type NodeProps = {
  data: TreeNode
  parent: HierarchyPointNode<TreeNode> | null
  position: Point
  orientation: string
  handleNodeClick: (pluginName: number, pipelineId: number, plugin_id: number) => void
  currentPipelineId: number
}

const setNodeTransform = (orientation: string, position: Point) =>
  orientation === 'horizontal'
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x}, ${position.y})`
const DEFAULT_NODE_CIRCLE_RADIUS = 10
const NodeData = (props: NodeProps) => {
  const nodeRef = useRef<SVGGElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const { data, position, orientation } = props
  const [pluginName, setPluginName] = React.useState('')

  const applyNodeTransform = (transform: string, opacity = 1) => {
    select(nodeRef.current).attr('transform', transform).style('opacity', opacity)
  }

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position)
    applyNodeTransform(nodeTransform)
  }, [orientation, position])

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position)
    applyNodeTransform(nodeTransform)

    async function fetchPluginName() {
      const { plugin_id } = data
      const client = ChrisAPIClient.getClient()
      const plugin = await client.getPlugin(plugin_id)
      setPluginName(plugin.data.name)
    }

    fetchPluginName()
  }, [orientation, position, data])

  const textLabel = (
    <g id={`text_${data.id}`}>
      <text
        style={{
          fill: '#030303',
        }}
        ref={textRef}
        className="label__title"
      >
        {pluginName}
      </text>
    </g>
  )

  return (
    <>
      <g
        style={{
          cursor: 'pointer',
        }}
        id={`${data.id}`}
        ref={nodeRef}
      >
        <circle
          style={{
            fill: '#5998C5',
          }}
          id={`node_${data.id}`}
          r={DEFAULT_NODE_CIRCLE_RADIUS}
        />
        {textLabel}
      </g>
    </>
  )
}

export default NodeData
