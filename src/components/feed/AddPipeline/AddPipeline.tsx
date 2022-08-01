import React from 'react'
import { useDispatch } from 'react-redux'
import {
  Button,
  Modal,
  List,
  ListItem,
  TextVariants,
  TextContent,
  Text,
  Alert,
  Divider,
  Pagination,
} from '@patternfly/react-core'
import { MdOutlineAddCircle } from 'react-icons/md'
import { useTypedSelector } from '../../../store/hooks'
import ChrisAPIClient from '../../../api/chrisapiclient'
import { addNodeRequest } from '../../../store/pluginInstance/actions'
import { runPipelineSequence } from '../CreateFeed/utils/createFeed'
import { fetchResources } from '../CreateFeed/utils/pipelines'
import { Spin } from 'antd'
const AddPipeline = () => {
  const dispatch = useDispatch()
  const { selectedPlugin, pluginInstances } = useTypedSelector(
    (state) => state.instance,
  )
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedPipeline, setSelectedPipeline] = React.useState<any>()
  const [creatingPipeline, setCreatingPipeline] = React.useState(false)
  const [errorString, setErrorString] = React.useState('')

  const handleToggle = () => {
    setCreatingPipeline(false)
    setSelectedPipeline(undefined)
    setErrorString('')
    setIsModalOpen(!isModalOpen)
  }

  const addPipeline = async () => {
    setCreatingPipeline(true)
    if (selectedPlugin && selectedPipeline) {
      const resources = await fetchResources(selectedPipeline)
      const {
        pluginPipings,
        parameters: pluginParameters,
        pipelinePlugins,
      } = resources

      if (pluginPipings && pluginParameters && pipelinePlugins) {
        const { pluginInstanceList, errorString } = await runPipelineSequence(
          pluginPipings,
          pluginParameters,
          pipelinePlugins,
          selectedPlugin,
        )
        for (let i = 0; i < pluginInstanceList.length; i++) {
          dispatch(
            addNodeRequest({
              pluginItem: pluginInstanceList[i],
              nodes: pluginInstances.data,
            }),
          )
        }
        if (errorString) {
          setErrorString(errorString)
        }
      }
    }
    setCreatingPipeline(false)
  }

  const handleSelectPipeline = (pipeline: any) => {
    setErrorString('')
    if (selectedPipeline && pipeline.data.id === selectedPipeline.data.id) {
      setSelectedPipeline(undefined)
    } else {
      setSelectedPipeline(pipeline)
    }
  }

  return (
    <React.Fragment>
      <Button
        icon={<MdOutlineAddCircle />}
        onClick={handleToggle}
        type="button"
      >
        Add a Pipeline
      </Button>
      <Modal
        style={{
          height: '100%',
        }}
        variant="medium"
        aria-label="My Pipeline Modal"
        isOpen={isModalOpen}
        onClose={handleToggle}
        description="Add a Pipeline to the plugin instance"
        actions={[
          <Button key="confirm" variant="primary" onClick={addPipeline}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={handleToggle}>
            Cancel
          </Button>,
        ]}
      >
        <PipelineList
          selectedPipeline={selectedPipeline}
          handleSelectPipeline={handleSelectPipeline}
          addPipeline={addPipeline}
        />
        {creatingPipeline && (
          <>
            <Spin />
            <span style={{ marginLeft: '0.5em' }}>
              Adding the pipeline to the selected node
            </span>
          </>
        )}
        {errorString && (
          <Alert variant="danger" isInline isPlain title={errorString} />
        )}
      </Modal>
    </React.Fragment>
  )
}

export default AddPipeline

interface PipelineListProps {
  addPipeline: () => void
  handleSelectPipeline: (pipeline: any) => void
  selectedPipeline?: any
}

const PipelineList = ({
  selectedPipeline,
  handleSelectPipeline,
}: PipelineListProps) => {
  const [pipelines, setPipelines] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [filterState, setFilterState] = React.useState({
    perPage: 10,
    currentPage: 1,
    itemCount: 0,
  })

  const { itemCount, perPage, currentPage } = filterState

  React.useEffect(() => {
    async function fetchPipelines() {
      const client = ChrisAPIClient.getClient()
      const params = {
        limit: perPage,
        offset: perPage * (currentPage - 1),
      }
      setLoading(true)
      const registeredPipelinesList = await client.getPipelines(params)
      const registeredPipelines = registeredPipelinesList.getItems()

      if (registeredPipelines) {
        setPipelines(registeredPipelines)
      }
      setFilterState((state) => {
        return {
          ...state,
          itemCount: registeredPipelinesList.totalCount,
        }
      })
      setLoading(false)
    }

    fetchPipelines()
  }, [perPage, currentPage])
  const handlePageSet = (_e: any, currentPage: number) => {
    setFilterState({
      ...filterState,
      currentPage,
    })
  }
  const handlePerPageSet = (_e: any, perPage: number) => {
    setFilterState({
      ...filterState,
      perPage,
    })
  }

  return (
    <>
      <TextContent>
        <Text component={TextVariants.h1}>Select a Pipeline</Text>
      </TextContent>
      <Pagination
        itemCount={itemCount}
        perPage={perPage}
        page={currentPage}
        onSetPage={handlePageSet}
        onPerPageSelect={handlePerPageSet}
      />
      {loading ? (
        <div
          style={{
            margin: '20px 0',
            marginBottom: '20px',
            padding: '30px 50px',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          }}
        >
          <Spin />
        </div>
      ) : (
        <List isPlain>
          {pipelines.map((pipeline) => (
            <React.Fragment key={pipeline.data.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '1.25em',
                }}
                key={pipeline.data.id}
              >
                <ListItem>{pipeline.data.name}</ListItem>
                <Button
                  onClick={() => handleSelectPipeline(pipeline)}
                  variant="primary"
                >
                  {selectedPipeline &&
                  selectedPipeline.data.id === pipeline.data.id
                    ? 'De-Select'
                    : 'Select'}
                </Button>
              </div>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </>
  )
}
