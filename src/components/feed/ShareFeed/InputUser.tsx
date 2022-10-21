import React, { useState } from 'react'
import {
  TextInput,
  Form,
  FormGroup,
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

  const handleChange = (
    value: string,
    event: any,
  ) => {
    event.preventDefault()
    setValue(value)
    cleanError()
  }
  const handleSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault()
    handleCreate(value)
  }

  const handleKeyDown = (event?: any) => {
    if (event.key === 'Enter' || event.keyCode === 13 || event.which === 13) {
      handleCreate(value);
    }
  }

  return (
    <div>
      <Form onSubmit={(event) => event.preventDefault()} isHorizontal>
        <FormGroup label="Enter a username" fieldId="horizontal-form-name">
          <TextInput
            value={value}
            type="text"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="text input example"
          />
        </FormGroup>

        {error && <Alert variant="danger" title={error} />}
        {loading && <Spin>Sharing Feed...</Spin>}
        {success && (
          <Alert variant="success" title="Feed Shared Successfully" />
        )}
        <ActionGroup>
          <Button onClick={handleSubmit}>Share Feed</Button>
          <Button onClick={() => handleModalClose()}>Cancel</Button>
        </ActionGroup>
      </Form>
    </div>
  )
}

export default InputUser
