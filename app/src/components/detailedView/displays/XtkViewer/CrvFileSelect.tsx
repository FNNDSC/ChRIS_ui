import {
  Button,
  Popover,
  SimpleList,
  SimpleListItem,
} from '@patternfly/react-core'
import React, { useState } from 'react'
import { FeedFile } from '@fnndsc/chrisapi'

interface CrvFileSelectProps {
  files: FeedFile[]
  selectedFile?: FeedFile
  title?: string
  handleSelect: (file: FeedFile) => void
}

const CrvFileSelect = (props: CrvFileSelectProps) => {
  const { files, title, handleSelect } = props

  const [open, setOpen] = useState(false)

  const fileList = (
    <SimpleList
      onSelect={(listItemProps: any) => {
        // data passing between item and handler is done through props
        const file = (listItemProps as any)['x-file'] as FeedFile
        handleSelect(file)
        setOpen(false)
      }}
      className="crv-file-list"
    >
      {files.map((file) => {
        const title = file.data.fname
        const formattedTitle =
          title.length < 36
            ? title
            : `${title.slice(0, 18)}...${title.slice(-18)}`
        const id = file.data.id
        return (
          <SimpleListItem key={id} x-file={file}>
            {formattedTitle}
          </SimpleListItem>
        )
      })}
    </SimpleList>
  )

  const popoverBody = (
    <div>
      <b>Select a File</b>
      {fileList}
    </div>
  )

  return (
    <div className="crv-select-wrap">
      <Popover
        isVisible={open}
        shouldClose={() => setOpen(false)}
        bodyContent={popoverBody}
      >
        <Button variant="primary" onClick={() => setOpen(true)}>
          {title || 'Select CRV file'}
        </Button>
      </Popover>
    </div>
  )
}

export default CrvFileSelect
