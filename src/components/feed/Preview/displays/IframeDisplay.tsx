import React, { Fragment } from 'react'
import { IFileBlob } from '../../../../api/models/file-viewer.model'

type AllProps = {
  fileItem: IFileBlob
}

const IframeDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props

  let url = ''

  if (fileItem.fileType === 'html') {
    url = fileItem.blob
      ? window.URL.createObjectURL(new Blob([fileItem.blob], { type: 'text/html' }))
      : ''
  } else {
    url = fileItem.blob ? window.URL.createObjectURL(new Blob([fileItem.blob])) : ''
  }

  return (
    <>
      <div className="iframe-container">
        <iframe
          key={fileItem.file && fileItem.file.data.fname}
          src={url}
          width="100%"
          height="100%"
          title="Gallery"
        />
      </div>
    </>
  )
}

export default React.memo(IframeDisplay)
