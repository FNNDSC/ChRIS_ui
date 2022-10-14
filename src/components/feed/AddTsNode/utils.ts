import { PluginInstance } from '@fnndsc/chrisapi'
import { InputType } from './ParentContainer'

export const getJoinInput = (
  joinInput: InputType,
  tsNodes?: PluginInstance[],
  selectedPlugin?: PluginInstance
) => {
  const instanceIds = tsNodes?.map((node) => {
    return `${node.data.id}`
  })

  let input: InputType = {}

  if (instanceIds && selectedPlugin) {
    const addParentId = [...instanceIds, selectedPlugin.data.id]
    input = {
      ...joinInput,
      ['plugininstances']: addParentId.join(','),
    }
  }
  return input || {}
}
