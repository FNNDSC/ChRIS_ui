import React from 'react'
import { useTypedSelector } from '../../../store/hooks'
import GalleryDicomView from '../../dicomViewer/GalleryDicomView'
import useGalleryDicomView from '../../dicomViewer/useGalleryDicomView'

const DicomViewer = () => {
  const files = useTypedSelector((state) => state.explorer.selectedFolder)
  const { loadImagesIntoCornerstone } = useGalleryDicomView(
    files as any[],
    'feedbrowser',
  )
  React.useEffect(() => {
    loadImagesIntoCornerstone()
  }, [])
  return <GalleryDicomView />
}

export default DicomViewer
