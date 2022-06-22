import React from 'react'
import { Button } from '@patternfly/react-core'
import { useDispatch } from 'react-redux'
import {
  AiFillCaretLeft,
  AiFillCaretRight,
  AiFillStepForward,
  AiFillStepBackward,
  AiFillPauseCircle,
  AiFillPlayCircle,
} from 'react-icons/ai'
import CornerstoneViewport from 'react-cornerstone-viewport'
import * as dicomParser from 'dicom-parser'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneTools from 'cornerstone-tools'
import * as cornerstoneMath from 'cornerstone-math'
import * as cornerstoneNIFTIImageLoader from 'cornerstone-nifti-image-loader'
import * as cornerstoneFileImageLoader from 'cornerstone-file-image-loader'
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import Hammer from 'hammerjs'
import { useTypedSelector } from '../../store/hooks'
import { GalleryState, CornerstoneEvent, Image } from './types'
import { clearFilesForGallery } from '../../store/explorer/actions'
import DcmHeader from './DcmHeader/DcmHeader'
import './GalleryDicomView.scss'

cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.external.Hammer = Hammer
cornerstoneTools.init({
  globalToolSyncEnabled: true,
})
cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone
cornerstoneFileImageLoader.external.cornerstone = cornerstone
cornerstoneWebImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser

const GalleryDicomView = () => {
  return <div>GalleryDicomView</div>
}

export default GalleryDicomView
