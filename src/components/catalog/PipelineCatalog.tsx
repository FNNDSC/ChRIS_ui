import React, { useEffect } from 'react'
import ChrisAPIClient from '../../api/chrisapiclient'
import DisplayPage from './DisplayPage'
import { Title, EmptyState, EmptyStateIcon, Spinner } from '@patternfly/react-core';


const PipelineCatalog = () => {
  const [pipelines, setPipelines] = React.useState<any[]>()
  const [fetch, setFetch] = React.useState(false)
  const [filteredId, setFilteredId] = React.useState<number>()
  const [pageState, setPageState] = React.useState({
    page: 1,
    perPage: 10,
    search: '',
    itemCount: 0,
  })

  const { page, perPage, search } = pageState
  const [selectedPipeline, setSelectedPipeline] = React.useState<any>()
  const [fetchingData, setFetchinData] = React.useState(false)

  const onSetPage = (_event: any, page: number) => {
    setPageState({
      ...pageState,
      page,
    })
  }
  const onPerPageSelect = (_event: any, perPage: number) => {
    setPageState({
      ...pageState,
      perPage,
    })
  }

  const handleFilterChange = (value: string) => {
    setPageState({
      ...pageState,
      search: value,
    })
  }
  useEffect(() => {
    async function fetchPipelines(
      perPage: number,
      page: number,
      search: string,
    ) {
      setFetchinData(true)

      const offset = perPage * (page - 1)
      const client = ChrisAPIClient.getClient()
      const params = {
        limit: perPage,
        offset: offset,
        name: search,
      }
      const pipelinesList = await client.getPipelines(params)

      let pipelines = pipelinesList.getItems()
      if (filteredId && pipelines) {
        pipelines = pipelines?.filter(
          (pipeline) => pipeline.data.id !== filteredId,
        )
        setSelectedPipeline(undefined)
      }

      if (pipelines) {
        setPipelines(pipelines)
        setPageState((pageState) => {
          return {
            ...pageState,
            itemCount: pipelinesList.totalCount,
          }
        })
      }
      setTimeout(() => {
        setFetchinData(false)
      }, 2000)
    }

    fetchPipelines(perPage, page, search)
  }, [perPage, page, search, fetch, filteredId])

  const handleFetch = (id?: number) => {
    id && setFilteredId(id)
    setFetch(!fetch)
  }

  const handleSearch = (search: string) => {
    setPageState({
      ...pageState,
      search,
    })
  }

  if (fetchingData) {
    return <>
      <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
        <Title headingLevel='h4'>
          Pipelines loading...please wait
        </Title>
      </EmptyState>
    </>
  }

  return (
    <>
      <DisplayPage
        pageState={pageState}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        resources={pipelines}
        handleFilterChange={handleFilterChange}
        selectedResource={selectedPipeline}
        setSelectedResource={(pipeline: any) => {
          setSelectedPipeline(pipeline)
        }}
        title="Pipelines"
        showPipelineButton={true}
        fetch={handleFetch}
        handlePipelineSearch={handleSearch}
        search={pageState.search}
      />
    </>
  )
}

export default PipelineCatalog
