import React, { useContext } from 'react'
import { Breadcrumb, BreadcrumbItem, Split, SplitItem } from '@patternfly/react-core'
import { FaTrash, FaFile } from 'react-icons/fa'
import { CreateFeedContext } from '../context'
import { Types, LocalFile } from '../types'

export const FileList = ({ file, index }: { file: string; index: number }) => {
  const { dispatch } = useContext(CreateFeedContext)

  return (
    <div className="file-preview" key={index}>
      <Breadcrumb>
        {file.split('/').map((path: string, index: number) => (
          <BreadcrumbItem key={index}>{path}</BreadcrumbItem>
        ))}
      </Breadcrumb>
      <span className="trash-icon">
        <FaTrash
          onClick={() => {
            dispatch({
              type: Types.RemoveChrisFile,
              payload: {
                file,
                checkedKeys: [],
              },
            })
          }}
        />
      </span>
    </div>
  )
}

export const LocalFileList = ({
  file,
  handleDeleteDispatch,
  showIcon,
}: {
  file: LocalFile
  index: number
  showIcon: boolean
  handleDeleteDispatch?: (file: string) => void
}) => (
  <div className="file-preview" key={file.name}>
    <span className="file-icon">
      <FaFile />
    </span>
    <span className="file-name">{file.name}</span>
    {showIcon && (
      <span className="trash-icon">
        <FaTrash
          onClick={() => {
            handleDeleteDispatch && handleDeleteDispatch(file.name)
          }}
        />
      </span>
    )}
  </div>
)

function generateLocalFileList(localFiles: LocalFile[]) {
  return localFiles.map((file: LocalFile, index: number) => (
    <React.Fragment key={index}>
      <LocalFileList showIcon={false} file={file} index={index} />
    </React.Fragment>
  ))
}

function generateChrisFileList(chrisFiles: string[]) {
  return chrisFiles.map((file: string, index: number) => (
    <React.Fragment key={index}>
      <FileList file={file} index={index} />
    </React.Fragment>
  ))
}

export const ChrisFileDetails = ({ chrisFiles }: { chrisFiles: string[] }) => (
  <Split>
    <SplitItem isFilled className="file-list">
      <p>Existing Files to add to new feed:</p>
      {generateChrisFileList(chrisFiles)}
    </SplitItem>
  </Split>
)

export const LocalFileDetails = ({ localFiles }: { localFiles: LocalFile[] }) => (
  <Split>
    <SplitItem isFilled className="file-list">
      <p>Local Files to add to new feed:</p>
      {generateLocalFileList(localFiles)}
    </SplitItem>
  </Split>
)

export function ErrorMessage({ error }: any) {
  return (
    <div
      role="alert"
      style={{
        color: 'red',
      }}
    >
      <span>There was an error:</span>
      <pre
        style={{
          whiteSpace: 'break-spaces',
          margin: '0',
          marginBottom: -5,
        }}
      >
        {error.message && error.message}
      </pre>
    </div>
  )
}
