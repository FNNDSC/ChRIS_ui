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
  Alert,
  Button } from '@patternfly/react-core'
import { FaTrash, FaDownload} from 'react-icons/fa'
import { VscMerge } from 'react-icons/vsc'
import { MdCallSplit} from 'react-icons/md'
import { useDispatch } from 'react-redux'
import {
  downloadFeedRequest,
  deleteFeed,
  mergeFeedRequest,
  duplicateFeedRequest,
  toggleSelectAll
} from '../../../store/feed/actions'
import { useTypedSelector } from '../../../store/hooks'
const IconContainer = () => {
  const bulkSelect = useTypedSelector((state) => {
    return state.feed.bulkSelect
  })
  const {downloadError,} = useTypedSelector((state) => state.feed)
  const getDefaultName =(bulkSelect:any, action:string) => {
    let prefix = '';
    if(action=='merge'){
      prefix = 'Merge of '
    }
    else if(action=='download'){
      prefix = 'Archive of '
    }
    else{
      prefix = ''
    }
    const feedNames = [];
    for(let i =0; i< bulkSelect.length; i++){
      feedNames.push(bulkSelect[i].data.name);
    }
    // truncate name of the merged feed(limit=100)
    let newFeedName = feedNames.toString().replace(/[, ]+/g, "_");
    newFeedName = prefix + newFeedName;
    newFeedName = newFeedName.substring(0, 100);
    if(action == 'duplicate'){
      newFeedName = "duplicate-"
    }
    return newFeedName;
  }

  const dispatch = useDispatch()
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [nameValue, setNameValue] = React.useState('');
  const [defaultName, setDefaultName] = React.useState('');
  const nameInputRef = React.useRef(null);

  const [actionValue, setActionValue] = React.useState('');
  const handleModalToggle = (action:string) => {
    setModalOpen(!isModalOpen);
    setActionValue(action);
    setDefaultName(getDefaultName(bulkSelect,action))
    
  };

  const handleNameInputChange = (value:any) => {
    setNameValue(value);
  };

  const handleSubmit = () =>{
     handleChange(actionValue,nameValue)
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
    type === 'duplicate' && dispatch(duplicateFeedRequest(bulkSelect,name))
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
          <Tooltip content={<div>Duplicate selected feeds</div>}>
            
            <MdCallSplit />
            
          </Tooltip>
        }
        onChange={()=>{handleModalToggle('duplicate')}} 
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
        data-keyboard="false"
        variant={ModalVariant.small}
        title="Feed Name"
        description="Enter a name for your new feed (optional)"
        isOpen={isModalOpen}
        onClose={()=>{handleModalToggle('')}}
        onSubmit={handleSubmit}
        actions={[
          <Button key="create" variant="primary" form="modal-with-form-form" onClick={handleSubmit}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={()=>{handleModalToggle('')}}>
            Cancel
          </Button>
        ]}
      >
        <Form id="modal-with-form-form">
          <FormGroup
            label="Feed Name"
            fieldId="modal-with-form-form-name"
          >
            <TextInput
              type="email"
              id="modal-with-form-form-name"
              name="modal-with-form-form-name"
              placeholder={defaultName}
              value={nameValue}
              onChange={handleNameInputChange}
              ref={nameInputRef}
            />
            {downloadError?
        <Alert
          isInline
          variant="danger"
          title={downloadError+" Feeds from other creators need to be shared with you first."}
        >
        
        </Alert>
        :''} 
          </FormGroup>
        </Form>
       
      </Modal>
    </ToggleGroup>
  )
}

export default IconContainer
