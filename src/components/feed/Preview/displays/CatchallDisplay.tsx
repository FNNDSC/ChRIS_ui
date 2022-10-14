import * as React from 'react'
import { FaDownload } from 'react-icons/fa'
import { Alert, Button } from '@patternfly/react-core'
import FileViewerModel, { IFileBlob } from '../../../../api/models/file-viewer.model'

type AllProps = {
  fileItem: IFileBlob
}

const CatchallDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const noPreviewMessage = () => {
    const { fileItem } = props
    const ext = fileItem.fileType ? fileItem.fileType : ''
    const alertText = (
      <>
        <label />
        <br />
        <label>
          <b>File Type:</b> {ext}
        </label>
        <Button
          variant="primary"
          className="float-right"
          onClick={() =>
            fileItem.file &&
            fileItem.file.data.fname &&
            FileViewerModel.downloadFile(fileItem.blob, fileItem.file.data.fname)
          }
        >
          <FaDownload /> Download
        </Button>
      </>
    )
    return (
      <Alert variant="info" title={`No preview available for the filetype ${ext}`}>
        {alertText}
      </Alert>
    )
  }
  return noPreviewMessage()
}

export default React.memo(CatchallDisplay)
