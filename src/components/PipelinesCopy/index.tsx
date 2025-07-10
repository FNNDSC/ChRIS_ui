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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { fetchPipelines, fetchResources } from "../../api/common";
import { Alert, Collapse } from "../Antd";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import { usePaginate } from "../Feeds/usePaginate";
import "./Pipelines.css";
import { DownloadIcon } from "@patternfly/react-icons";
import PipelineUpload from "./PipelineUploadCopy";
import PipelinesComponent from "./PipelinesComponent";
import { PIPELINEQueryTypes, PipelineContext, Types } from "./context";
import { useDownloadSource } from "./useDownloadSource";

type LoadingResources = {
  [key: string]: boolean;
};
type LoadingResourceError = {
  [key: string]: string;
};

const PipelinesCopy = () => {
  const queryClient = useQueryClient();
  const { state, dispatch } = useContext(PipelineContext);
  const { isDarkTheme } = useContext(ThemeContext);
  const [loadingResources, setLoadingResources] = useState<LoadingResources>();
  const [resourceError, setResourceError] = useState<LoadingResourceError>();
  const {
    filterState: pageState,
    handlePageSet,
    handlePerPageSet,
    handleFilterChange,
  } = usePaginate();
  const { perPage, page, search } = pageState;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState<string>(
    PIPELINEQueryTypes.NAME[0],
  );
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pipelines", perPage, page, search, dropdownValue],
    queryFn: async () => {
      const fetchedData = await fetchPipelines(
        perPage,
        page,
        search,
        dropdownValue.toLowerCase(),
      );
      return fetchedData;
    },
    refetchOnMount: true,
  });

  const onToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const fetchPipelinesAgain = () => {
    queryClient.refetchQueries({
      queryKey: ["pipelines"],
    });
  };

  const handlePipelineSelect = async (
    pipelineId: string,
    isSelected: boolean,
  ) => {
    if (isSelected) {
      // If the pipeline is already selected, deselect it
      dispatch({
        type: Types.PipelineToAdd,
        payload: {
          pipeline: undefined,
        },
      });
      // Collapse the accordion panel
      setActiveKeys([]);
    } else {
      // Find the pipeline and select it
      const pipeline = data?.registeredPipelines.find(
        (p) => `${p.data.id}` === pipelineId,
      );
      if (pipeline) {
        dispatch({
          type: Types.PipelineToAdd,
          payload: {
            pipeline,
          },
        });

        // Expand the accordion panel for this pipeline
        setActiveKeys([pipelineId]);

        // Always fetch resources
        try {
          setLoadingResources((prev) => ({
            ...prev,
            [pipeline.data.id]: true,
          }));
          const resourceData = await fetchResources(pipeline);
          dispatch({
            type: Types.SetPipelines,
            payload: {
              pipelineId: pipeline.data.id,
              ...resourceData,
            },
          });
          setLoadingResources((prev) => ({
            ...prev,
            [pipeline.data.id]: false,
          }));
        } catch (e) {
          let error_message =
            "Failed to fetch the resources for this pipeline...";
          if (e instanceof Error) {
            error_message = e.message;
          }
          setResourceError((prev) => ({
            ...prev,
            [pipeline.data.id]: error_message,
          }));
          setLoadingResources((prev) => ({
            ...prev,
            [pipeline.data.id]: false,
          }));
        }
      }
    }
  };

  const handleChange = async (key: string | string[]) => {
    // Update activeKeys to control which accordion panels are open
    const selectedKeys = Array.isArray(key) ? key : [key];

    // There should only be one selected item in the accordion
    if (selectedKeys.length > 0) {
      const pipelineId = selectedKeys[0];
      const isSelected =
        state.pipelineToAdd?.data.id === Number.parseInt(pipelineId);
      // This will update state and also set activeKeys
      await handlePipelineSelect(pipelineId, isSelected);
    } else {
      // If no keys are selected, deselect any current pipeline
      dispatch({
        type: Types.PipelineToAdd,
        payload: {
          pipeline: undefined,
        },
      });
      setActiveKeys([]);
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
    handleFilterChange(search, dropdownValue);
  };

  const updateDropdownValue = (type: string) => {
    setDropdownValue(type);
    handlePipelineSearch("");
  };

  const downloadPipelineMutation = useDownloadSource();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
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
              handlePipelineSearch(value);
            }}
          />
        </div>

        <Pagination
          itemCount={data?.totalCount ? data.totalCount : 0}
          perPage={pageState.perPage}
          page={pageState.page}
          onSetPage={handlePageSet}
          onPerPageSelect={handlePerPageSet}
        />
      </div>

      {<PipelineUpload fetchPipelinesAgain={fetchPipelinesAgain} />}

      {isError && (
        <Alert type="error" description={<span>{error.message}</span>} />
      )}

      {isLoading ? (
        <SpinContainer title="Fetching the Packages" />
      ) : data?.registeredPipelines && data.registeredPipelines.length > 0 ? (
        <Collapse
          style={{ marginTop: "1em" }}
          onChange={handleChange}
          activeKey={activeKeys}
          items={data.registeredPipelines.map((pipeline) => {
            const { name, id, description } = pipeline.data;
            return {
              key: id,
              label: (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{name}</span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: isDarkTheme ? "#B8BBBE" : "#4F5255",
                      }}
                    >
                      {description}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      variant={
                        state.pipelineToAdd?.data.id === id
                          ? "primary"
                          : "secondary"
                      }
                      size="sm"
                      isDisabled={loadingResources?.[id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        const pipelineId = `${id}`;
                        const isSelected = state.pipelineToAdd?.data.id === id;
                        // This will handle both selection and accordion expansion
                        handlePipelineSelect(pipelineId, isSelected);
                      }}
                    >
                      {loadingResources?.[id]
                        ? "Loading resources..."
                        : state.pipelineToAdd?.data.id === id
                          ? "Selected"
                          : "Select package"}
                    </Button>
                    <Button
                      variant="tertiary"
                      size="sm"
                      style={{
                        padding: "0.5em",
                      }}
                      onClick={async (e) => {
                        e.stopPropagation();

                        downloadPipelineMutation.mutate(pipeline);
                      }}
                      icon={<DownloadIcon />}
                    />
                  </div>
                </div>
              ),
              children: (
                <div>
                  {resourceError?.[id] ? (
                    <Alert type="error" description={resourceError[id]} />
                  ) : loadingResources?.[id] ? (
                    <SpinContainer title="Fetching the resources for this package" />
                  ) : (
                    <PipelinesComponent pipeline={pipeline} />
                  )}
                </div>
              ),
            };
          })}
        />
      ) : (
        <EmptyStateComponent title="No Packages were found registered to this ChRIS instance" />
      )}
    </div>
  );
};

export default PipelinesCopy;
