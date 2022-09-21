import React from 'react'
import { AiOutlineUpload } from 'react-icons/ai'
import ReactJSON from 'react-json-view'
import { Alert, Button } from '@patternfly/react-core'
import { PipelineList} from '@fnndsc/chrisapi'
import { generatePipelineWithData } from '../CreateFeed/utils/pipelines'
import ChrisAPIClient from '../../../api/chrisapiclient'
import { UploadJsonProps } from '../CreateFeed/Pipelines'

export const UploadJson = ({
  handleDispatch,
}: {
  handleDispatch: (result: UploadJsonProps) => void
}) => {
  const fileOpen = React.useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = React.useState('')
  const [error, setError] = React.useState({})
  const [pipelineWarning, setPipelineWarning] = React.useState('')
  const [showSuccessIcon, setShowSuccessIcon] = React.useState(false)

  const showOpenFile = () => {
    setPipelineWarning('')
    if (fileOpen.current) {
      fileOpen.current.click()
    }
  }

  const cleanUp = (event: any) => {
    event.target.value = null
    if (fileOpen.current) {
      fileOpen.current.value = ''
    }
  }

  const readFile = (file: any, event: any) => {
    const reader = new FileReader()

    reader.onloadend = async () => {
      try {
        if (reader.result) {
          const client = ChrisAPIClient.getClient()
          const result = JSON.parse(reader.result as string)
          result['plugin_tree'] = JSON.stringify(result['plugin_tree'])
          setFileName(result.name)
          const pipelineInstanceList: PipelineList = await client.getPipelines({
            name: result.name,
          })
          if (!pipelineInstanceList.data) {
            const {
              resources,
              pipelineInstance,
            } = await generatePipelineWithData(result)
            const { parameters, pluginPipings, pipelinePlugins } = resources
            
            handleDispatch({
              parameters,
              pluginPipings,
              pipelinePlugins,
              pipelineInstance,
            })
            setShowSuccessIcon(true)
            cleanUp(event)
          } else {
            setPipelineWarning(
              `pipeline with the name ${result.name} already exists`,
            )
            cleanUp(event)
          }
        }
      } catch (error) {
        //@ts-ignore
        const errorMessage = error.response.data
        cleanUp(event)
        setError(errorMessage)
      }
    }
    if (file) {
      reader.readAsText(file)
    }
  }

  const handleUpload = (event: any) => {
    const file = event.target.files && event.target.files[0]
    setError({})
    readFile(file, event)
  }

  const keys = Object.keys(error).length

  const alertStyle = {
    marginTop: '1em',
  }

  return (
    <>
      <div
        style={{
          margin: '0.35em 0',
        }}
      >
        <Button onClick={showOpenFile} icon={<AiOutlineUpload />}>
          Upload a JSON spec{' '}
        </Button>
        <span style={{ marginLeft: '1em', fontWeight: 700 }}>
          {fileName}
        </span>
        {showSuccessIcon && (
          <Alert
            style={alertStyle}
            variant="success"
            title="Pipeline Spec uploaded successfully"
          />
        )}
      </div>
      {pipelineWarning && (
        <Alert style={alertStyle} variant="danger" title={pipelineWarning} />
      )}
      {keys > 0 && (
        <div
          style={{
            height: '100px',
          }}
        >
          <ReactJSON
            name={false}
            displayDataTypes={false}
            src={error}
            displayObjectSize={false}
            collapsed={false}
          />
        </div>
      )}

      <input
        ref={fileOpen}
        style={{ display: 'none' }}
        type="file"
        onChange={handleUpload}
      />
    </>
  )
}

export default UploadJson
