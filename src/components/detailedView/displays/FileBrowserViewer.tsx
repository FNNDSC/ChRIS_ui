import React from 'react'
import { GridItem, Grid } from '@patternfly/react-core'
import { useDispatch } from 'react-redux'
import { PluginInstance } from '@fnndsc/chrisapi'
import FeedOutputBrowser from '../../feed/FeedOutputBrowser/FeedOutputBrowser'
import { getSelectedPlugin } from '../../../store/pluginInstance/actions'
import { destroyExplorer } from '../../../store/explorer/actions'

const FileBrowserViewer = () => {
  const dispatch = useDispatch()
  const onNodeClick = (node: PluginInstance) => {
    dispatch(getSelectedPlugin(node))
    dispatch(destroyExplorer())
  }

  const onClick = (panel: string) => {
    if (panel === 'side_panel') {
    } else if (panel === 'bottom_panel') {
    }
  }

  return (
    <Grid>
      <GridItem>
        <FeedOutputBrowser expandDrawer={onClick} handlePluginSelect={onNodeClick} />
      </GridItem>
    </Grid>
  )
}

export default FileBrowserViewer
