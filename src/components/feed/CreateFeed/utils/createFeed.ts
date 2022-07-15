import { unpackParametersIntoObject } from '../../AddNode/lib/utils'
import {
  CreateFeedData,
  LocalFile,
  PipelineData,
  ComputeEnvData,
} from '../types'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { InputType } from '../../AddNode/types'
import { Plugin, PluginInstance, PluginParameter } from '@fnndsc/chrisapi'

import { fetchResource } from '../../../../utils'

export function getName(selectedConfig: string) {
  if (selectedConfig === 'fs_plugin') {
    return 'Feed Creation using an FS Plugin'
  } else if (selectedConfig === 'file_select') {
    return 'Feed Creation using File Select'
  } else return 'Feed Creation'
}

export const createFeed = async (
  data: CreateFeedData,
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined,
  username: string | null | undefined,
  pipelineData: PipelineData,
  setProgressCallback: (status: string) => void,
  setErrorCallback: (error: string) => void,
  selectedPipeline?: number,
) => {
  const { chrisFiles, localFiles } = data

  /**
   * Dircopy requires a path from the ChRIS object storage
   * as in input
   */
  let feed
  setProgressCallback('Started')

  if (chrisFiles.length > 0 || localFiles.length > 0) {
    feed = await createFeedInstanceWithDircopy(
      data,
      username,
      pipelineData,
      setProgressCallback,
      setErrorCallback,
      selectedPipeline,
    )
  } else if (dropdownInput || requiredInput) {
    feed = await createFeedInstanceWithFS(
      dropdownInput,
      requiredInput,
      selectedPlugin,
      setProgressCallback,
      setErrorCallback,
    )
  }
  return feed
}

export const createFeedInstanceWithDircopy = async (
  data: CreateFeedData,
  username: string | null | undefined,
  pipelineData: PipelineData,
  statusCallback: (status: string) => void,
  errorCallback: (error: string) => void,
  selectedPipeline?: number,
) => {
  const { chrisFiles, localFiles } = data
  let dirpath: string[] = []

  if (chrisFiles.length > 0 && localFiles.length === 0) {
    statusCallback('Compute Paths from swift storage')
    dirpath = chrisFiles.map((path: string) => path)
  } else if (localFiles.length > 0 && chrisFiles.length === 0) {
    statusCallback('Compute Paths from local file upload')
    const generateUnique = generatePathForLocalFile(data)
    const path = `${username}/uploads/${generateUnique}`
    const local_upload_path = localFiles.length > 1 ? `${path}/` : path
    dirpath.push(local_upload_path)

    try {
      await uploadLocalFiles(localFiles, local_upload_path, statusCallback)
    } catch (error) {
      errorCallback(error as string)
    }
  }
  let feed

  try {
    const client = ChrisAPIClient.getClient()
    const dircopy = await getPlugin('pl-dircopy')
    if (dircopy instanceof Plugin) {
      const createdInstance = await client.createPluginInstance(
        dircopy.data.id,
        {
          //@ts-ignore
          dir: dirpath.join(','),
        },
      )
      statusCallback('Creating Plugin Instance')
      //when the `post` finishes, the dircopyInstances's internal collection is updated

      if (createdInstance) {
        if (selectedPipeline) {
          const pipeline = pipelineData[selectedPipeline]
          if (
            pipeline.pluginPipings &&
            pipeline.pluginParameters &&
            pipeline.pipelinePlugins &&
            pipeline.pluginPipings.length > 0
          ) {
            const {
              pluginPipings,
              pluginParameters,
              pipelinePlugins,
              computeEnvs,
            } = pipeline
            runPipelineSequence(
              pluginPipings,
              pluginParameters,
              pipelinePlugins,
              createdInstance,
              computeEnvs,
            )
          }
        }
        statusCallback('Feed Created')
        feed = await createdInstance.getFeed()
      }
    }
  } catch (error) {
    errorCallback(error as string)
  }

  return feed
}

export const createFeedInstanceWithFS = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  selectedPlugin: Plugin | undefined,
  statusCallback: (status: string) => void,
  errorCallback: (error: string) => void,
) => {
  statusCallback('Unpacking parameters')

  let feed
  if (selectedPlugin) {
    const pluginName = selectedPlugin.data.name
    try {
      const fsPlugin = await getPlugin(pluginName)

      if (fsPlugin instanceof Plugin) {
        const data = await getRequiredObject(
          dropdownInput,
          requiredInput,
          fsPlugin,
        )

        const pluginId = fsPlugin.data.id
        statusCallback('Creating Plugin Instance')
        const client = ChrisAPIClient.getClient()
        try {
          const fsPluginInstance = await client.createPluginInstance(
            pluginId,
            //@ts-ignore
            data,
          )
          feed = await fsPluginInstance.getFeed()
          statusCallback('Feed Created')
        } catch (error) {
          errorCallback(error as string)
        }
      }
    } catch (error) {
      errorCallback(error as string)
    }
  }
  return feed
}

export const uploadLocalFiles = async (
  files: LocalFile[],
  directory: string,
  statusCallback: (status: string) => void,
) => {
  const client = ChrisAPIClient.getClient()
  statusCallback(`Uploading Files To Cube`)
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const upload_path = `${directory}/${file.name}`
    await client.uploadFile(
      {
        upload_path,
      },
      {
        fname: (file as LocalFile).blob,
      },
    )
  }
}

export const getPlugin = async (pluginName: string) => {
  const client = ChrisAPIClient.getClient()
  const pluginList = await client.getPlugins({
    name_exact: pluginName,
  })
  let plugin: Plugin[] = []
  if (pluginList.getItems()) {
    plugin = pluginList.getItems() as Plugin[]
    return plugin[0]
  } else return []
}

export const getRequiredObject = async (
  dropdownInput: InputType,
  requiredInput: InputType,
  plugin: Plugin,
  selected?: PluginInstance,
) => {
  let dropdownUnpacked
  let requiredUnpacked
  const mappedParameter: {
    [key: string]: string | boolean
  } = {}

  if (dropdownInput) {
    dropdownUnpacked = unpackParametersIntoObject(dropdownInput)
  }

  if (requiredInput) {
    requiredUnpacked = unpackParametersIntoObject(requiredInput)
  }

  const nodeParameter: {
    [key: string]: {
      [key: string]: string
    }
  } = {
    ...dropdownUnpacked,
    ...requiredUnpacked,
  }
  const paginate = { limit: 30, offset: 0 }
  const fn = plugin.getPluginParameters
  const boundFn = fn.bind(plugin)
  const params: PluginParameter[] = await fetchResource<PluginParameter>(
    paginate,
    boundFn,
  )

  for (let i = 0; i < params.length; i++) {
    const flag = params[i].data.flag
    const defaultValue = params[i].data.default
    if (Object.keys(nodeParameter).includes(flag)) {
      let value: string | boolean = nodeParameter[flag].value
      const type = nodeParameter[flag].type

      if (value === '' && type === 'boolean') {
        if (defaultValue === false) {
          value = true
        } else {
          value = false
        }
      } else if (value === '' || value === 'undefined') {
        value = defaultValue
      }
      mappedParameter[params[i].data.name] = value
    }
  }

  let parameterInput
  if (selected) {
    parameterInput = {
      ...mappedParameter,
      previous_id: selected.data.id as number,
    }
  } else {
    parameterInput = {
      ...mappedParameter,
    }
  }

  return parameterInput
}

export async function runPipelineSequence(
  pluginPipings: any[],
  pluginParameters: any[],
  pipelinePlugins: any[],
  createdInstance: PluginInstance,
  computeEnvs?: ComputeEnvData,
) {
  const pluginDict: {
    [id: number]: number
  } = {}

  const client = ChrisAPIClient.getClient()
  const pluginInstanceList = []

  for (let i = 0; i < pluginPipings.length; i++) {
    const currentPlugin = pluginPipings[i]

    const currentPluginParameter = pluginParameters.filter((param: any) => {
      if (currentPlugin.data.id === param.data.plugin_piping_id) {
        return param
      }
    })

    const pluginFound = pipelinePlugins.find(
      (plugin) => currentPlugin.data.plugin_id === plugin.data.id,
    )

    const data = currentPluginParameter.reduce(
      (
        paramDict: {
          [key: string]: string | boolean | number
        },
        param: any,
      ) => {
        let value

        if (!param.data.value && param.data.type === 'string') {
          value = ''
        } else {
          value = param.data.value
        }
        paramDict[param.data.param_name] = value
        return paramDict
      },
      {},
    )

    let previous_id
    if (i === 0) {
      previous_id = createdInstance.data.id
    } else {
      const previousPlugin = pluginPipings.find(
        (plugin) => currentPlugin.data.previous_id === plugin.data.id,
      )
      previous_id = pluginDict[previousPlugin.data.plugin_id]
    }

    const computeEnv =
      computeEnvs &&
      computeEnvs[currentPlugin.data.id] &&
      computeEnvs[currentPlugin.data.id].currentlySelected

    let finalData = {}
    if (computeEnv) {
      finalData = {
        previous_id,
        ...data,
        compute_resource_name: computeEnv,
      }
    } else {
      finalData = {
        previous_id,
        ...data,
      }
    }

    const pluginInstance: PluginInstance = await client.createPluginInstance(
      pluginFound.data.id,
      //@ts-ignore
      finalData,
    )
    pluginInstanceList.push(pluginInstance)
    pluginDict[pluginInstance.data.plugin_id] = pluginInstance.data.id
  }
  return pluginInstanceList
}

function generatePathForLocalFile(data: CreateFeedData) {
  const randomCode = Math.floor(Math.random() * 100)
  const normalizedFeedName = data.feedName
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/\//g, '')
  return `${normalizedFeedName}-upload-${randomCode}`
}
