import React, { useState } from 'react'
import {
  TextInput,
  Form,
  Label,
  Button,
  ActionGroup,
  Alert,
} from '@patternfly/react-core'
import { Spin } from 'antd'

interface InputUserProps {
  handleModalClose: () => void
  handleCreate: (username: string) => void
  error: string
  cleanError: () => void
  loading: boolean
  success: boolean
}

const InputUser: React.FC<InputUserProps> = ({
  handleCreate,
  handleModalClose,
  error,
  cleanError,
  loading,
  success,
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
        {loading && <Spin>Sharing Feed...</Spin>}
        {success && (
          <Alert variant="success" title="Feed Shared Successfully" />
        )}
        <ActionGroup>
          <Button onClick={handleSubmit}>Save</Button>
          <Button onClick={() => handleModalClose()}>Cancel</Button>
        </ActionGroup>
      </Form>
    </div>
  )
}

export default InputUser
