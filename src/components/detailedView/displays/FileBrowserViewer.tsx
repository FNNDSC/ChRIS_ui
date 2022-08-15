import React from 'react'
import { useTypedSelector } from '../../../store/hooks'
import { useDispatch } from 'react-redux'
import { Tree, TreeDataNode } from 'antd'
import {
  GridItem,
  Grid,
  BreadcrumbItem,
  Breadcrumb,
} from '@patternfly/react-core'
import { Key } from '../../../store/explorer/types'
import FileDetailView from '../../feed/Preview/FileDetailView'
import { setSelectedFile } from '../../../store/explorer/actions'
import { FeedFile } from '@fnndsc/chrisapi'
import { DataNode } from 'antd/lib/tree'
import FeedOutputBrowser from '../../feed/FeedOutputBrowser/FeedOutputBrowser'

const createTreeFromFiles = (files: FeedFile[]) => {
  return files.map((file) => {
    return {
      key: file.data.id,
      title: file.data.fname,
    }
  })
}

const FileBrowserViewer = () => {
  const onNodeClick = () => {
    console.log('Node')
  }

  const onClick = (panel: string) => {
    if (panel === 'side_panel') {
    } else if (panel === 'bottom_panel') {
    }
  }

  return (
    <Grid>
      <GridItem>
        <FeedOutputBrowser
          expandDrawer={onClick}
          handlePluginSelect={onNodeClick}
        />
      </GridItem>
    </Grid>
  )
}

export default FileBrowserViewer
