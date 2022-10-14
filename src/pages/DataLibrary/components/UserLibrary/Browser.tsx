import React, { useState, useContext } from 'react'
import {
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  CardActions,
  CardTitle,
  Split,
  SplitItem,
  Button,
  Modal,
} from '@patternfly/react-core'
import { Spin } from 'antd'
import { Link } from 'react-router-dom'
import { FaFile, FaFolder, FaDownload } from 'react-icons/fa'
import { MdOutlineOpenInNew } from 'react-icons/md'
import FileDetailView from '../../../../components/feed/Preview/FileDetailView'
import { LibraryContext } from './context'
import FileViewerModel from '../../../../api/models/file-viewer.model'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import useLongPress from './useLongPress'

export function Browser({
  folders,
  files,
  handleFolderClick,
  browserType,
  columnLayout,
}: {
  folders: {
    path: string
    name: string
  }[]
  files: any[]
  handleFolderClick: (path: string) => void
  browserType: string
  columnLayout: string
}) {
  return (
    <Grid style={{ marginLeft: '0.5em' }} hasGutter>
      {files &&
        files.length > 0 &&
        files.map((file) => (
          <GridItem key={file.data.fname} sm={12} lg={columnLayout === 'single' ? 12 : 2}>
            <FileCard file={file} browserType={browserType} />
          </GridItem>
        ))}
      {folders &&
        folders.length > 0 &&
        folders.map((folder, index) => (
          <GridItem key={`${folder}_${index}`} sm={12} lg={columnLayout === 'single' ? 12 : 2}>
            <FolderCard
              folder={folder}
              browserType={browserType}
              handleFolderClick={handleFolderClick}
            />
          </GridItem>
        ))}
    </Grid>
  )
}

function FolderCard({
  folder,
  browserType,
  handleFolderClick,
}: {
  folder: {
    path: string
    name: string
  }
  browserType: string
  handleFolderClick: (path: string) => void
}) {
  const { state } = useContext(LibraryContext)
  const { handlers } = useLongPress()
  const { handleOnClick, handleOnMouseDown } = handlers
  const { selectedFolder, columnLayout } = state
  const [feedDetails, setFeedDetails] = useState({
    id: '',
    name: '',
    commitDate: '',
  })

  const background = selectedFolder.some(
    (file) => file.folder.path === `${folder.path}/${folder.name}`
  )

  const isRoot = browserType === 'feed' && folder.name.startsWith('feed')

  React.useEffect(() => {
    async function fetchFeedName() {
      if (isRoot) {
        const client = ChrisAPIClient.getClient()
        const id = folder.name.split('_')[1]
        const feed = await client.getFeed(parseInt(id))
        setFeedDetails({
          id,
          name: feed.data.name,
          commitDate: feed.data.creation_date,
        })
      }
    }
    fetchFeedName()
    return () => {
      setFeedDetails({
        id: '',
        name: '',
        commitDate: '',
      })
    }
  }, [browserType, folder, isRoot])

  const handlePath = (e: any) => {
    const path = `${folder.path}/${folder.name}`
    handleOnClick(e, folder.path, path, folder, browserType, 'folder', handleFolderClick)
  }

  return (
    <Card
      isSelectableRaised
      isHoverable
      isRounded
      isSelected={background}
      onMouseDown={handleOnMouseDown}
      onClick={(e) => {
        if (!isRoot) {
          handlePath(e)
        }
      }}
      style={{
        background: `${background ? '#e7f1fa' : 'white'}`,
      }}
    >
      <CardHeader>
        {feedDetails.id && (
          <CardActions>
            <span style={{ fontSize: '1.5em' }}>
              <Link to={`/feeds/${feedDetails.id}`}>
                {' '}
                <MdOutlineOpenInNew />
              </Link>
            </span>
          </CardActions>
        )}
        <Split style={{ overflow: 'hidden' }}>
          <SplitItem style={{ marginRight: '1em' }}>
            <FaFolder />
          </SplitItem>
          <SplitItem isFilled>
            <Button
              onClick={(e) => {
                if (isRoot) {
                  handlePath(e)
                }
              }}
              style={{ padding: 0 }}
              variant="link"
            >
              <b>
                {' '}
                {isRoot ? (
                  !feedDetails.name ? (
                    <Spin />
                  ) : columnLayout === 'single' ? (
                    feedDetails.name
                  ) : (
                    elipses(feedDetails.name, 40)
                  )
                ) : columnLayout === 'single' ? (
                  folder.name
                ) : (
                  elipses(folder.name, 40)
                )}
              </b>
            </Button>
            <div>
              {feedDetails.commitDate ? new Date(feedDetails.commitDate).toDateString() : ''}
            </div>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  )
}

function FileCard({ file, browserType }: { file: any; browserType: string }) {
  const { handlers } = useLongPress()
  const { state } = useContext(LibraryContext)
  const { selectedFolder, previewAll, columnLayout } = state
  const { handleOnClick, handleOnMouseDown } = handlers
  const fileNameArray = file.data.fname.split('/')
  const fileName = fileNameArray[fileNameArray.length - 1]
  const [largePreview, setLargePreview] = React.useState(false)

  const background = selectedFolder.some((fileSelect) => fileSelect.folder.path === file.data.fname)

  const handlePreview = () => {
    setLargePreview(!largePreview)
  }

  return (
    <>
      <Card
        style={{
          background: `${background ? '#e7f1fa' : 'white'}`,
        }}
        onClick={(e) => {
          const path = file.data.fname
          const folder = {
            path,
            name: fileName,
          }
          const previousPath = fileNameArray.slice(0, fileNameArray.length - 1).join('/')

          handleOnClick(e, previousPath, path, folder, browserType, 'file', handlePreview)
        }}
        onMouseDown={handleOnMouseDown}
        key={file.data.fname}
        isRounded
        isHoverable
        isSelectableRaised
      >
        <CardHeader>
          <CardTitle>
            <Button icon={<FaFile />} variant="link" style={{ padding: '0' }}>
              <b>{columnLayout === 'single' ? fileName : elipses(fileName, 40)}</b>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardBody>
          {previewAll && (
            <div
              style={{
                margin: '-1.15em -1.15em 1em -1.15em',
                maxHeight: '10em',
                overflow: 'hidden',
              }}
            >
              <FileDetailView selectedFile={file} preview="small" />
            </div>
          )}
          <div>
            <span>{(file.data.fsize / (1024 * 1024)).toFixed(3)} MB</span>
            <Button
              onClick={async () => {
                const blob = await file.getFileBlob()
                FileViewerModel.downloadFile(blob, fileName)
              }}
              variant="link"
              icon={<FaDownload />}
            />
          </div>
        </CardBody>
        {largePreview && (
          <Modal
            title="Preview"
            aria-label="viewer"
            width="50%"
            isOpen={largePreview}
            onClose={() => setLargePreview(false)}
          >
            <FileDetailView selectedFile={file} preview="large" />
          </Modal>
        )}
      </Card>
    </>
  )
}

function elipses(str: string, len: number) {
  if (str.length <= len) return str
  return `${str.slice(0, len - 3)}...`
}
