import React, { useEffect } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import DisplayPage from "./DisplayPage";

const ComputeCatalog = () => {
  const [computeResources, setComputeResources] = React.useState<any[]>();
  const [loading, setLoading] = React.useState(false);
  const [pageState, setPageState] = React.useState({
    page: 1,
    perPage: 10,
    search: "",
    searchType: "name",
    itemCount: 0,
  });

  const { page, perPage, search, searchType } = pageState;
  const [selectedCompute, setSelectedCompute] = React.useState<any>();

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
    async function fetchComputeResources(
      perPage: number,
      page: number,
      search: string,
      searchType:string,
    ) {
      setLoading(true);
      const offset = perPage * (page - 1);
      const client = ChrisAPIClient.getClient();
      const params = {
        limit: perPage,
        offset: offset,
        [searchType]: search,
      };
      const computeResourcesList = await client.getComputeResources(params);
      const computes = computeResourcesList.getItems();
      if (computes) {
        setComputeResources(computes);
        setPageState((pageState) => {
          return {
            ...pageState,
            itemCount: computeResourcesList.totalCount,
          };
        });
      }
      setLoading(false);
    }

    fetchComputeResources(perPage, page, search, searchType);
  }, [perPage, page, search, searchType]);

  const handleSearch = (search: string, searchType:string) => {
    setPageState({
      ...pageState,
      search,
      searchType,
    });
  };
  return (
    <>
      <DisplayPage
        loading={loading}
        pageState={pageState}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        resources={computeResources}
        handleFilterChange={handleFilterChange}
        selectedResource={selectedCompute}
        setSelectedResource={(compute: any) => {
          setSelectedCompute(compute);
        }}
        title="Compute"
        handleComputeSearch={handleSearch}
        search={pageState.search}
      />
    </>
  );
};

export default ComputeCatalog;
