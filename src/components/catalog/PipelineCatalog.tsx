import React, { useEffect } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import DisplayPage from "./DisplayPage";

const PipelineCatalog = () => {
  const [pipelines, setPipelines] = React.useState<any[]>();
  const [fetch, setFetch] = React.useState(false);
  const [filteredId, setFilteredId] = React.useState<number>();
  const [pageState, setPageState] = React.useState({
    page: 1,
    perPage: 5,
    search: "",
    itemCount: 0,
  });

  const { page, perPage, search } = pageState;
  const [selectedPipeline, setSelectedPipeline] = React.useState<any>();

  const onSetPage = (_event: any, page: number) => {
    setPageState({
      ...pageState,
      page,
    });
  };
  const onPerPageSelect = (_event: any, perPage: number) => {
    setPageState({
      ...pageState,
      perPage,
    });
  };

  const handleFilterChange = (value: string) => {
    setPageState({
      ...pageState,
      search: value,
    });
  };
  useEffect(() => {
    async function fetchPipelines(
      perPage: number,
      page: number,
      search: string
    ) {
      const offset = perPage * (page - 1);
      const client = ChrisAPIClient.getClient();
      const params = {
        limit: perPage,
        offset: offset,
        name: search,
      };
      const pipelinesList = await client.getPipelines(params);

      let pipelines = pipelinesList.getItems();
      if (filteredId && pipelines) {
        pipelines = pipelines?.filter(
          (pipeline) => pipeline.data.id !== filteredId
        );
      }
      if (pipelines) {
        setPipelines(pipelines);
        setPageState((pageState) => {
          return {
            ...pageState,
            itemCount: pipelinesList.totalCount,
          };
        });
      }
    }

    fetchPipelines(perPage, page, search);
  }, [perPage, page, search, fetch]);

  const handleFetch = (id?: number) => {
    id && setFilteredId(id);
    setFetch(!fetch);
  };

  const handleSearch = (search: string) => {
    setPageState({
      ...pageState,
      search,
    });
  };
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
          setSelectedPipeline(pipeline);
        }}
        title="Pipelines"
        showPipelineButton={true}
        fetch={handleFetch}
        handlePipelineSearch={handleSearch}
        search={pageState.search}
      />
    </>
  );
};

export default PipelineCatalog;
