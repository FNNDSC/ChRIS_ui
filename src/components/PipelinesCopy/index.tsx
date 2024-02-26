import { Button, Pagination } from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { Alert, Collapse } from "antd";
import { useContext, useState } from "react";
import { fetchPipelines, fetchResources } from "../../api/common";
import { EmptyStateComponent, SpinContainer } from "../Common";
import PipelinesComponent from "./PipelinesComponent";
import { PerPipelinePayload, PipelineContext, Types } from "./context";

type PaginationEvent = React.MouseEvent | React.KeyboardEvent | MouseEvent;
type LoadingResources = {
  [key: string]: boolean;
};
type LoadingResourceError = {
  [key: string]: string;
};

const PipelinesCopy = () => {
  const { state, dispatch } = useContext(PipelineContext);
  const [loadingResources, setLoadingResources] = useState<LoadingResources>();
  const [resourceError, setResourceError] = useState<LoadingResourceError>();
  const [pageState, setPageState] = useState({
    page: 1,
    perPage: 10,
    search: "",
    itemCount: 0,
  });
  const { perPage, page, search } = pageState;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pipelines", pageState],
    queryFn: async () => {
      const fetchedData = await fetchPipelines(perPage, page, search, "");
      setPageState({
        ...pageState,
        itemCount: fetchedData.totalCount,
      });
      return fetchedData;
    },
    refetchOnMount: true,
  });

  const onSetPage = (_event: PaginationEvent, page: number) => {
    setPageState({
      ...pageState,
      page,
    });
  };

  const onPerPageSelect = (_event: PaginationEvent, perPage: number) => {
    setPageState({
      ...pageState,
      perPage,
    });
  };

  const handleChange = async (key: string | string[]) => {
    const filteredPipelines = data?.registeredPipelines.filter((pipeline) =>
      (key as string[]).includes(`${pipeline.data.id}`),
    );

    if (filteredPipelines) {
      for (const pipeline of filteredPipelines) {
        const { id } = pipeline.data;
        if (!state.selectedPipeline?.[id]) {
          try {
            setLoadingResources({
              ...loadingResources,
              [pipeline.data.id]: true,
            });
            const data: PerPipelinePayload = await fetchResources(pipeline);
            dispatch({
              type: Types.SetPipelines,
              payload: {
                pipelineId: id,
                ...data,
              },
            });
            setLoadingResources({
              ...loadingResources,
              [id]: false,
            });
          } catch {
            setResourceError({
              ...resourceError,
              [id]: "Error in Fetching the Resources for this Pipeline",
            });
            setLoadingResources({
              ...loadingResources,
              [id]: false,
            });
          }
        }
      }
    }
  };

  return (
    <div>
      <Pagination
        itemCount={pageState.itemCount === 0 ? 0 : pageState.itemCount}
        perPage={pageState.perPage}
        page={pageState.page}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />

      {isError && (
        <Alert type="error" description={<span>{error.message}</span>} />
      )}

      {isLoading ? (
        <SpinContainer title="Fetching the Pipelines" />
      ) : data?.registeredPipelines && data.registeredPipelines.length > 0 ? (
        <Collapse
          onChange={handleChange}
          items={data.registeredPipelines.map((pipeline) => {
            const { name, id } = pipeline.data;
            return {
              key: id,
              label: (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <span>{name}</span>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      onClick={() => {
                        dispatch({
                          type: Types.PipelineToAdd,
                          payload: {
                            pipeline,
                          },
                        });
                      }}
                      variant="primary"
                      key="select-action"
                    >
                      {pipeline.data.id === state.pipelineToAdd?.data.id
                        ? "Selected"
                        : "Select"}
                    </Button>{" "}
                  </div>
                </div>
              ),
              children: (
                <div>
                  {resourceError?.[id] ? (
                    <Alert type="error" description={resourceError[id]} />
                  ) : loadingResources?.[id] ? (
                    <SpinContainer title="Fetching the resources for this pipeline" />
                  ) : (
                    <PipelinesComponent pipeline={pipeline} />
                  )}
                </div>
              ),
            };
          })}
        />
      ) : (
        <EmptyStateComponent title="No Pipelines were found registered to this ChRIS instance" />
      )}
    </div>
  );
};

export default PipelinesCopy;
