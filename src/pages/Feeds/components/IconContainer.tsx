import React from 'react'
import { 
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
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
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [nameValue, setNameValue] = React.useState('');
  const nameInputRef = React.useRef();

  const [actionValue, setActionValue] = React.useState('');
  const handleModalToggle = (action:string) => {
    setModalOpen(!isModalOpen);
    setActionValue(action);
    console.log(bulkSelect)
  };

  const handleNameInputChange = (value:any) => {
    setNameValue(value);
  };

  const handleSubmit = () =>{
   setModalOpen(!isModalOpen);
   handleChange(actionValue,nameValue);
  };
  
  React.useEffect(() => {
    if (isModalOpen && nameInputRef && nameInputRef.current) {
      (nameInputRef.current as HTMLInputElement).focus();
    }
  }, [isModalOpen]);
  
  
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
        onChange={()=>{handleModalToggle('download')}}
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
        onChange={()=>{handleModalToggle('merge')}}
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

      <Modal
        variant={ModalVariant.small}
        title="Feed Name"
        description="Enter a name for your new feed (optional)"
        isOpen={isModalOpen}
        onClose={()=>{handleModalToggle('')}}
        actions={[
          <Button key="create" variant="primary" form="modal-with-form-form" onClick={handleSubmit}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={()=>{handleModalToggle('')}}>
            Cancel
          </Button>
        ]}
      >
        <Form id="modal-with-form-form" onSubmit={handleSubmit}>
          <FormGroup
            label="Feed Name"
            fieldId="modal-with-form-form-name"
          >
            <TextInput
              type="email"
              id="modal-with-form-form-name"
              name="modal-with-form-form-name"
              value={nameValue}
              onChange={handleNameInputChange}
            />
          </FormGroup>
        </Form>
      </Modal>
    </ToggleGroup>
  )
}

export default IconContainer
