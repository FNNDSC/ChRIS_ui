import React, { useRef, useMemo } from 'react'
import { useHistory } from 'react-router'
import Wrapper from '../Layout/PageWrapper'
import { Button } from 'antd'
import { AiOutlineUpload } from 'react-icons/ai'
import {
  ModalVariant,
  Modal,
  ProgressSize,
  Progress,
} from '@patternfly/react-core'

import { useDispatch } from 'react-redux'
import { setFilesForGallery } from '../../store/explorer/actions'
import { setSidebarActive } from '../../store/ui/actions'
import { useDropzone } from 'react-dropzone'
import './index.scss'
import useGalleryDicomView from '../../components/dicomViewer/useGalleryDicomView'
import GalleryDicomView from '../../components/dicomViewer/GalleryDicomView'

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
  const [visibleModal, setVisibleModal] = React.useState(false)
  const [files, setFiles] = React.useState<any[]>()
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

  React.useEffect(() => {
    if (acceptedFiles.length > 0) setFiles(acceptedFiles)
  }, [acceptedFiles])

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: 'visualizations',
      }),
    )
  }, [dispatch])

  const handleOpenFolder = (files: any) => {
    setVisibleModal(true)
    setFiles(files)
  }

  const handleOpenLocalFs = (files: any) => {
    setVisibleModal(true)
    setFiles(files)
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

  const handleModalClose = () => {
    setVisibleModal(false)
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
      {files && files.length > 0 && (
        <DicomModal
          files={files}
          visibleModal={visibleModal}
          handleModalClose={handleModalClose}
        />
      )}

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

export const DicomModal = ({
  files,
  visibleModal,
  handleModalClose,
}: {
  visibleModal: boolean
  handleModalClose: () => void
  files: any[]
}) => {
  const history = useHistory()
  const { loadImagesIntoCornerstone } = useGalleryDicomView(files, 'visualization')

  React.useEffect(() => {
    loadImagesIntoCornerstone()
  }, [])
  return <GalleryDicomView />
}
