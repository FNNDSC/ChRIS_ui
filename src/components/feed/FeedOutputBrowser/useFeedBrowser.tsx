import React from 'react'
import {
  clearSelectedFile,
  setExplorerMode,
  setSelectedFolder,
} from '../../../store/explorer/actions'
import { useTypedSelector } from '../../../store/hooks'
import { useDispatch } from 'react-redux'
import JSZip from 'jszip'
import { getPluginFilesRequest } from '../../../store/resources/actions'
import { ExplorerMode } from '../../../store/explorer/types'
import FileViewerModel from '../../../api/models/file-viewer.model'
import usePluginInstanceResource from '../NodeDetails/usePluginInstanceResource'
import { getCurrentTitleFromStatus, getFinishedTitle } from '../NodeDetails/StatusTitle'
import { getPluginName } from './utils'
import { fetchResource } from '../../../api/common'

const status = ['finishedSuccessfully', 'finishedWithError', 'cancelled']

const getInitialDownloadState = () => {
  return {
    count: 0,
    status: false,
    plugin_name: '',
    error: '',
    fetchingFiles: false,
  }
}

export const useFeedBrowser = () => {
  const [download, setDownload] = React.useState(getInitialDownloadState)
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
  const { data: plugins } = pluginInstances

  const pluginFilesPayload = selected && pluginFiles[selected.data.id]

  let statusTitle:
    | {
      title: string
      icon: any
    }
    | undefined = undefined
  if (pluginStatus && selected) {
    statusTitle = status.includes(selected.data.status) ?
      getFinishedTitle(selected.data.status) :
      getCurrentTitleFromStatus(pluginStatus)
  }

  const downloadAllClick = async () => {
    const zip = new JSZip()
    let count = 0

    if (selected) {
      const params = {
        limit: 100,
        offset: 0,
      }
      const selectedNodeFn = selected.getFiles
      const boundFn = selectedNodeFn.bind(selected)
      setDownload({
        ...download,
        fetchingFiles: true,
      })
      const files = await fetchResource(params, boundFn)
      setDownload({
        ...download,
        fetchingFiles: false,
      })

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          count += 1
          const percentage = Math.round(
            Number(((count / files.length) * 100).toFixed(2)),
          )

          setDownload({
            plugin_name: selected.data.plugin_name,
            status: true,
            count: percentage,
            error: '',
            fetchingFiles: false,
          })
          const file: any = files[i]
          const fileBlob = await file.getFileBlob()
          zip.file(file.data.fname, fileBlob)
        }
        const blob = await zip.generateAsync({ type: 'blob' })
        const filename = `${getPluginName(selected)}.zip`
        FileViewerModel.downloadFile(blob, filename)
        setDownload(getInitialDownloadState)
      } else {
        setDownload({
          ...download,
          status: false,
          error:
            'Files are not available for download yet. Please wait or try again later...',
        })
      }
    }
  }

  const finished = selected && status.includes(selected.data.status)

  React.useEffect(() => {
    if (!(pluginFilesPayload && pluginFilesPayload.files)) {
      if (selected && status.includes(selected.data.status)) {
        if (download.error) {
          setDownload((state) => {
            return {
              ...state,
              error: 'Files are ready for download now...',
            }
          })
        }

        dispatch(
          getPluginFilesRequest({
            id: selected.data.id,
            path: selected.data.output_path,
          }),
        )
        if (download.error) {
          setTimeout(() => {
            setDownload(getInitialDownloadState)
          }, 3000)
        }
      }
    }
  }, [selected, finished, dispatch, pluginFilesPayload, download.error])

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
  // dispatch(clearSelectedFile())
    setFolder()
    setPluginModalOpen(!pluginModalOpen)
    dispatch(setExplorerMode(ExplorerMode.SwiftFileBrowser))
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

  return {
    handleDicomViewerOpen,
    handleXtkViewerOpen,
    handlePluginModalClose,
    handleFileBrowserOpen,
    handleFileClick,
    downloadAllClick,
    filesLoading,
    plugins,
    statusTitle,
    download,
    selected,
    pluginFilesPayload,
    pluginModalOpen,
  }
}
