import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button as AntButton, Collapse } from "antd";
import type { Pipeline } from "@fnndsc/chrisapi";
import PipelinesComponent from "./PipelinesComponent";

// PatternFly or your own components
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Pagination,
  TextInput,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";

// Your local utilities
import { fetchPipelines, fetchResources } from "../../api/common";
import { PipelineContext } from "./context";
import { Types } from "./context";
import { PIPELINEQueryTypes } from "./context";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import { usePaginate } from "../Feeds/usePaginate";

type LoadingResourcesMap = Record<string, boolean>;
type ResourceErrorMap = Record<string, string>;

const PipelinesCopy = () => {
  const { state, dispatch } = useContext(PipelineContext);
  const { isDarkTheme } = useContext(ThemeContext);

  // Local states for loading and errors
  const [loadingResources, setLoadingResources] = useState<LoadingResourcesMap>(
    {},
  );
  const [resourceError, setResourceError] = useState<ResourceErrorMap>({});

  // Track which single pipeline panel is expanded (we allow only one)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // Pagination + search from your custom hook
  const {
    filterState: pageState,
    handlePageSet,
    handlePerPageSet,
    handleFilterChange,
  } = usePaginate();

  const { perPage, page, search } = pageState;

  // Dropdown & search handling
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [dropdownValue, setDropdownValue] = useState<string>(
    PIPELINEQueryTypes.NAME[0],
  );

  const onToggle = () => setIsDropdownOpen(!isDropdownOpen);
  const onSelect = () => {
    setIsDropdownOpen(false);
    const element = document.getElementById("toggle-basic");
    element?.focus();
  };

  const handlePipelineSearch = (searchVal: string) => {
    handleFilterChange(searchVal, dropdownValue);
  };

  const updateDropdownValue = (type: string) => {
    setDropdownValue(type);
    handlePipelineSearch("");
  };

  const dropdownItems = [
    Object.values(PIPELINEQueryTypes).map(([typeName, desc]) => (
      <DropdownItem
        key={typeName}
        description={desc}
        component="button"
        onClick={() => updateDropdownValue(typeName)}
      >
        {typeName}
      </DropdownItem>
    )),
  ];

  // Query for pipelines list
  const {
    data,
    isLoading: isPipelinesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pipelines", perPage, page, search, dropdownValue],
    queryFn: () =>
      fetchPipelines(perPage, page, search, dropdownValue.toLowerCase()),
    refetchOnMount: true,
  });

  // Check if ANY pipeline is loading => global indicator
  const isAnyPipelineLoading = Object.values(loadingResources).some(Boolean);

  //
  // SELECT & UNSELECT Pipeline
  //
  const handleSelectPipeline = async (pipeline: Pipeline) => {
    const pipelineId = String(pipeline.data.id);

    // Mark pipeline as loading
    setLoadingResources((prev) => ({ ...prev, [pipelineId]: true }));
    setResourceError((prev) => ({ ...prev, [pipelineId]: "" }));

    try {
      // 1) Fetch pipeline resources
      const { pluginPipings, parameters, pipelinePlugins } =
        await fetchResources(pipeline);

      // 2) Dispatch "SetPipelines" to store resources in context (single selection).
      dispatch({
        type: Types.SetPipelines,
        payload: {
          pipelineId,
          pluginPipings,
          parameters,
          pipelinePlugins,
        },
      });

      // 3) Also dispatch "PipelineToAdd" to store the actual pipeline object
      //    in 'pipelineToAdd' in your context:
      dispatch({
        type: Types.PipelineToAdd,
        payload: {
          pipeline,
        },
      });
    } catch (err) {
      setResourceError((prev) => ({
        ...prev,
        [pipelineId]: "Error fetching resources for this pipeline",
      }));
    } finally {
      setLoadingResources((prev) => ({ ...prev, [pipelineId]: false }));
    }
  };

  // "Unselect" means remove pipeline from context
  const handleUnselectPipeline = () => {
    dispatch({ type: Types.PipelineToDelete, payload: null });
    setExpandedKeys([]);
  };

  //
  // Collapse logic: only one panel can be open at a time
  //
  const handleCollapseChange = (newExpanded: string | string[]) => {
    const newKeys = Array.isArray(newExpanded) ? newExpanded : [newExpanded];

    // If user expands multiple, only keep the last
    if (newKeys.length > 1) {
      newKeys.splice(0, newKeys.length - 1);
    }

    // If user collapsed everything, unselect pipeline
    if (newKeys.length === 0) {
      const oldIds = state.selectedPipeline
        ? Object.keys(state.selectedPipeline)
        : [];
      if (oldIds.length > 0) {
        handleUnselectPipeline();
      }
      setExpandedKeys([]);
    } else {
      // There's exactly one pipeline expanded
      const newlyExpandedId = newKeys[0];
      // If it's not the current pipeline, select it
      const oldIds = state.selectedPipeline
        ? Object.keys(state.selectedPipeline)
        : [];
      const oldId = oldIds.length > 0 ? oldIds[0] : null;

      if (newlyExpandedId !== oldId && data?.registeredPipelines) {
        const pipelineToExpand = data.registeredPipelines.find(
          (p) => String(p.data.id) === newlyExpandedId,
        );
        if (pipelineToExpand) {
          // unselect old pipeline
          if (oldId) {
            handleUnselectPipeline();
          }
          // select the new pipeline
          handleSelectPipeline(pipelineToExpand);
        }
      }
      setExpandedKeys([newlyExpandedId]);
    }
  };

  return (
    <div>
      {/* Global "processing" indicator if ANY pipeline is loading */}
      {isAnyPipelineLoading && (
        <Alert
          type="info"
          message="Please wait while we fetch resources for your selected pipeline."
          style={{ marginBottom: "1em" }}
          showIcon
        />
      )}

      {/* Top row: search + pagination */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "0.5em" }}>
          <Dropdown
            isOpen={isDropdownOpen}
            onSelect={onSelect}
            toggle={(toggleRef) => (
              <MenuToggle ref={toggleRef} onClick={onToggle}>
                {dropdownValue}
              </MenuToggle>
            )}
          >
            <DropdownList>{dropdownItems}</DropdownList>
          </Dropdown>
          <TextInput
            value={pageState.search}
            type="text"
            placeholder={dropdownValue}
            customIcon={<SearchIcon />}
            aria-label="pipeline search"
            onChange={(_event, val: string) => handlePipelineSearch(val)}
          />
        </div>
        <Pagination
          itemCount={data?.totalCount || 0}
          perPage={pageState.perPage}
          page={pageState.page}
          onSetPage={handlePageSet}
          onPerPageSelect={handlePerPageSet}
        />
      </div>

      {/* If error from the pipeline list fetch */}
      {isError && (
        <Alert
          type="error"
          style={{ marginTop: "1em" }}
          message={(error as Error)?.message || "Error fetching pipelines"}
        />
      )}

      {/* Show pipeline list or loading or empty */}
      {isPipelinesLoading ? (
        <SpinContainer title="Fetching the Pipelines" />
      ) : data?.registeredPipelines && data.registeredPipelines.length > 0 ? (
        <Collapse
          style={{ marginTop: "1em" }}
          activeKey={expandedKeys}
          onChange={handleCollapseChange}
        >
          {data.registeredPipelines.map((pipeline) => {
            const pipelineId = String(pipeline.data.id);
            const name = pipeline.data.name;
            const description = pipeline.data.description || "";
            const isSelected = !!state.selectedPipeline?.[pipelineId];
            const isLoading = loadingResources[pipelineId];
            const errMsg = resourceError[pipelineId];

            return (
              <Collapse.Panel
                header={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div>
                      <div>{name}</div>
                      {description && (
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: isDarkTheme ? "#B8BBBE" : "#4F5255",
                          }}
                        >
                          {description}
                        </div>
                      )}
                    </div>
                    {/* "Select / Unselect" button */}
                    {isSelected ? (
                      <AntButton
                        danger
                        onClick={() => handleUnselectPipeline()}
                      >
                        Unselect
                      </AntButton>
                    ) : (
                      <AntButton onClick={() => handleSelectPipeline(pipeline)}>
                        Select
                      </AntButton>
                    )}
                  </div>
                }
                key={pipelineId}
              >
                {/* Panel content */}
                {errMsg ? (
                  <Alert type="error" message={errMsg} />
                ) : isLoading ? (
                  <SpinContainer title="Fetching resources for this pipeline..." />
                ) : isSelected ? (
                  <PipelinesComponent pipeline={pipeline} />
                ) : (
                  <Alert
                    type="info"
                    message="This pipeline is not selected yet."
                  />
                )}
              </Collapse.Panel>
            );
          })}
        </Collapse>
      ) : (
        <EmptyStateComponent title="No pipelines were found registered to this ChRIS instance." />
      )}
    </div>
  );
};

export default PipelinesCopy;
