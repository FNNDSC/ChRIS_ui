import React from 'react'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneMath from 'cornerstone-math'
import * as cornerstoneTools from 'cornerstone-tools'
import CornerstoneViewport from 'react-cornerstone-viewport'
import Hammer from 'hammerjs'
import * as cornerstoneNIFTIImageLoader from 'cornerstone-nifti-image-loader'
import { IFileBlob } from '../../../../api/models/file-viewer.model'

cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.init()

cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone
cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    'Content-Type': 'application/vnd.collection+json',
    Authorization: 'Token ' + window.sessionStorage.getItem('CHRIS_TOKEN'),
  },
  method: 'get',
  responseType: 'arrayBuffer',
})
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId

type AllProps = {
  fileItem: IFileBlob
}

const NiftiDisplay = (props: AllProps) => {
  const [imageIds, setImageIds] = React.useState<string[]>([])
  const { fileItem } = props

  const initAmi = React.useCallback((fileItem: IFileBlob) => {
    const { blob, file } = fileItem
    const imageIdArray: string[] = []
    if (blob && file) {
      const fileArray = file.data.fname.split('/')
      const fileName = fileArray[fileArray.length - 1]
      const imageIdObject = ImageId.fromURL(`nifti:${file.url}${fileName}`)
      cornerstone.loadAndCacheImage(imageIdObject.url).then(() => {
        const numberOfSlices = cornerstone.metaData.get(
          'multiFrameModule',
          imageIdObject.url,
        ).numberOfFrames
        imageIdArray.push(
          ...Array.from(
            Array(numberOfSlices),
            (_, i) =>
              `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`,
          ),
        )
        setImageIds(imageIdArray)
      })
    }
  }, [])

  React.useEffect(() => {
    if (!!fileItem) {
      initAmi(fileItem)
    }
  }, [fileItem, initAmi])
  return (
    <>
      {imageIds.length > 0 ? (
        <CornerstoneViewport
          style={{ minWidth: '100%', height: '512px', flex: '1' }}
          imageIds={imageIds}
          frameRate={22}
          activeTool={'StackScrollMouseWheel'}
          tools={[
            {
              name: 'StackScrollMouseWheel',
              mode: 'active',
            },
          ]}
        />
      ) : (
        <div>Loading....</div>
      )}
    </>
  )
}

export default NiftiDisplay
