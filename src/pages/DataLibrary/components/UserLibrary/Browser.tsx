import React, { useState, useContext } from 'react'
import {
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardActions,
  CardBody,
  Split,
  SplitItem,
  Button,
  Dropdown,
  KebabToggle,
  DropdownItem,
  Modal,
  Checkbox,
} from '@patternfly/react-core'
import {
  FaFile,
  FaFolder,
  FaTrashAlt,
  FaDownload,
  FaExpand,
} from 'react-icons/fa'
import FileDetailView from '../../../../components/feed/Preview/FileDetailView'
import { LibraryContext, Paginated } from './context'
import FileViewerModel from '../../../../api/models/file-viewer.model'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { Spin } from 'antd'
import { Types } from './context'

interface BrowserInterface {
  initialPath: string
  handleFolderClick: (path: string, prevPath: string) => void
  folders: string[]
  files: any[]
  paginated: {
    [key: string]: Paginated
  }
  handlePagination: (path: string, type: string) => void
  previewAll: boolean
  handleDelete?: (path: string, folder: string) => void
  handleDownload?: (path: string, folder: string) => void
  browserType: string
  username?: string | null
  multipleFileSelect: boolean
}

export function Browser({
  initialPath,
  handleFolderClick,
  folders,
  files,
  paginated,
  handlePagination,
  previewAll,
  handleDelete,
  handleDownload,
  browserType,
  username,
  multipleFileSelect,
}: BrowserInterface) {
  return (
    <Grid hasGutter>
      {files && files.length > 0
        ? files.map((file) => {
            return (
              <GridItem key={file.data.fname} sm={12} lg={2}>
                <FileCard
                  previewAll={previewAll}
                  file={file}
                  multipleFileSelect={multipleFileSelect}
                  initialPath={initialPath}
                />
              </GridItem>
            )
          })
        : folders &&
          folders.length > 0 &&
          folders.map((folder, index) => {
            return (
              <GridItem key={`${folder}_${index}`} sm={12} lg={2}>
                <FolderCard
                  browserType={browserType}
                  initialPath={initialPath}
                  handleFolderClick={handleFolderClick}
                  handleDelete={handleDelete}
                  handleDownload={handleDownload}
                  key={index}
                  folder={folder}
                  username={username}
                  multipleFileSelect={multipleFileSelect}
                />
              </GridItem>
            )
          })}

      {folders &&
        folders.length > 0 &&
        Object.keys(paginated).length > 0 &&
        initialPath &&
        paginated[initialPath] &&
        paginated[initialPath].hasNext && (
          <GridItem>
            <Split>
              <SplitItem isFilled>
                <Button
                  onClick={() => {
                    handlePagination(initialPath, 'folder')
                  }}
                  variant="link"
                >
                  Read more Folders
                </Button>
              </SplitItem>
            </Split>
          </GridItem>
        )}

      {files &&
        files.length > 0 &&
        Object.keys(paginated).length > 0 &&
        initialPath &&
        paginated[initialPath] &&
        paginated[initialPath].hasNext && (
          <GridItem>
            <Split>
              <SplitItem isFilled>
                <Button
                  onClick={() => {
                    handlePagination(initialPath, 'file')
                  }}
                  variant="link"
                >
                  Read more files
                </Button>
              </SplitItem>
            </Split>
          </GridItem>
        )}
    </Grid>
  )
}

function FileCard({
  file,
  previewAll,
  multipleFileSelect,
  initialPath,
}: {
  file: any
  previewAll: boolean
  multipleFileSelect: boolean
  initialPath: string
}) {
  const { dispatch, state } = useContext(LibraryContext)
  const { fileSelect } = state
  const fileNameArray = file.data.fname.split('/')
  const fileName = fileNameArray[fileNameArray.length - 1]
  const [largePreview, setLargePreview] = React.useState(false)
  const path = `${initialPath}/${fileName}`

  return (
    <>
      <Card key={file.data.fname} isRounded isHoverable isSelectable>
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

          <div
            style={{
              overflow: 'hidden',
            }}
          >
            {multipleFileSelect && (
              <Checkbox
                id={path}
                isChecked={fileSelect.includes(path)}
                name={path}
                onChange={(checked: boolean) => {
                  if (checked) {
                    dispatch({
                      type: Types.SET_ADD_FILE_SELECT,
                      payload: {
                        path,
                      },
                    })
                  } else {
                    dispatch({
                      type: Types.SET_REMOVE_FILE_SELECT,
                      payload: {
                        path,
                      },
                    })
                  }
                }}
                style={{
                  marginRight: '0.5em',
                  padding: '0',
                }}
              />
            )}
            <Button icon={<FaFile />} variant="link" style={{ padding: '0' }}>
              <b>{elipses(fileName, 20)}</b>
            </Button>
          </div>
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

            <Button
              variant="link"
              onClick={() => {
                setLargePreview(true)
              }}
              icon={<FaExpand />}
            ></Button>
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
    </>
  )
}

interface FolderCardInterface {
  browserType: string
  initialPath: string
  folder: string
  handleFolderClick: (path: string, prevPath: string) => void
  handleDelete?: (path: string, folder: string) => void
  handleDownload?: (path: string, folder: string) => void
  username?: string | null
  multipleFileSelect: boolean
}

function FolderCard({
  browserType,
  initialPath,
  folder,
  handleFolderClick,
  handleDelete,
  handleDownload,
  username,
  multipleFileSelect,
}: FolderCardInterface) {
  const { dispatch, state } = useContext(LibraryContext)
  const { fileSelect } = state
  const [dropdown, setDropdown] = useState(false)
  const [feedName, setFeedName] = useState('')

  const toggle = (
    <KebabToggle
      onToggle={() => setDropdown(!dropdown)}
      style={{ padding: '0' }}
    />
  )

  React.useEffect(() => {
    async function fetchFeedName() {
      if (browserType === 'feed' && initialPath === username) {
        const client = ChrisAPIClient.getClient()
        const id = folder.split('_')[1]
        const feed = await client.getFeed(parseInt(id))
        setFeedName(feed.data.name)
      }
    }
    fetchFeedName()
  }, [])

  const pad = <span style={{ padding: '0 0.25em' }} />

  const downloadDropdown = (
    <DropdownItem
      key="download folder"
      component="button"
      onClick={() => {
        //handleDownload()
        handleDownload && handleDownload(`${initialPath}/${folder}`, folder)
      }}
    >
      <FaDownload />
      {pad} Download
    </DropdownItem>
  )

  const deleteDropdown = (
    <DropdownItem
      key="delete"
      component="button"
      onClick={() => {
        handleDelete && handleDelete(`${initialPath}/${folder}`, folder)
      }}
    >
      <FaTrashAlt />
      {pad} Delete
    </DropdownItem>
  )

  const path = `${initialPath}/${folder}`
  return (
    <Card isHoverable isSelectable isRounded>
      <CardHeader>
        <CardActions>
          <Dropdown
            isPlain
            toggle={toggle}
            isOpen={dropdown}
            position="right"
            onSelect={() => {
              setDropdown(false)
            }}
            dropdownItems={
              browserType == 'uploads'
                ? [deleteDropdown, downloadDropdown]
                : [downloadDropdown]
            }
          ></Dropdown>
        </CardActions>
        <Split style={{ overflow: 'hidden' }}>
          <SplitItem style={{ marginRight: '1em' }}>
            {multipleFileSelect && (
              <Checkbox
                id={path}
                isChecked={fileSelect.includes(path)}
                name={path}
                onChange={(checked: boolean) => {
                  if (checked) {
                    dispatch({
                      type: Types.SET_ADD_FILE_SELECT,
                      payload: {
                        path,
                      },
                    })
                  } else {
                    dispatch({
                      type: Types.SET_REMOVE_FILE_SELECT,
                      payload: {
                        path,
                      },
                    })
                  }
                }}
                style={{
                  marginRight: '0.5em',
                  padding: '0',
                }}
              />
            )}
            <FaFolder />
          </SplitItem>
          <SplitItem isFilled>
            <Button
              style={{ padding: 0 }}
              variant="link"
              onClick={() => {
                handleFolderClick(`${initialPath}/${folder}`, initialPath)
              }}
            >
              <b>
                {browserType === 'feed' && initialPath === username ? (
                  !feedName ? (
                    <Spin />
                  ) : (
                    elipses(feedName, 36)
                  )
                ) : (
                  elipses(folder, 36)
                )}
              </b>
            </Button>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  )
}

function elipses(str: string, len: number) {
  if (str.length <= len) return str
  return str.slice(0, len - 3) + '...'
}
