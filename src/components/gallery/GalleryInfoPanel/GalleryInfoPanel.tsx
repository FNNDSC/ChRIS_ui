import * as React from 'react'
import { IGalleryItem } from '../../../api/models/gallery.model'
import './GalleryInfoPanel.scss'

type AllProps = {
  galleryItem?: IGalleryItem
}

const GalleryInfoPanel: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { galleryItem } = props
  return (
    <div className="gallery-info">
      {!!galleryItem && (
        <>
          <p>File name: {galleryItem.fileName}</p>
          {/* Add more metadata here */}
        </>
      )}
    </div>
  )
}
export default React.memo(GalleryInfoPanel)
