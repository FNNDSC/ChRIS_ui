import * as React from 'react'
import { Button } from '@patternfly/react-core'
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import './GalleryFullScreen.scss'

type AllProps = {
  isFullscreen: boolean
  onFullScreenGallery: () => void
}

const GalleryFullScreen: React.FunctionComponent<AllProps> = (props: AllProps) => (
  <div className="fullscreen">
    <Button variant="link" onClick={props.onFullScreenGallery}>
      {props.isFullscreen ? <FaExpandAlt size="md" /> : <FaCompressAlt size="md" />}
    </Button>
  </div>
)
export default React.memo(GalleryFullScreen)
