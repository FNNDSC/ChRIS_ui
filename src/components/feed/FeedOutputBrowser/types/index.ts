import { FeedFile } from '@fnndsc/chrisapi'
import { DataNode } from '../../../../store/explorer/types'

export interface FileBrowserProps {
  selectedFiles?: FeedFile[]
  root: DataNode
  pluginName?: string
  handleFileBrowserToggle: () => void
  handleDicomViewerOpen: () => void
  handleXtkViewerOpen: () => void
  downloadAllClick: () => void
  expandDrawer: (panel: string) => void
  download: {
    status: boolean
    count: number
  }
}

export interface FileBrowserState {
  directory: DataNode
  breadcrumbs: DataNode[]
  currentFile: DataNode[]
  previewingFile?: DataNode // file selected for preview
}

export interface Label {
  [key: string]: boolean
}
