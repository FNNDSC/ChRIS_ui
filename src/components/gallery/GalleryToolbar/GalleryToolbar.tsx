import * as React from 'react'

import {
  FaPlay,
  FaPause,
  FaExpandAlt,
  FaCompressAlt,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaStepForward,
  FaStepBackward,
} from 'react-icons/fa'
import { Button } from '@patternfly/react-core'

import { galleryActions } from '../../../api/models/gallery.model'
import './GalleryToolbar.scss'

type IGalleryToolbarState = {
  isFullscreen: boolean
}

type AllProps = {
  hideDownload?: boolean
  onToolbarClick: (action: string) => void // Description: switch play/pause functionality
  isPlaying?: boolean
} & IGalleryToolbarState

const GalleryToolbar: React.FunctionComponent<AllProps> = (props: AllProps) => {
  return (
    <div className="gallery-toolbar">
      <div>
        <div>
          <Button
            variant="link"
            onClick={() => props.onToolbarClick(galleryActions.first)}
          >
            <FaAngleDoubleLeft />
          </Button>
          <Button
            variant="link"
            onClick={() => props.onToolbarClick(galleryActions.previous)}
          >
            <FaStepBackward />
          </Button>
          <Button
            variant="link"
            onClick={() =>
              props.onToolbarClick(
                props.isPlaying ? galleryActions.pause : galleryActions.play,
              )
            }
          >
            {props.isPlaying ? <FaPause /> : <FaPlay />}
          </Button>
          <Button
            variant="link"
            onClick={() => props.onToolbarClick(galleryActions.next)}
          >
            <FaStepForward />
          </Button>
          <Button
            variant="link"
            onClick={() => props.onToolbarClick(galleryActions.last)}
          >
            <FaAngleDoubleRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
export default React.memo(GalleryToolbar)
