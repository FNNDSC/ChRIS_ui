import React from 'react'
import { useDispatch } from 'react-redux'
import { TextInput, Button, Title, Alert } from '@patternfly/react-core'
import { AiFillEdit } from 'react-icons/ai'
import { PluginInstance } from '@fnndsc/chrisapi'
import { useTypedSelector } from '../../../store/hooks'
import { setPluginTitle } from '../../../store/pluginInstance/actions'

function getDefaultTitle(selectedPlugin?: PluginInstance) {
  return selectedPlugin?.data.title || selectedPlugin?.data.plugin_name
}

const PluginTitle = () => {
  const dispatch = useDispatch()
  const [showInput, setShowInput] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState()
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin,
  )
  const [value, setValue] = React.useState(getDefaultTitle(selectedPlugin))

  const { title, plugin_version, plugin_name } = selectedPlugin?.data
  const pluginName = `${title || `${plugin_name} v.${plugin_version}`} `

  const handleOnChange = (value: string) => {
    setValue(value)
  }

  React.useEffect(() => {
    const title = getDefaultTitle(selectedPlugin)
    setValue(title)
  }, [selectedPlugin])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      // @ts-ignore
      const pluginItem = await selectedPlugin?.put({
        title: value,
      })
      if (pluginItem) {
        dispatch(setPluginTitle(pluginItem))
      }

      setLoading(false)
      setShowInput(false)
    } catch (error) {
      // @ts-ignore
      setError(error)
    }
  }

  return (
    <>
      {showInput ? (
        <>
          <TextInput
            type="text"
            aria-label="Setting Plugin's Title"
            onChange={handleOnChange}
            value={value}
            className="node-details__title--formInput"
          />
          <Button
            onClick={handleSubmit}
            className="node-details__title--formButton"
          >
            {loading ? 'Confirming' : 'Confirm'}
          </Button>
          <Button
            onClick={() => {
              setShowInput(!showInput)
            }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Title headingLevel="h3" size="xl">
            <span>{pluginName}</span>
          </Title>
          <AiFillEdit
            onClick={() => {
              setShowInput(!showInput)
            }}
          />
          {error && <Alert variant="success" isInline title={error} />}
        </>
      )}
    </>
  )
}

export default PluginTitle
