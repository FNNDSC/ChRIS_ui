import React from 'react'
import { useDispatch } from 'react-redux'
import { setFilesForGallery } from '../../store/explorer/actions'
import GalleryDicomView from '../../components/dicomViewer/GalleryDicomView'
import DicomLoader from '../../components/dicomViewer/DcmLoader'
import { useTypedSelector } from '../../store/hooks'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import * as cornerstoneNIFTIImageLoader from 'cornerstone-nifti-image-loader'
import * as cornerstoneFileImageLoader from 'cornerstone-file-image-loader'
import * as dicomParser from 'dicom-parser'
import { isNifti, isDicom } from '../../components/dicomViewer/utils'
import './ViewImage.scss'

cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    'Content-Type': 'application/vnd.collection+json',
    Authorization: 'Token ' + window.sessionStorage.getItem('CHRIS_TOKEN'),
  },
  method: 'get',
  responseType: 'arrayBuffer',
})
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId

cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone
cornerstoneFileImageLoader.external.cornerstone = cornerstone
cornerstoneWebImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser

const GalleryPage = () => {
  const dispatch = useDispatch()
  const files = useTypedSelector((state) => state.explorer.externalFiles)
  const [loader, setLoader] = React.useState({
    totalFiles: 0,
    filesParsed: 0,
  })

  const loadImagesIntoCornerstone = React.useCallback(() => {
    if (files) {
      const imageIds: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (isNifti(file.name)) {
          const url = URL.createObjectURL(file).split('blob:')[1]
          const imageIdObject = ImageId.fromURL(`nifti:${url}${file.name}`)

          const numberOfSlices = cornerstone.metaData.get(
            'multiFrameModule',
            imageIdObject.url,
          ).numberOfFrames

          imageIds.push(
            ...Array.from(
              Array(numberOfSlices),
              (_, i) =>
                `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`,
            ),
          )
        } else if (isDicom(file.name)) {
          imageIds.push(
            cornerstoneWADOImageLoader.wadouri.fileManager.add(file),
          )
        } else {
          imageIds.push(cornerstoneFileImageLoader.fileManager.add(file))
        }
        setLoader({
          ...loader,
          filesParsed: i + 1,
          totalFiles: files.length,
        })
      }

      dispatch(setFilesForGallery(imageIds))
      close()
    }
  }, [files, dispatch])

  React.useEffect(() => {
    loadImagesIntoCornerstone()
  }, [loadImagesIntoCornerstone])
  return (
    <div className="gallery">
      {loader.filesParsed === loader.totalFiles ? (
        <GalleryDicomView type="visualization" />
      ) : (
        <DicomLoader
          totalFiles={loader.totalFiles}
          filesParsed={loader.filesParsed}
        />
      )}
    </div>
  )
}
export default GalleryPage
