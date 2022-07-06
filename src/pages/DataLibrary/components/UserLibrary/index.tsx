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
import { clearSelectFolder, setFolders } from './context/actions'
import { deleteFeed } from '../../../../store/feed/actions'
import { useDispatch } from 'react-redux'
import { fetchResource } from '../../../../utils'
import { handlePaginatedFolders } from './utils'

const DataLibrary = () => {
  const dispatch = useDispatch()
  const { state, dispatch: dispatchLibrary } = useContext(LibraryContext)
  const [activeTabKey, setActiveTabKey] = React.useState<number>(0)
  const username = useTypedSelector((state) => state.user.username)
  const router = useContext(MainRouterContext)
  const [uploadFileModal, setUploadFileModal] = React.useState(false)
  const [localFiles, setLocalFiles] = React.useState<LocalFile[]>([])
  const [directoryName, setDirectoryName] = React.useState('')
  const { foldersState, selectedFolder } = state
  const [error, setError] = React.useState<{ type: string; warning: string }[]>(
    [],
  )
  const [fetchingFiles, setFetchingFiles] = React.useState(false)
  const [feedFilesToDelete, setFeedFilestoDelete] = React.useState<
    FileSelect[]
  >([])

  console.log('STATE', state)

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
    const pathList = selectedFolder.map((file) => {
      return file.folder.path
    })
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
    setFetchingFiles(!fetchingFiles)

    Promise.all(
      selectedFolder.map(async (file: FileSelect) => {
        const { folder } = file
        const { path: exactPath } = folder
        const filesToPush = []
        const params = {
          limit: 100,
          offset: 0,
          fname: exactPath,
          fname_icontains: exactPath,
        }

        const client = ChrisAPIClient.getClient()
        if (file.type === 'feed') {
          const feedFn = client.getFiles
          const bindFn = feedFn.bind(client)
          const fileItems = await fetchResource(params, bindFn)
          filesToPush.push(...fileItems)
        }

        if (file.type === 'uploads') {
          const uploadsFn = client.getUploadedFiles
          const uploadBound = uploadsFn.bind(client)
          const fileItems = await fetchResource(params, uploadBound)
          filesToPush.push(...fileItems)
        }
        if (file.type === 'services') {
          const pacsFn = client.getPACSFiles
          const pacsBound = pacsFn.bind(client)
          const fileItems = await fetchResource(params, pacsBound)

          filesToPush.push(...fileItems)
        }
        return filesToPush
      }),
    ).then((files) => {
      setFetchingFiles(false)
      downloadUtil(files)
    })
  }

  const downloadUtil = async (filesItems: any[]) => {
    try {
      let writable
      //@ts-ignore
      const existingDirectoryHandle = await window.showDirectoryPicker()
      for (let i = 0; i < filesItems.length; i++) {
        const files = filesItems[i]

        for (let k = 0; k < files.length; k++) {
          const folderNameSplit = files[k].data.fname.split('/')

          const newDirectoryHandle: { [key: string]: any } = {}
          for (let j = 0; j < folderNameSplit.length; j++) {
            if (j === 0) {
              newDirectoryHandle[
                j
              ] = await existingDirectoryHandle.getDirectoryHandle(
                folderNameSplit[j],
                {
                  create: true,
                },
              )
            } else if (j === folderNameSplit.length - 1) {
              const blob = await files[k].getFileBlob()
              const fileName = folderNameSplit[j]
              const handle = newDirectoryHandle[j - 1]
              if (handle) {
                const newFileHandle = await handle.getFileHandle(fileName, {
                  create: true,
                })
                writable = await newFileHandle.createWritable()
                await writable.write(blob)
                writable.close()
              }
            } else {
              const existingHandle = newDirectoryHandle[j - 1]
              if (existingHandle) {
                newDirectoryHandle[j] = await existingHandle.getDirectoryHandle(
                  folderNameSplit[j],
                  {
                    create: true,
                  },
                )
              }
            }
          }
        }
      }
    } catch (error) {
      setFetchingFiles(false)
    }
  }

  const handleDelete = () => {
    const errorWarnings: any[] = []

    selectedFolder.map(async (file: FileSelect) => {
      const client = ChrisAPIClient.getClient()
      if (file.type === 'uploads') {
        const paths = await client.getFileBrowserPath(file.folder.path)
        const fileList = await paths.getFiles({
          limit: 1000,
          offset: 0,
        })
        const files = fileList.getItems()
        if (files) {
          files.map(async (file: any) => {
            await file._delete()
          })
          deleteUtil(file)
        }
      }

      if (file.type === 'feed') {
        errorWarnings.push({
          type: 'feed',
          warning: 'Deleting a feed selection deletes a feed',
        })
        setFeedFilestoDelete([...feedFilesToDelete, file])
      }

      if (file.type === 'services') {
        errorWarnings.push({
          type: 'services',
          warning: 'Cannot delete a pacs selection currently',
        })
      }
    })

    setError(errorWarnings)
  }

  const deleteUtil = (file: FileSelect) => {
    console.log('File', file, foldersState)
    /*
    console.log('file', file, foldersState)
    
    const newFolders = foldersState.filter(
      (folder) => folder.path !== file.folder.path,
    )
   // handlePaginatedFolders(newFolders, file.path, dispatchLibrary)
    dispatchLibrary(setFolders(newFolders, file.path))
    dispatchLibrary(clearSelectFolder(file))
    */
  }

  const handleDeleteFeed = async () => {
    const result = Promise.all(
      feedFilesToDelete.map(async (file) => {
        const feedId = file.folder.path
          .split('/')
          .find((feedString) => feedString.includes('feed'))

        if (feedId) {
          const id = feedId.split('_')[1]
          const client = ChrisAPIClient.getClient()
          const feed = await client.getFeed(parseInt(id))
          deleteUtil(file)
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
      {selectedFolder.length > 0 && (
        <AlertGroup
          style={{
            zIndex: '999',
          }}
          isToast
        >
          <Alert
            type="info"
            description={
              <>
                <div
                  style={{
                    marginBottom: '1em',
                    display: 'flex',
                  }}
                >
                  <Button
                    style={{ marginRight: '0.5em' }}
                    onClick={createFeed}
                    variant="primary"
                  >
                    Create Analysis
                  </Button>

                  <Button
                    style={{ marginRight: '0.5em' }}
                    onClick={() => {
                      handleDownload()
                    }}
                    variant="secondary"
                  >
                    Download Data
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                    Delete Data
                  </Button>
                </div>
                {selectedFolder.length > 0 && (
                  <>
                    <ChipGroup style={{ marginBottom: '1em' }} categoryName="">
                      {selectedFolder.map((file: FileSelect, index) => {
                        return (
                          <Chip
                            onClick={() => {
                              dispatchLibrary(clearSelectFolder(file))
                            }}
                            key={index}
                          >
                            {file.folder.path}
                          </Chip>
                        )
                      })}
                    </ChipGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Button variant="tertiary" onClick={clearFeed}>
                        Empty Cart
                      </Button>
                    </div>
                  </>
                )}
              </>
            }
            style={{ width: '100%', marginTop: '3em', padding: '2em' }}
          ></Alert>

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
          {activeTabKey === 0 && uploadedFiles}
        </Tab>
        <Tab
          eventKey={1}
          title={<TabTitleText>Completed Analyses</TabTitleText>}
        >
          {activeTabKey === 1 && feedFiles}
        </Tab>
        <Tab eventKey={2} title={<TabTitleText>Services / PACS</TabTitleText>}>
          {activeTabKey === 2 && servicesFiles}
        </Tab>
      </Tabs>
    </>
  )
}

export default DataLibrary

interface UploadComponent {
  handleFileModal: () => void
  handleLocalFiles: (files: LocalFile[]) => void
  uploadFileModal: boolean
  localFiles: LocalFile[]
  directoryName: string
  handleDirectoryName: (path: string) => void
}

const UploadComponent = ({
  handleFileModal,
  handleLocalFiles,
  uploadFileModal,
  localFiles,
  directoryName,
  handleDirectoryName,
}: UploadComponent) => {
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

            /** Temporary Timer */

            setTimeout(() => {
              handleFileModal()
            }, 500)
          }
        }}
      />
    </Modal>
  )
}
