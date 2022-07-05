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
  const { state, dispatch: dispatchLibrary } = useContext(LibraryContext)
  const [activeTabKey, setActiveTabKey] = React.useState<number>(0)
  const username = useTypedSelector((state) => state.user.username)
  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    eventKey: number | string,
  ) => {
    setActiveTabKey(eventKey as number)
  }

  console.log("STATE", state);

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
    <Tabs
      style={{
        width: '50%',
      }}
      activeKey={activeTabKey}
      onSelect={handleTabClick}
      aria-label="Tabs in the default example"
    >
      <Tab eventKey={0} title={<TabTitleText>Uploads</TabTitleText>}>
        {activeTabKey===0 && uploadedFiles}
      </Tab>
      <Tab eventKey={1} title={<TabTitleText>Completed Analyses</TabTitleText>}>
        {activeTabKey === 1 && feedFiles}
      </Tab>
      <Tab eventKey={2} title={<TabTitleText>Services / PACS</TabTitleText>}>
        {activeTabKey === 2 && servicesFiles}
      </Tab>
    </Tabs>
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
