import React from 'react'
import { SimpleList, SimpleListItem } from '@patternfly/react-core'
import { FeedFile } from '@fnndsc/chrisapi'

interface FsmFileSelectProps {
  files: FeedFile[]
  handleSelect: (file: FeedFile) => void
}

const FsmFileSelect = (props: FsmFileSelectProps) => {
  const { files, handleSelect } = props

  const fileList = (
    <SimpleList
      onSelect={(_: any, listItemProps: any) => {
        // data passing between item and handler is done through props
        const file = (listItemProps as any)['x-file'] as FeedFile
        handleSelect(file)
      }}
      className="fsm-file-list"
    >
      {files.map((file) => {
        const {id} = file.data
        return (
          <SimpleListItem key={id} x-file={file}>
            {file.data.fname}
          </SimpleListItem>
        )
      })}
    </SimpleList>
  )

  return (
    <div className="fsm-select-wrap">
      <div className="fsm-select-inner">
        Please select a Freesurfer Mesh File
        {fileList}
      </div>
    </div>
  )
}

export default FsmFileSelect
