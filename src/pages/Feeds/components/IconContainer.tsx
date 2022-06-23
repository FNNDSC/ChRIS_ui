import React from 'react'
import { 
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  Popover,
  TextInput,
  Button } from '@patternfly/react-core'
import { FaTrash, FaDownload, } from 'react-icons/fa'
import { VscMerge } from 'react-icons/vsc'
import { useDispatch } from 'react-redux'
import {
  downloadFeedRequest,
  deleteFeed,
  mergeFeedRequest,
  toggleSelectAll
} from '../../../store/feed/actions'
import { useTypedSelector } from '../../../store/hooks'

const IconContainer = () => {
  const bulkSelect = useTypedSelector((state) => {
    return state.feed.bulkSelect
  })
  const dispatch = useDispatch()
  const [uploadFileModal, setUploadFileModal] = React.useState(false)
  const handleFileModal = () => {
    setUploadFileModal(!uploadFileModal)
  }
  const modal = (name:string) =>{

    <Modal
      title="Enter feed name"
      onClose={() => {
        handleFileModal()
      }}
      isOpen={true}
      variant={ModalVariant.small}
      arial-labelledby="file-upload"
    >
    </Modal>

};
  
  

  const handleChange = (type: string,name:any) => {
    type === 'download' && dispatch(downloadFeedRequest(bulkSelect,name))
    type === 'merge' && dispatch(mergeFeedRequest(bulkSelect,name))
    type === 'delete' && dispatch(deleteFeed(bulkSelect))
    dispatch(toggleSelectAll(false));
  }
  return (
    <ToggleGroup aria-label="Feed Action Bar">
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Download selected feeds</div>}>
            <FaDownload />
          </Tooltip>
        }
        onChange={() => {console.log(modal("here"));const response = prompt("Enter feed name");handleChange('download',response);}}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Merge selected feeds</div>}>
            <VscMerge style={{
              height: '1.25em',
              width: '1.25em'
            }} />
          </Tooltip>
        }
        onChange={() => {const response = prompt("Enter feed name");handleChange('merge',response);}}
      />
      <ToggleGroupItem
        aria-label="feed-action"
        icon={
          <Tooltip content={<div>Delete selected feeds</div>}>
            <FaTrash />
          </Tooltip>
        }
        onChange={() => handleChange('delete',"")}
      />

    </ToggleGroup>
  )
}

export default IconContainer
