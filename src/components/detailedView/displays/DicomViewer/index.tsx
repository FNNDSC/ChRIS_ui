import React from 'react'
import { useDispatch } from 'react-redux'
import * as dicomParser from 'dicom-parser'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneNIFTIImageLoader from 'cornerstone-nifti-image-loader'
import * as cornerstoneFileImageLoader from 'cornerstone-file-image-loader'
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import { useTypedSelector } from '../../../../store/hooks'
import { isNifti, isDicom } from '../../../dicomViewer/utils'
import { setFilesForGallery } from '../../../../store/explorer/actions'
import GalleryDicomView from '../../../dicomViewer/GalleryDicomView'
import DicomLoader from '../../../dicomViewer/DcmLoader'

cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone
cornerstoneFileImageLoader.external.cornerstone = cornerstone
cornerstoneWebImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser
cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    'Content-Type': 'application/vnd.collection+json',
    Authorization: 'Token ' + window.sessionStorage.getItem('CHRIS_TOKEN'),
  },
  method: 'get',
  responseType: 'arrayBuffer',
})
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId

const DicomViewerContainer = () => {
  const dispatch = useDispatch()
  const files = useTypedSelector((state) => state.explorer.selectedFolder)
  const [loader, setLoader] = React.useState({
    totalFiles: 0,
    filesParsed: 0,
  })

  const loadImagesIntoCornerstone = React.useCallback(async () => {
    if (files) {
      const imageIds: string[] = []
      let niftiSlices = 0
      for (let i = 0; i < files.length; i++) {
        const selectedFile = files[i].file

        if (selectedFile) {
          if (isNifti(selectedFile.data.fname)) {
            const fileArray = selectedFile.data.fname.split('/')
            const fileName = fileArray[fileArray.length - 1]
            const imageIdObject = ImageId.fromURL(
              `nifti:${selectedFile.url}${fileName}`,
            )

            niftiSlices = cornerstone.metaData.get(
              'multiFrameModule',
              imageIdObject.url,
            ).numberOfFrames

            imageIds.push(
              ...Array.from(
                Array(niftiSlices),
                (_, i) =>
                  `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`,
              ),
            )
          } else if (isDicom(selectedFile.data.fname)) {
            const file = await selectedFile.getFileBlob()
            imageIds.push(
              cornerstoneWADOImageLoader.wadouri.fileManager.add(file),
            )
          } else {
            const file = await selectedFile.getFileBlob()
            imageIds.push(cornerstoneFileImageLoader.fileManager.add(file))
          }
        }

        setLoader((state) => {
          return {
            ...state,
            filesParsed: i + 1,
            totalFiles: files.length,
          }
        })
      }
      dispatch(setFilesForGallery(imageIds))
    }
  }, [files, dispatch])

  React.useEffect(() => {
    loadImagesIntoCornerstone()
  }, [loadImagesIntoCornerstone])

  return (
    <>
      {loader.filesParsed === loader.totalFiles ? (
        <GalleryDicomView type="feedbrowser" />
      ) : (
        <DicomLoader
          totalFiles={loader.totalFiles}
          filesParsed={loader.filesParsed}
        />
      )}
    </>
  )
}

export default DicomViewerContainer
