import React, { useContext } from 'react'
import {
  Split,
  SplitItem,
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

import { Alert } from 'antd'
import BrowserContainer from './BrowserContainer'
import LocalSearch from './LocalSearch'
import { FaUpload } from 'react-icons/fa'
import FileUpload from '../../../../components/common/fileupload'
import ChrisAPIClient from '../../../../api/chrisapiclient'
import { LocalFile } from '../../../../components/feed/CreateFeed/types'
import { useTypedSelector } from '../../../../store/hooks'
import { LibraryContext, Types } from './context'
import { MainRouterContext } from '../../../../routes'

const DataLibrary = () => {
  const username = useTypedSelector((state) => state.user.username)
  const { state, dispatch } = useContext(LibraryContext)
  const router = useContext(MainRouterContext)
  const [uploadFileModal, setUploadFileModal] = React.useState(false)
  const [localFiles, setLocalFiles] = React.useState<LocalFile[]>([])
  const [directoryName, setDirectoryName] = React.useState('')
  const { multipleFileSelect, fileSelect } = state
  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);


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
    router.actions.createFeedWithData(fileSelect)
  }

  const clearFeed = () => {
    dispatch({
      type: Types.SET_CLEAR_FILE_SELECT,
      payload: {
        clear: true,
      },
    })
  }

  const handleTabClick = (event: React.MouseEvent<HTMLElement, MouseEvent>, eventKey: number | string) => {
    setActiveTabKey(eventKey as number);
  }

  const uploadedFiles = (
    <section>
      <LocalSearch type='uploads' username={username} />
      <BrowserContainer
        type="uploads"
        path={`${username}/uploads`}
        username={username}
      />
    </section>
  )

  const feedFiles = (
    <section>
      <LocalSearch type='feed' username={username} />
      <BrowserContainer type="feed" path={`${username}`} username={username} />
    </section>
  )

  const servicesFiles = (
    <section>
      <LocalSearch type='services' username={username} />
      <BrowserContainer type="services" path={`SERVICES`} username={username} />
    </section>
  )

  return (
    <>
      {multipleFileSelect && fileSelect.length > 0 && (
        <AlertGroup isToast>
          <Alert
            type='success'
            description={
              <ChipGroup

              >
                {fileSelect.map((file: string, index) => {
                  return (
                    <Chip
                      onClick={() => {
                        dispatch({
                          type: Types.SET_REMOVE_FILE_SELECT,
                          payload: {
                            path: file,
                          },
                        })
                      }}
                      key={index}
                    >
                      {file}
                    </Chip>
                  )
                })}
              </ChipGroup>
            }
            style={{ width: '100%', marginTop: '3em', padding: '2em' }}
          >

          </Alert>
          <div style={{ display: 'flex' }}>
            <Button onClick={createFeed} variant='link'>Create Feed</Button>
            <Button onClick={clearFeed} variant='link'>Clear Feed</Button>
          </div>

        </AlertGroup>
      )}

      <section>
        <Split>
          <UploadComponent
            handleFileModal={handleFileModal}
            handleLocalFiles={handleLocalFiles}
            uploadFileModal={uploadFileModal}
            handleDirectoryName={handleDirectoryName}
            directoryName={directoryName}
            localFiles={localFiles}
          />

          <SplitItem>
            <Button icon={<FaUpload />} onClick={handleFileModal}>
              Upload Files
            </Button>
            <Button
              onClick={() => {
                dispatch({
                  type: Types.SET_MULTIPLE_FILE_SELECT,
                  payload: {
                    active: !multipleFileSelect,
                  },
                })
              }}
              style={{ marginLeft: '1em' }}
            >
              {`Multiple Element Select:${multipleFileSelect === true ? ' On' : ' Off'
                }`}
            </Button>
          </SplitItem>
        </Split>
      </section>

      <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        aria-label='Tabs in the default example'>
        <Tab eventKey={0} title={<TabTitleText>Uploads</TabTitleText>}>
          {uploadedFiles}
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Feeds</TabTitleText>}>
          {feedFiles}
        </Tab>
        <Tab eventKey={2} title={<TabTitleText>Services</TabTitleText>}>
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
