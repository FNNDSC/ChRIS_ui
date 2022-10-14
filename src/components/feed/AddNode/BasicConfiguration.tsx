import React from 'react'
import { FormGroup, TextInput, Title } from '@patternfly/react-core'
import PluginSelect from './PluginSelect'

import { BasicConfigurationProps } from './types'

const BasicConfiguration: React.FC<BasicConfigurationProps> = ({
  handlePluginSelect,
  parent,
  selectedPlugin,
}) => {
  // const [parentDropdownOpen, setParentDropdownOpen] = useState(false);
  // const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  // const [nodes, setNodes] = useState<BasicConfigurationState["nodes"]>([]);

  const value = parent.data.title || parent.data.plugin_name
  // const handleTypeDropdownToggle = (open: boolean) => setTypeDropdownOpen(open);

  return (
    <div className="screen-one">
      <Title headingLevel="h1">Plugin Selection</Title>
      <FormGroup label="Parent node:" fieldId="parent-node">
        <TextInput
          value={`${value} v.${parent.data.plugin_version}`}
          aria-label="Selected Plugin Name"
        />
      </FormGroup>

      <FormGroup label="Select plugin to add:" fieldId="plugin">
        <PluginSelect selected={selectedPlugin} handlePluginSelect={handlePluginSelect} />
      </FormGroup>
    </div>
  )
}

export default BasicConfiguration
