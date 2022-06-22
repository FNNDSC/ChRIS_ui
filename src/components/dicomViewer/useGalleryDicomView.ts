import React from 'react'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import * as cornerstoneNIFTIImageLoader from 'cornerstone-nifti-image-loader'
import * as cornerstoneFileImageLoader from 'cornerstone-file-image-loader'
import * as dicomParser from 'dicom-parser'
import {
  getDicomPatientName,
  getDicomStudyDate,
  getDicomStudyTime,
  getDicomStudyDescription,
  getDicomSeriesDate,
  getDicomSeriesTime,
  getDicomSeriesDescription,
  getDicomSeriesNumber,
  getDicomInstanceNumber,
  getDicomSliceDistance,
  getDicomEchoNumber,
  getDicomSliceLocation,
  getDicomColumns,
  getDicomRows,
  dicomDateTimeToLocale,
  isNifti,
  isDicom,
} from './utils'
import { useDispatch } from 'react-redux'
import { setFilesForGallery } from '../../store/explorer/actions'

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

const useGalleryDicomView = (files: any[], viewerType: string) => {
  const dispatch = useDispatch()
  const loadImagesIntoCornerstone = () => {
    if (files) {
      console.log('Files', files)
      let step = 0
      step = files.length / 50
      const nextProgress = step
      let count = 0
      const imageIds: string[] = []

      
      /*
      let step = 0
      step = files.length / 50
      const nextProgress = step
      let count = 0

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
      }

      const items: any[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        cornerstone.loadImage(imageIds[i]).then(
          (image: any) => {
            const patientName = getDicomPatientName(image)
            const studyDate = getDicomStudyDate(image)
            const studyTime = getDicomStudyTime(image)
            const studyDescription = getDicomStudyDescription(image)

            const seriesDate = getDicomSeriesDate(image)
            const seriesTime = getDicomSeriesTime(image)
            const seriesDescription = getDicomSeriesDescription(image)
            const seriesNumber = getDicomSeriesNumber(image)

            const instanceNumber = getDicomInstanceNumber(image)
            const sliceDistance = getDicomSliceDistance(image)
            const echoNumber = getDicomEchoNumber(image)
            const sliceLocation = getDicomSliceLocation(image)
            const columns = getDicomColumns(image)
            const rows = getDicomRows(image)
            const studyDateTime =
              studyDate === undefined
                ? undefined
                : dicomDateTimeToLocale(`${studyDate}.${studyTime}`)

            const item = {
              imageId: imageIds[i],
              instanceNumber: instanceNumber,
              name: file.name,
              image: image,
              rows: rows,
              columns: columns,
              sliceDistance: sliceDistance,
              sliceLocation: sliceLocation,
              patient: {
                patientName: patientName,
              },
              study: {
                studyDate: studyDate,
                studyTime: studyTime,
                studyDateTime: studyDateTime,
                studyDescription: studyDescription,
              },
              series: {
                seriesDate: seriesDate,
                seriesTime: seriesTime,
                seriesDescription: seriesDescription,
                seriesNumber: seriesNumber,
                echoNumber: echoNumber,
              },
            }
            items.push(item)
            count++
            const progress = Math.floor(count * (100 / files.length))
            if (progress > nextProgress) {
              // setProgress(progress)
            }
            if (count === files.length) {
              console.log('Files', files)
              dispatch(setFilesForGallery(items))
              close()
            }
          },
          (e: any) => {
            console.log('Error in reading multiple files', e)
            count++
          },
        )
      }
      */
    }
  }

  return {
    loadImagesIntoCornerstone,
  }
}

export default useGalleryDicomView
