import React from 'react'
import { IFileBlob } from '../../../../api/models/file-viewer.model'

type AllProps = {
  fileItem: IFileBlob
}

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props
  const url = fileItem.blob ? window.URL.createObjectURL(new Blob([fileItem.blob])) : ''
  return <img id={props.fileItem.file ? props.fileItem.file.data.fname : ''} src={url} alt="" />
}

export default React.memo(ImageDisplay)
