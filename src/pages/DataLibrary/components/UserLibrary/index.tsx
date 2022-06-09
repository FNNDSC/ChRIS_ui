import React, { useContext } from 'react'
import {
  Button,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  AlertGroup,
  ChipGroup,
  Chip,
  Tabs,
  Tab,
  TabTitleText,
} from '@patternfly/react-core'
import { Feed } from '@fnndsc/chrisapi'

import { Alert } from 'antd'
import BrowserContainer from './BrowserContainer'
import LocalSearch from './LocalSearch'
import { FaUpload } from 'react-icons/fa'
import FileUpload from '../../../../components/common/fileupload'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { LocalFile } from '../../../../components/feed/CreateFeed/types'
import { useTypedSelector } from '../../../../store/hooks'
import { FileSelect, LibraryContext, Types } from './context'
import { MainRouterContext } from '../../../../routes'
import {
  removeFileSelect,
  setFolders,
  setSelectFolder,
} from './context/actions'
import { deleteFeed } from '../../../../store/feed/actions'
import { useDispatch } from 'react-redux'
import { fetchResource } from '../../../../utils'
import { handlePaginatedFolders } from './utils'

const DataLibrary = () => {
  const dispatch = useDispatch()
  const username = useTypedSelector((state) => state.user.username)
  const { state, dispatch: dispatchLibrary } = useContext(LibraryContext)
  const router = useContext(MainRouterContext)
  const [uploadFileModal, setUploadFileModal] = React.useState(false)
  const [localFiles, setLocalFiles] = React.useState<LocalFile[]>([])
  const [directoryName, setDirectoryName] = React.useState('')
  const { fileSelect, foldersState } = state
  const [activeTabKey, setActiveTabKey] = React.useState<number>(0)
  const [error, setError] = React.useState<{ type: string; warning: string }[]>(
    [],
  )
  const [fetchingFiles, setFetchingFiles] = React.useState(false)
  const [feedFilesToDelete, setFeedFilestoDelete] = React.useState<
    FileSelect[]
  >([])

  const handleFileModal = () => {
    setUploadFileModal(!uploadFileModal)
    setLocalFiles([])
    setDirectoryName('')
  }

  const handleLocalFiles = (files: LocalFile[]) => {
    setLocalFiles(files)
  }

  const handleDirectoryName = (directoryName: string) => {
    setDirectoryName(directoryName)
  }

  const createFeed = () => {
    const pathList = fileSelect.map((file) => file.exactPath)
    router.actions.createFeedWithData(pathList)
  }

  const clearFeed = () => {
    dispatchLibrary({
      type: Types.SET_CLEAR_FILE_SELECT,
      payload: {
        clear: true,
      },
    })
  }

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    eventKey: number | string,
  ) => {
    setActiveTabKey(eventKey as number)
  }

  const handleDownload = async () => {
    fileSelect.map(async (file: FileSelect) => {
      const params = {
        limit: 100,
        offset: 0,
        fname: file.exactPath,
        fname_incontains: file.exactPath,
      }
      const client = ChrisAPIClient.getClient()
      if (file.type === 'feed') {
        setFetchingFiles(!fetchingFiles)
        const feedFn = client.getFiles
        const bindFn = feedFn.bind(client)
        const files = await fetchResource(params, bindFn)
        setFetchingFiles(!fetchingFiles)
        downloadUtil(files, file.type)
      }

      if (file.type === 'uploads') {
        setFetchingFiles(!fetchingFiles)
        const uploadsFn = client.getUploadedFiles
        const uploadBound = uploadsFn.bind(client)
        const files = await fetchResource(params, uploadBound)
        setFetchingFiles(!fetchingFiles)
        downloadUtil(files, file.type)
      }
      if (file.type === 'services') {
        setFetchingFiles(!fetchingFiles)
        const pacsFn = client.getPACSFiles
        const pacsBound = pacsFn.bind(client)
        const files = await fetchResource(params, pacsBound)
        setFetchingFiles(!fetchingFiles)
        downloadUtil(files, file.type)
      }
    })
  }

  const downloadUtil = async (filesItems: any[], type: string) => {
    try {
      let writable
      const folderName = `Library Download_${type}`
      //@ts-ignore
      const existingDirectoryHandle = await window.showDirectoryPicker()
      const newDirectoryHandle = await existingDirectoryHandle.getDirectoryHandle(
        folderName,
        {
          create: true,
        },
      )
      for (let i = 0; i < filesItems.length; i++) {
        const file = filesItems[i]

        const blob = await file.getFileBlob()
        const paths = file.data.fname.split('/')
        const fileName = paths[paths.length - 1]
        const newFileHandle = await newDirectoryHandle.getFileHandle(fileName, {
          create: true,
        })
        writable = await newFileHandle.createWritable()
        await writable.write(blob)
        await writable.close()
        // Close the file and write the contents to disk.
      }
    } catch (error) {
      setFetchingFiles(false)
    }
  }

  const handleDelete = () => {
    const errorWarnings: any[] = []
    fileSelect.map(async (file: FileSelect) => {
      const client = ChrisAPIClient.getClient()
      if (file.type === 'uploads') {
        const paths = await client.getFileBrowserPath(file.exactPath)
        const fileList = await paths.getFiles({
          limit: 1000,
          offset: 0,
        })
        const files = fileList.getItems()
        if (files) {
          files.map(async (file: any) => {
            await file._delete()
          })
          if (foldersState[file.path]) {
            deleteUtil(file)
          }
        }
      }

      if (file.type === 'feed') {
        errorWarnings.push({
          type: 'feed',
          warning: 'Deleting a feed file deletes a feed',
        })
        setFeedFilestoDelete([...feedFilesToDelete, file])
      }

      if (file.type === 'services') {
        errorWarnings.push({
          type: 'services',
          warning: 'Cannot delete a pacs file currently',
        })
      }
    })

    setError(errorWarnings)
  }

  const deleteUtil = (file: FileSelect) => {
    const newFolders = foldersState[file.path].filter(
      (folder) => folder !== file.folder,
    )
    handlePaginatedFolders(newFolders, file.path, dispatchLibrary)
    dispatchLibrary(setFolders(newFolders, file.path))
    dispatchLibrary(removeFileSelect(file))
    dispatchLibrary(setSelectFolder(''))
  }

  const handleDeleteFeed = async () => {
    const result = Promise.all(
      feedFilesToDelete.map(async (file) => {
        const feedId = file.exactPath
          .split('/')
          .find((feedString) => feedString.includes('feed'))

        if (feedId) {
          const id = feedId.split('_')[1]

          const client = ChrisAPIClient.getClient()
          const feed = await client.getFeed(parseInt(id))

          if (foldersState[file.path]) {
            deleteUtil(file)
          }
          return feed
        }
      }),
    )
    result.then((data) => dispatch(deleteFeed(data as Feed[])))
  }

  const uploadedFiles = (
    <section>
      <LocalSearch type="uploads" username={username} />
      <BrowserContainer
        type="uploads"
        path={`${username}/uploads`}
        username={username}
      />
    </section>
  )

  const feedFiles = (
    <section>
      <LocalSearch type="feed" username={username} />
      <BrowserContainer type="feed" path={`${username}`} username={username} />
    </section>
  )

  const servicesFiles = (
    <section>
      <LocalSearch type="services" username={username} />
      <BrowserContainer type="services" path={`SERVICES`} username={username} />
    </section>
  )

  return (
    <>
      {fileSelect.length > 0 && (
        <AlertGroup isToast>
          <Alert
            type="info"
            description={
              <>
                <ChipGroup>
                  {fileSelect.map((file: FileSelect, index) => {
                    return (
                      <Chip
                        onClick={() => {
                          dispatchLibrary({
                            type: Types.SET_REMOVE_FILE_SELECT,
                            payload: {
                              ...file,
                            },
                          })
                        }}
                        key={index}
                      >
                        {file.exactPath}
                      </Chip>
                    )
                  })}
                </ChipGroup>
              </>
            }
            style={{ width: '100%', marginTop: '3em', padding: '2em' }}
          ></Alert>
          <div
            style={{
              display: 'flex',
              background: '#e6f7ff',
            }}
          >
            <Button onClick={createFeed} variant="link">
              Create Feed
            </Button>
            <Button onClick={clearFeed} variant="link">
              Clear
            </Button>
            <Button
              onClick={() => {
                handleDownload()
              }}
              variant="link"
            >
              Download
            </Button>
            <Button onClick={handleDelete} variant="link">
              Delete
            </Button>
          </div>

          {fetchingFiles && (
            <Alert type="info" closable message="Fetching Files to Download" />
          )}

          {error.length > 0 &&
            error.map((errorString, index) => {
              const errorUtil = () => {
                const newError = error.filter(
                  (errorWarn) => errorWarn.type !== errorString.type,
                )
                setError(newError)
              }
              return (
                <Alert
                  key={index}
                  message={
                    <>
                      <div>{errorString.warning}</div>
                      {errorString.type === 'feed' && (
                        <>
                          {' '}
                          <Button
                            variant="link"
                            onClick={() => {
                              errorUtil()
                              handleDeleteFeed()
                            }}
                          >
                            Confirm
                          </Button>
                          <Button onClick={errorUtil} variant="link">
                            Cancel
                          </Button>
                        </>
                      )}
                    </>
                  }
                  type="warning"
                  closable
                  onClose={errorUtil}
                ></Alert>
              )
            })}
        </AlertGroup>
      )}

      <UploadComponent
        handleFileModal={handleFileModal}
        handleLocalFiles={handleLocalFiles}
        uploadFileModal={uploadFileModal}
        handleDirectoryName={handleDirectoryName}
        directoryName={directoryName}
        localFiles={localFiles}
      />

      <div
        style={{
          display: 'flex',
        }}
      >
        <Button
          style={{
            marginLeft: 'auto',
          }}
          variant="link"
          icon={<FaUpload />}
          onClick={handleFileModal}
        >
          Upload Files
        </Button>
      </div>

      <Tabs
        style={{
          width: '50%',
        }}
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        aria-label="Tabs in the default example"
      >
        <Tab eventKey={0} title={<TabTitleText>Uploads</TabTitleText>}>
          {uploadedFiles}
        </Tab>
        <Tab
          eventKey={1}
          title={<TabTitleText>Completed Analyses</TabTitleText>}
        >
          {feedFiles}
        </Tab>
        <Tab
          eventKey={2}
          title={<TabTitleText>Services / PACS DATA</TabTitleText>}
        >
          {servicesFiles}
        </Tab>
      </Tabs>
    </>
  )
}

export default DataLibrary

const UploadComponent = ({
  handleFileModal,
  handleLocalFiles,
  uploadFileModal,
  localFiles,
  directoryName,
  handleDirectoryName,
}: {
  handleFileModal: () => void
  handleLocalFiles: (files: LocalFile[]) => void
  uploadFileModal: boolean
  localFiles: LocalFile[]
  directoryName: string
  handleDirectoryName: (path: string) => void
}) => {
  const username = useTypedSelector((state) => state.user.username)
  const { dispatch } = useContext(LibraryContext)
  const [warning, setWarning] = React.useState('')
  const [count, setCount] = React.useState(0)

  const handleAddFolder = (directoryName: string) => {
    dispatch({
      type: Types.SET_ADD_FOLDER,
      payload: {
        folder: directoryName,
        username,
      },
    })
  }
  return (
    <Modal
      title="Upload Files"
      onClose={() => {
        handleFileModal()
      }}
      isOpen={uploadFileModal}
      variant={ModalVariant.small}
      arial-labelledby="file-upload"
    >
      <Form isHorizontal>
        <FormGroup
          fieldId="directory name"
          label="Directory Name"
          helperText="Set a directory name"
        >
          <TextInput
            id="horizontal form name"
            value={directoryName}
            type="text"
            name="horizontal-form-name"
            onChange={(value) => {
              setWarning('')
              handleDirectoryName(value)
            }}
          />
        </FormGroup>
      </Form>
      {localFiles.length > 0 && (
        <div
          style={{
            margin: '1em 0 0.5em 0',
          }}
        >
          <b>Total Number of Files to Upload: {localFiles.length}</b>
        </div>
      )}
      {warning && (
        <div
          style={{
            margin: '1em 0 1em, 0',
            color: 'red',
          }}
        >
          {warning}
        </div>
      )}
      {localFiles.length > 0 && directoryName && (
        <Progress
          style={{
            margin: '1em 0 1em 0',
          }}
          title="File Upload Tracker"
          value={count}
          min={0}
          max={localFiles.length}
          measureLocation={ProgressMeasureLocation.top}
          label={`${count} out of ${localFiles.length}`}
          valueText={`${count} out of ${localFiles.length}`}
          variant={
            count === localFiles.length ? ProgressVariant.success : undefined
          }
        />
      )}
      <FileUpload
        className=""
        handleDeleteDispatch={() => {
          console.log('Test')
        }}
        localFiles={[]}
        dispatchFn={async (files) => {
          handleLocalFiles(files)
          if (!directoryName) {
            setWarning('Please add a directory name')
          } else {
            if (directoryName) {
              handleAddFolder(directoryName)
            }
            const client = ChrisAPIClient.getClient()
            const path = `${username}/uploads/${directoryName}`
            for (let i = 0; i < files.length; i++) {
              const file = files[i]
              await client.uploadFile(
                {
                  upload_path: `${path}/${file.name}`,
                },
                {
                  fname: (file as LocalFile).blob,
                },
              )
              setCount(i + 1)
            }
          }
        }}
      />
    </Modal>
  )
}
