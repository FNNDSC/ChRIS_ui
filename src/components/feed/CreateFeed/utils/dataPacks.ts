import ChrisAPIClient from '../../../../api/chrisapiclient'
import { Plugin } from '@fnndsc/chrisapi'

export const getPlugins = async (name: string, limit: number, offset: number, type: string) => {
  const client = ChrisAPIClient.getClient()
  const params = { name, limit, offset, type }
  const pluginList = await client.getPlugins(params)
  let plugins
  if (pluginList.getItems()) {
    plugins = pluginList.getItems() as Plugin[]
  }
  const totalCount = pluginList.totalCount

  return {
    plugins,
    totalCount,
  }
}
