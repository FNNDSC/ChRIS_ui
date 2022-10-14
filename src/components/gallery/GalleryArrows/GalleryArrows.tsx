import * as React from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import './GalleryArrows.scss'

type AllProps = {
  onSlideChange: (offset: number) => void
}

const GalleryArrows: React.FunctionComponent<AllProps> = (props: AllProps) => (
  /* eslint-disable */
  <div className="arrows">
    <a className="prev" onClick={() => props.onSlideChange(-1)}>
      <span className="pf-u-screen-reader">Previous</span>
      <FaAngleLeft color="white" />
    </a>
    <a className="next" onClick={() => props.onSlideChange(1)}>
      <span className="pf-u-screen-reader">Next</span>
      <FaAngleRight color="white" />
    </a>
  </div>
)
/* eslint-enable */
export default React.memo(GalleryArrows)
