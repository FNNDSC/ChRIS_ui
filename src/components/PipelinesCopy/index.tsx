import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Pagination,
  TextInput,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import { useQuery } from "@tanstack/react-query";
import { Alert, Collapse } from "antd";
import { useContext, useState } from "react";
import { fetchPipelines, fetchResources } from "../../api/common";
import { EmptyStateComponent, SpinContainer } from "../Common";
import "./Pipelines.css";
import PipelinesComponent from "./PipelinesComponent";
import {
  PIPELINEQueryTypes,
  PerPipelinePayload,
  PipelineContext,
  Types,
} from "./context";

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
  });
  const { perPage, page, search } = pageState;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState<string>(
    PIPELINEQueryTypes.NAME[0],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pipelines", perPage, page, search, dropdownValue],
    queryFn: async () => {
      const fetchedData = await fetchPipelines(
        perPage,
        page,
        search,
        dropdownValue,
      );

      return fetchedData;
    },
    refetchOnMount: true,
  });

  const onToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
            setLoadingResources((prev) => ({ ...prev, [id]: true }));
            const data: PerPipelinePayload = await fetchResources(pipeline);
            dispatch({
              type: Types.SetPipelines,
              payload: {
                pipelineId: id,
                ...data,
              },
            });
            setLoadingResources((prev) => ({ ...prev, [id]: false }));
          } catch {
            setResourceError((prev) => ({
              ...prev,
              [id]: "Error fetching resources for this pipeline",
            }));
            setLoadingResources((prev) => ({ ...prev, [id]: false }));
          }
        }
      }
    }
  };

  const dropdownItems = [
    Object.values(PIPELINEQueryTypes).map((pipeline) => {
      return (
        <DropdownItem
          key={pipeline[0]}
          description={pipeline[1]}
          component="button"
          onClick={() => updateDropdownValue(pipeline[0])}
        >
          {pipeline[0]}
        </DropdownItem>
      );
    }),
  ];

  const onFocus = () => {
    const element = document.getElementById("toggle-basic");
    element?.focus();
  };

  const onSelect = () => {
    setIsDropdownOpen(false);
    onFocus();
  };

  const handlePipelineSearch = (search: string) => {
    setPageState({
      ...pageState,
      search,
    });
  };

  const updateDropdownValue = (type: string) => {
    setDropdownValue(type);
    handlePipelineSearch("");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Dropdown
            onSelect={onSelect}
            toggle={(toggleRef) => {
              return (
                <MenuToggle ref={toggleRef} onClick={onToggle}>
                  {dropdownValue}
                </MenuToggle>
              );
            }}
            isOpen={isDropdownOpen}
          >
            <DropdownList>{dropdownItems}</DropdownList>
          </Dropdown>
          <TextInput
            value={pageState.search}
            type="text"
            placeholder={dropdownValue}
            customIcon={<SearchIcon />}
            aria-label="search"
            onChange={(_event, value: string) => {
              handlePipelineSearch(value.toLowerCase());
            }}
          />
        </div>
        <Pagination
          itemCount={data?.totalCount ? data.totalCount : 0}
          perPage={pageState.perPage}
          page={pageState.page}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
        />
      </div>

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
