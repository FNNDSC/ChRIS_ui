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
import { FaFile, FaFolder, FaDownload } from 'react-icons/fa'
import { MdOutlineOpenInNew } from 'react-icons/md'
import FileDetailView from '../../../../components/feed/Preview/FileDetailView'
import { LibraryContext } from './context'
import FileViewerModel from '../../../../api/models/file-viewer.model'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { Spin, Tooltip } from 'antd'
import { MdClose } from 'react-icons/md'
import useLongPress from './useLongPress'
import { setHideTooltip } from './context/actions'
import { Link } from 'react-router-dom'

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
        files.map((file) => {
          return (
            <GridItem
              key={file.data.fname}
              sm={12}
              lg={columnLayout === 'single' ? 12 : 2}
            >
              <FileCard file={file} browserType={browserType} />
            </GridItem>
          )
        })}
      {folders &&
        folders.length > 0 &&
        folders.map((folder, index) => {
          return (
            <GridItem
              key={`${folder}_${index}`}
              sm={12}
              lg={columnLayout === 'single' ? 12 : 2}
            >
              <FolderCard
                folder={folder}
                browserType={browserType}
                handleFolderClick={handleFolderClick}
              />
            </GridItem>
          )
        })}
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

  const background = selectedFolder.some((file) => {
    return file.folder.path === `${folder.path}/${folder.name}`
  })

  const isRoot = browserType === 'feed' && folder.name.startsWith('feed')

  React.useEffect(() => {
    async function fetchFeedName() {
      if (isRoot) {
        const client = ChrisAPIClient.getClient()
        const id = folder.name.split('_')[1]
        const feed = await client.getFeed(parseInt(id))
        setFeedDetails({
          id: id,
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
    handleOnClick(
      e,
      folder.path,
      path,
      folder,
      browserType,
      'folder',
      handleFolderClick,
    )
  }

  return (
    <TooltipParent>
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
                {feedDetails.commitDate
                  ? new Date(feedDetails.commitDate).toDateString()
                  : ''}
              </div>
            </SplitItem>
          </Split>
        </CardHeader>
      </Card>
    </TooltipParent>
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

  const background = selectedFolder.some((fileSelect) => {
    return fileSelect.folder.path === file.data.fname
  })

  const handlePreview = () => {
    setLargePreview(!largePreview)
  }

  return (
    <>
      <TooltipParent>
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
            const previousPath = fileNameArray
              .slice(0, fileNameArray.length - 1)
              .join('/')

            handleOnClick(
              e,
              previousPath,
              path,
              folder,
              browserType,
              'file',
              handlePreview,
            )
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
                <b>
                  {columnLayout === 'single' ? fileName : elipses(fileName, 40)}
                </b>
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
              width={'50%'}
              isOpen={largePreview}
              onClose={() => setLargePreview(false)}
            >
              <FileDetailView selectedFile={file} preview="large" />
            </Modal>
          )}
        </Card>
      </TooltipParent>
    </>
  )
}

const TooltipParent = ({ children }: { children: React.ReactElement }) => {
  const { state, dispatch } = useContext(LibraryContext)

  const hideToolTip = () => {
    dispatch(setHideTooltip('false'))
    localStorage.setItem('tooltip', 'false')
  }

  const h3Style = {
    color: 'white',
    fontSize: '1em',
  }

  const title = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 style={h3Style}>
        Explore Card: {'   '}
        <i>
          {'<'}left mouse{'>'}
        </i>
      </h3>
      <h3 style={{ ...h3Style, paddingBottom: '0' }}>
        Select Card: {'  '}{' '}
        <i>
          {'<'}ctrl{'>'} + {'<'}left mouse{'>'}
        </i>
      </h3>
      <h3 style={h3Style}>
        Cancel Tips:{'    '}
        <Button
          style={{
            padding: 0,
            ...h3Style,
          }}
          variant="link"
          icon={<MdClose style={{ textAlign: 'center' }} />}
          onClick={hideToolTip}
        />
      </h3>
    </div>
  )

  return (
    <Tooltip
      visible={state.tooltip === 'false' ? false : undefined}
      title={title}
    >
      {children}
    </Tooltip>
  )
}

function elipses(str: string, len: number) {
  if (str.length <= len) return str
  return str.slice(0, len - 3) + '...'
}
