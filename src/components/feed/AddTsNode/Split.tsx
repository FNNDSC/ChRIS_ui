import React from 'react'
import { Form, Input } from 'antd'
import { InputType } from './ParentContainer'

type SplitProps = {
  handleSplitChange: (value: string, name: string) => void
  splitInput: InputType
}

const Split = ({ splitInput, handleSplitChange }: SplitProps) => (
  <div className="list-container">
    <Form>
      <Form.Item name="fiter" label="filter">
        <Input
          value={splitInput.filter as string}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleSplitChange(e.target.value, 'filter')
          }}
        />
      </Form.Item>
      <Form.Item name="compute_resource" label="compute resource">
        <Input
          className="input"
          value={splitInput.compute_resource as string}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleSplitChange(e.target.value, 'compute_resource')
          }}
        />
      </Form.Item>
    </Form>
  </div>
)

export default Split
