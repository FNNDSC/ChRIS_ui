import React, { useCallback, useContext, useEffect } from "react";
import {
  Button,
  DataList,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListItemCells,
  DataListToggle,
  Pagination,
  DataListAction,
  DataListContent,
  WizardContext,
  TextInput,
  Dropdown,
  DropdownItem,
  MenuToggle,
  DropdownList,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { ErrorAlert } from "../Common";
import type { Pipeline } from "@fnndsc/chrisapi";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";

import {
  Tree,
  ConfigurationPage,
  UploadJson,
  GeneralCompute,
} from "../Pipelines/";
import { SpinContainer } from "../Common";
import {
  catchError,
  fetchComputeInfo,
  fetchPipelines,
  generatePipelineWithName,
} from "../../api/common";
import type { PipelinesProps } from "./types/pipeline";
import { Alert } from "antd";

export const PIPELINEQueryTypes = {
  NAME: ["Name", "Match plugin name containing this string"],
  ID: ["Id", "Match plugin id exactly with this number"],
  OWNER_USERNAME: [
    "Owner_Username",
    "Match pipeline's owner username exactly with this string",
  ],
  CATEGORY: ["Category", "Match plugin category containing this string"],
  DESCRIPTION: [
    "Description",
    "Match plugin description containing this string",
  ],
  AUTHORS: ["Authors", "Match plugin authors containing this string"],
  MIN_CREATION_DATE: [
    "Min_creation_date",
    "Match plugin creation date greater than this date",
  ],
  MAX_CREATION_DATE: [
    "Max_creation_date",
    "Match plugin creation date lte this date",
  ],
};
const Pipelines = ({
  justDisplay,
  state,
  handleDispatchPipelines,
  handleSetPipelineResources,
  handleUploadDispatch,
  handleSetCurrentNode,
  handleCleanResources,
  handlePipelineSecondaryResource,
  handleSetPipelineEnvironments,
  handleSetCurrentNodeTitle,
  handleSetGeneralCompute,
  handleSetCurrentComputeEnv,
  handleFormParameters,
}: PipelinesProps) => {
  const { pipelineData, selectedPipeline, pipelines } = state;
  const [errors, setErrors] = React.useState({});
  const { goToNextStep: onNext, goToPrevStep: onBack } =
    useContext(WizardContext);

  const [pageState, setPageState] = React.useState({
    page: 1,
    perPage: 10,
    search: "",
    itemCount: 0,
  });

  const [expanded, setExpanded] = React.useState<{ [key: string]: boolean }>();
  const [pipeline, setPipeline] = React.useState<Pipeline>();
  const { page, perPage, search } = pageState;
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [dropdownValue, setDropdownValue] = React.useState<string>(
    PIPELINEQueryTypes.NAME[0],
  );

  const handleDispatchWrap = React.useCallback(
    (registeredPipelines: any) => {
      handleDispatchPipelines(registeredPipelines);
    },
    [handleDispatchPipelines],
  );

  const handlePipelineSearch = (search: string) => {
    setPageState({
      ...pageState,
      search,
    });
  };

  const { isLoading, isError, error } = useQuery({
    queryKey: ["pipelines", perPage, page, search, dropdownValue],
    queryFn: async () => {
      const data = await fetchPipelines(
        perPage,
        page,
        search,
        dropdownValue.toLowerCase(),
      );

      const { registeredPipelines, registeredPipelinesList, error } = data;

      if (registeredPipelines) {
        handleDispatchWrap(registeredPipelines);
      }

      if (registeredPipelinesList) {
        setPageState((pageState) => {
          return {
            ...pageState,
            itemCount: registeredPipelinesList.totalCount,
          };
        });
      }

      if (error.error_message) {
        throw new Error(error.error_message);
      }
      return data;
    },
    enabled: true,
    refetchOnMount: true,
  });

  const {
    isLoading: isResourcesLoading,
    isError: isResourceError,
    error: resourceError,
  } = useQuery({
    queryKey: ["pipelineresources", pipeline],
    queryFn: async () => {
      if (pipeline) {
        try {
          const { resources } = await generatePipelineWithName(
            pipeline.data.name,
          );

          handleSetPipelineResources({
            ...resources,
            pipelineId: pipeline.data.id,
          });
          const { pluginPipings } = resources;

          for (let i = 0; i < pluginPipings.length; i++) {
            const piping = pluginPipings[i];
            const computeEnvData = await fetchComputeInfo(
              piping.data.plugin_id,
              piping.data.id,
            );

            if (computeEnvData) {
              handleSetPipelineEnvironments(pipeline.data.id, computeEnvData);
            }
          }
          return resources;
        } catch (error: any) {
          const errObj = catchError(error);
          throw new Error(errObj.error_message);
        }
      }
    },
    enabled: !!pipeline,
  });

  React.useEffect(() => {
    const el = document.querySelector(".react-json-view");

    if (el) {
      //@ts-ignore
      el!.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  const handleNodeClick = async (nodeName: number, pipelineId: number) => {
    handleSetCurrentNode(pipelineId, nodeName);
  };

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

  const handleOnButtonClick = useCallback(
    async (pipeline: Pipeline) => {
      if (!(selectedPipeline === pipeline.data.id)) {
        handlePipelineSecondaryResource(pipeline);
        if (!pipelineData[pipeline.data.id]) {
          setPipeline(pipeline);
        }
      } else {
        setPipeline(undefined);
        handleCleanResources();
      }
    },
    [
      handleCleanResources,
      handlePipelineSecondaryResource,
      pipelineData,
      selectedPipeline,
    ],
  );

  const handleOnExpand = useCallback(
    async (pipeline: Pipeline) => {
      if (!(selectedPipeline === pipeline.data.id)) {
        handlePipelineSecondaryResource(pipeline);
      } else {
        handleCleanResources();
      }
      //Not already expanded or not previous fetched and cached in state
      if (
        !(expanded && expanded[pipeline.data.id]) ||
        !state.pipelineData[pipeline.data.id]
      ) {
        setPipeline(pipeline);
        setExpanded({
          ...expanded,
          [pipeline.data.id]: true,
        });
      } else {
        setPipeline(undefined);
        setExpanded({
          ...expanded,
          [pipeline.data.id]: false,
        });
      }
    },
    [
      expanded,
      handleCleanResources,
      handlePipelineSecondaryResource,
      selectedPipeline,
      state.pipelineData,
    ],
  );

  const handleKeyDown = useCallback(
    (e: any, pipeline: Pipeline) => {
      if (e.code == "Enter" && e.target.closest("DIV.pf-c-data-list__toggle")) {
        e.preventDefaut();
        handleOnExpand(pipeline);
      }
    },
    [handleOnExpand],
  );

  const handleBrowserKeyDown = useCallback(
    (e: any) => {
      if (e.code == "ArrowLeft") {
        onBack();
      } else if (e.code == "ArrowRight") {
        onNext();
      }
    },
    [onBack, onNext],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleBrowserKeyDown);
    return () => {
      window.removeEventListener("keydown", handleBrowserKeyDown);
    };
  }, [handleBrowserKeyDown]);

  const onToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onFocus = () => {
    const element = document.getElementById("toggle-basic");
    element?.focus();
  };

  const onSelect = () => {
    setIsDropdownOpen(false);
    onFocus();
  };

  const updateDropdownValue = (type: string) => {
    setDropdownValue(type);
    handlePipelineSearch("");
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

  return (
    <>
      <UploadJson handleDispatch={handleUploadDispatch} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0.8rem 0rem",
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
              handlePipelineSearch && handlePipelineSearch(value.toLowerCase());
            }}
          />
        </div>
        <Pagination
          itemCount={pageState.itemCount}
          perPage={pageState.perPage}
          page={pageState.page}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
        />
      </div>

      <DataList aria-label="pipeline list">
        {isError && (
          <Alert type="error" description={<div>{error.message}</div>} />
        )}

        {isLoading ? (
          <SpinContainer title="Fetching Pipelines" />
        ) : (
          pipelines.length > 0 &&
          pipelines.map((pipeline: any) => {
            return (
              <DataListItem
                isExpanded={
                  expanded && expanded[pipeline.data.id] ? true : false
                }
                key={pipeline.data.id}
              >
                <DataListItemRow>
                  <DataListToggle
                    id={pipeline.data.id}
                    aria-controls="expand"
                    onKeyDown={(e) => handleKeyDown(e, pipeline)}
                    onClick={() => handleOnExpand(pipeline)}
                  />
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key={pipeline.data.name}>
                        <div
                          className="plugin-table-row"
                          key={pipeline.data.name}
                        >
                          <span className="plugin-table-row__plugin-name">
                            {pipeline.data.name}
                          </span>
                          <span
                            className="plugin-table-row__plugin-description"
                            id={`${pipeline.data.description}`}
                          >
                            <em>{pipeline.data.description}</em>
                          </span>
                        </div>
                      </DataListCell>,
                    ]}
                  />
                  <DataListAction
                    aria-labelledby="select a pipeline"
                    id={pipeline.data.id}
                    aria-label="actions"
                    className="pipelines"
                  >
                    {!justDisplay && (
                      <Button
                        variant="primary"
                        key="select-action"
                        onClick={() => handleOnButtonClick(pipeline)}
                      >
                        {selectedPipeline === pipeline.data.id
                          ? "Deselect"
                          : "Select"}
                      </Button>
                    )}

                    <Button
                      key="delete-action"
                      onClick={async () => {
                        try {
                          await pipeline.delete();
                          const filteredPipelines = pipelines.filter(
                            (currentPipeline: any) => {
                              return (
                                currentPipeline.data.id !== pipeline.data.id
                              );
                            },
                          );
                          handleDispatchPipelines(filteredPipelines);
                        } catch (error) {
                          const err = catchError(error);
                          setErrors(err);
                        }
                      }}
                      variant="danger"
                    >
                      Delete
                    </Button>
                  </DataListAction>
                </DataListItemRow>
                <DataListContent
                  id={pipeline.data.id}
                  aria-label="PrimaryContent"
                  isHidden={!(expanded && expanded[pipeline.data.id])}
                >
                  {((expanded && expanded[pipeline.data.id]) ||
                    state.pipelineData[pipeline.data.id]) &&
                  !isResourcesLoading &&
                  !isResourceError ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Tree
                          state={state.pipelineData[pipeline.data.id]}
                          currentPipelineId={pipeline.data.id}
                          handleNodeClick={handleNodeClick}
                          handleSetCurrentNode={handleSetCurrentNode}
                          handleSetPipelineEnvironments={
                            handleSetPipelineEnvironments
                          }
                          handleSetCurrentNodeTitle={handleSetCurrentNodeTitle}
                        />
                        <GeneralCompute
                          handleSetGeneralCompute={handleSetGeneralCompute}
                          currentPipelineId={pipeline.data.id}
                        />
                      </div>

                      <ConfigurationPage
                        justDisplay={justDisplay}
                        pipelines={pipelines}
                        pipeline={pipeline}
                        currentPipelineId={pipeline.data.id}
                        state={state.pipelineData[pipeline.data.id]}
                        handleSetCurrentNodeTitle={handleSetCurrentNodeTitle}
                        handleDispatchPipelines={handleDispatchPipelines}
                        handleSetCurrentComputeEnv={handleSetCurrentComputeEnv}
                        handleFormParameters={handleFormParameters}
                      />
                    </>
                  ) : (
                    <SpinContainer title="Fetching Pipeline Resources" />
                  )}
                </DataListContent>
              </DataListItem>
            );
          })
        )}
      </DataList>
      <div id="error">
        {Object.keys(errors).length > 0 && (
          <ErrorAlert errors={errors} cleanUpErrors={() => setErrors({})} />
        )}

        {isResourceError && (
          <Alert type="error" description={resourceError.message} />
        )}
      </div>
    </>
  );
};

export default Pipelines;
