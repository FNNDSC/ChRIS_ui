import React from 'react';
import { clearSelectedFile, setExplorerMode, setSelectedFolder } from '../../../store/explorer/actions';
import { useTypedSelector } from '../../../store/hooks';
import { useDispatch } from 'react-redux';
import JSZip from 'jszip'
import { getPluginFilesRequest } from '../../../store/resources/actions';
import { ExplorerMode } from '../../../store/explorer/types';
import FileViewerModel from '../../../api/models/file-viewer.model';
import usePluginInstanceResource from '../NodeDetails/usePluginInstanceResource';
import { getCurrentTitleFromStatus } from '../NodeDetails/StatusTitle';
import { getPluginName } from './utils';
import { fetchFilesFromAPath } from '../../../store/resources/saga';

const status = ['finishedSuccessfully', 'finishedWithError', 'cancelled']

const getInitialDownloadState = () => {
    return {
        count: 0,
        status: false,
        path: ''
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
    if (pluginStatus) {
        statusTitle = getCurrentTitleFromStatus(pluginStatus)
    }

    const downloadAllClick = async () => {
        const zip = new JSZip();
        let count = 0;

        if (selected && pluginFilesPayload) {
            const { path } = pluginFilesPayload
            const { files } = await fetchFilesFromAPath(path)

            if (files.length > 0) {
                const length = pluginFilesPayload.files.length
                for (const file of pluginFilesPayload.files) {
                    count += 1;
                    const percentage = Number(((count / length) * 100).toFixed(2))
                    setDownload({
                        path,
                        status: true,
                        count: percentage,

                    })
                    const fileBlob = await file.getFileBlob()
                    zip.file(file.data.fname, fileBlob)
                }
            }
            const blob = await zip.generateAsync({ type: 'blob' })
            const filename = `${getPluginName(selected)}.zip`
            FileViewerModel.downloadFile(blob, filename)
            setDownload(getInitialDownloadState)
        }
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
    }, [selected, finished, dispatch, pluginFilesPayload])

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
        pluginModalOpen
    }
}