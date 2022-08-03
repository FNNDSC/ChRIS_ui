import React, { useState } from 'react'
import {
  TextInput,
  Form,
  Label,
  Button,
  ActionGroup,
  Alert,
} from '@patternfly/react-core'

interface InputUserProps {
  handleModalClose: () => void
  handleCreate: (username: string) => void
  error: string
  cleanError: () => void
  loading: boolean
}

const InputUser: React.FC<InputUserProps> = ({
  handleCreate,
  handleModalClose,
  error,
  cleanError,
  loading,
}) => {
  const [value, setValue] = useState('')

  const handleChange = (value: string) => {
    setValue(value)
    cleanError()
  }
  const handleSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault()
    handleCreate(value)
  }

  return (
    <div>
      <Form>
        <Label className="share-feed-label">Enter an username</Label>
        <TextInput
          value={value}
          type="text"
          onChange={handleChange}
          aria-label="text input example"
        />
        {error && <Alert variant="danger" title={error} />}
        {loading && <span>Sharing Feed...</span>}
        <ActionGroup>
          <Button onClick={handleSubmit}>Save</Button>
          <Button onClick={() => handleModalClose()}>Cancel</Button>
        </ActionGroup>
      </Form>
    </div>
  )
}

export default InputUser
