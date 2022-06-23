import React, { useRef, useMemo } from 'react'
import { useHistory } from 'react-router'
import Wrapper from '../Layout/PageWrapper'
import { Button } from 'antd'
import { AiOutlineUpload } from 'react-icons/ai'

import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import * as cornerstoneNIFTIImageLoader from 'cornerstone-nifti-image-loader'
import * as cornerstoneFileImageLoader from 'cornerstone-file-image-loader'
import * as dicomParser from 'dicom-parser'
import { isNifti, isDicom } from '../../components/dicomViewer/utils'
import { useDispatch } from 'react-redux'
import { setFilesForGallery } from '../../store/explorer/actions'
import { setSidebarActive } from '../../store/ui/actions'
import { useDropzone } from 'react-dropzone'
import './index.scss'

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

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
}

const activeStyle = {
  borderColor: '#2196f3',
}

const acceptStyle = {
  borderColor: '#00e676',
}

const rejectStyle = {
  borderColor: '#ff1744',
}

const VisualizationPage = () => {
  const fileOpen = useRef<HTMLInputElement>(null)
  const folderOpen = useRef<HTMLInputElement>(null)
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone()

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept],
  )
  const dispatch = useDispatch()
  const history=useHistory();

  React.useEffect(() => {
    if (acceptedFiles.length > 0) loadImagesIntoCornerstone(acceptedFiles)
  }, [acceptedFiles])

  const close = React.useCallback(() => {
    history.push("/gallery");
  }, [history]);

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: 'visualizations',
      }),
    )
  }, [dispatch])

  const loadImagesIntoCornerstone = (files: any) => {
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
      }

      dispatch(setFilesForGallery(imageIds))
      close();
    }
  }

  const handleOpenFolder = (files: any) => {
    loadImagesIntoCornerstone(files)
  }
  const handleOpenLocalFs = (files: any) => {
    loadImagesIntoCornerstone(files)
  }

  const showOpenFolder = () => {
    if (folderOpen.current) {
      folderOpen.current.click()
    }
  }
  const showOpenFile = () => {
    if (fileOpen.current) {
      fileOpen.current.click()
    }
  }

  return (
    <Wrapper>
      <div className="upload-link">
        <Button onClick={showOpenFolder} icon={<AiOutlineUpload />}>
          Upload a Directory
        </Button>
        <Button onClick={showOpenFile} icon={<AiOutlineUpload />}>
          Upload Files
        </Button>
      </div>

      <div>
        <input
          type="file"
          id="file_open"
          style={{ display: 'none' }}
          ref={fileOpen}
          multiple
          onChange={(e) => handleOpenLocalFs(e.target.files)}
        />
        <input
          type="file"
          id="file_folder"
          style={{ display: 'none' }}
          onChange={(e) => handleOpenFolder(e.target.files)}
          multiple
          //@ts-ignore
          webkitdirectory=""
          mozdirectory=""
          directory=""
          ref={folderOpen}
        />

        <section className="container">
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <p>
              Drag &apos;n&apos; drop some files here or click to select files
            </p>
          </div>
        </section>
      </div>
    </Wrapper>
  )
}

export default VisualizationPage
