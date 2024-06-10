import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Grid,
  GridItem,
  MenuToggle,
  PageSection,
  Split,
  SplitItem,
  TextInput,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import { Alert } from "antd";
import * as React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { pluralize } from "../../api/common";
import { setSidebarActive } from "../../store/ui/actions";
import { EmptyStateComponent, SpinContainer } from "../Common";
import WrapperConnect from "../Wrapper";
import PatientCard from "./components/PatientCard";
import { PacsQueryContext, PacsQueryProvider, Types } from "./context";
import "./pacs-copy.css";
import PfdcmClient from "./pfdcmClient";

const dropdownMatch: { [key: string]: string } = {
  PatientID: "Patient MRN",
  PatientName: "Patient Name",
  AccessionNumber: "Accession Number",
};

const PacsCopy = () => {
  const dispatch = useDispatch();
  document.title = "Data Library";
  React.useEffect(() => {
    document.title = "My Library";
    dispatch(
      setSidebarActive({
        activeItem: "pacs",
      }),
    );
  }, [dispatch]);

  return (
    <WrapperConnect>
      <PageSection>
        <PacsQueryProvider>
          <QueryBuilder />
          <Results />
        </PacsQueryProvider>
      </PageSection>
    </WrapperConnect>
  );
};

export default PacsCopy;

const client = new PfdcmClient();
const actions = ["Patient MRN", "Patient Name", "Accession Number"];

const QueryBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { state, dispatch } = React.useContext(PacsQueryContext);
  const [queryOpen, setQueryOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [pacsListOpen, setPacsListOpen] = React.useState(false);
  const [errorState, setErrorState] = React.useState("");

  const { pacsServices, selectedPacsService, currentQueryType, queryResult } =
    state;

  const service = searchParams.get("service");
  const queryType = searchParams.get("queryType");

  const handleSubmitQuery = React.useCallback(
    async (
      navigateToDifferentRoute: boolean,
      currentQueryType: string,
      value: string,
      selectedPacsService = "default",
    ) => {
      if (value.length > 0 && currentQueryType) {
        const csv = value.trim().split(/[,\s]+/);

        dispatch({
          type: Types.SET_LOADING_SPINNER,
          payload: {
            status: true,
            text: `Fetching ${csv.length} ${pluralize("result", csv.length)} `,
          },
        });

        const responses = [];
        for (const value of csv) {
          try {
            const response = await client.find(
              {
                [currentQueryType]: value.trimStart().trimEnd(),
              },
              selectedPacsService,
            );

            response && responses.push(response);

            dispatch({
              type: Types.SET_LOADING_SPINNER,
              payload: {
                status: true,
                text: `Completed ${responses.length} of ${csv.length} searches`,
              },
            });
          } catch (error: any) {
            setErrorState(error.message);
            dispatch({
              type: Types.SET_LOADING_SPINNER,
              payload: {
                status: true,
                text: `Completed ${responses.length} of ${csv.length} searches. Found an error for value ${value}`,
              },
            });
          }
        }

        if (responses.length > 0) {
          dispatch({
            type: Types.SET_SEARCH_RESULT,
            payload: {
              queryResult: responses,
            },
          });
        }

        dispatch({
          type: Types.SET_LOADING_SPINNER,
          payload: {
            status: false,
            text: "Search Complete",
          },
        });

        if (navigateToDifferentRoute) {
          navigate(
            `/pacs?queryType=${currentQueryType}&value=${value}&service=${selectedPacsService}`,
          );
        }
      } else {
        setErrorState(
          "Please ensure PACS service, Search Value, and the Query Type are all selected.",
        );
      }
    },
    [dispatch, navigate],
  );

  React.useEffect(() => {
    client
      .getPacsServices()
      .then((list) => {
        if (list) {
          dispatch({
            type: Types.SET_LIST_PACS_SERVICES,
            payload: {
              pacsServices: list,
            },
          });

          // This is just for production instances where PACSDCM is the default service always.
          const findIndex = list.findIndex(
            (listItem: string) => listItem === "PACSDCM",
          );

          if (!service) {
            dispatch({
              type: Types.SET_SELECTED_PACS_SERVICE,
              payload: {
                selectedPacsService: findIndex >= 1 ? list[findIndex] : list[0],
              },
            });
          }
        }
      })
      .catch((error: any) => {
        setErrorState(error.message);
      });
  }, [dispatch, service]);

  React.useEffect(() => {
    const searchValue = searchParams.get("value");

    if (queryResult.length === 0 && queryType && searchValue && service) {
      dispatch({
        type: Types.SET_SELECTED_PACS_SERVICE,
        payload: {
          selectedPacsService: service,
        },
      });

      queryResult.length < 2 &&
        dispatch({
          type: Types.SET_DEFAULT_EXPANDED,
          payload: {
            expanded: true,
          },
        });

      dispatch({
        type: Types.SET_CURRENT_QUERY_TYPE,
        payload: {
          currentQueryType: queryType,
        },
      });

      handleSubmitQuery(false, queryType, searchValue, service);
      setValue(searchValue);
    }
  }, [
    queryResult,
    queryType,
    dispatch,
    handleSubmitQuery,
    searchParams,
    service,
  ]);

  const onToggle = () => {
    setQueryOpen(!queryOpen);
  };

  const onTogglePacsList = () => {
    setPacsListOpen(!pacsListOpen);
  };

  const queryBy = (action: string) => {
    onToggle();
    switch (action) {
      case "Patient MRN": {
        dispatch({
          type: Types.SET_CURRENT_QUERY_TYPE,
          payload: {
            currentQueryType: "PatientID",
          },
        });
        break;
      }
      case "Patient Name": {
        dispatch({
          type: Types.SET_CURRENT_QUERY_TYPE,
          payload: {
            currentQueryType: "PatientName",
          },
        });
        break;
      }

      case "Accession Number": {
        dispatch({
          type: Types.SET_CURRENT_QUERY_TYPE,
          payload: {
            currentQueryType: "AccessionNumber",
          },
        });
        break;
      }
      default:
        return;
    }
  };

  return (
    <Grid hasGutter id="pacs-query-builder">
      <GridItem lg={12}>
        <Split id="search" style={{ width: "100%" }}>
          <SplitItem>
            <Dropdown
              isOpen={queryOpen}
              id="query type"
              aria-label="query type"
              toggle={(toggleRef) => {
                return (
                  <MenuToggle onClick={onToggle} ref={toggleRef}>
                    <div style={{ fontWeight: 600 }}>
                      {currentQueryType
                        ? dropdownMatch[currentQueryType]
                        : "Query By"}
                    </div>
                  </MenuToggle>
                );
              }}
            >
              <DropdownList>
                {actions.map((action) => {
                  return (
                    <DropdownItem onClick={() => queryBy(action)} key={action}>
                      {action}
                    </DropdownItem>
                  );
                })}
              </DropdownList>
            </Dropdown>
          </SplitItem>
          <SplitItem isFilled>
            <TextInput
              customIcon={<SearchIcon />}
              value={value}
              aria-label="Query"
              onKeyDown={(e) => {
                e.key === "Enter" &&
                  handleSubmitQuery(
                    true,
                    currentQueryType,
                    value,
                    selectedPacsService,
                  );
              }}
              onChange={(_event, value) => setValue(value)}
            />
          </SplitItem>
          <SplitItem>
            <Dropdown
              isOpen={pacsListOpen}
              id="pacs list"
              aria-label="pacs list"
              toggle={(toggleRef) => {
                return (
                  <MenuToggle onClick={onTogglePacsList} ref={toggleRef}>
                    <div>
                      {selectedPacsService
                        ? selectedPacsService
                        : "Select a PACS Service"}
                    </div>
                  </MenuToggle>
                );
              }}
            >
              <DropdownList>
                {pacsServices ? (
                  pacsServices.map((service: string) => {
                    return (
                      <DropdownItem
                        key={service}
                        isActive={selectedPacsService === service}
                        onClick={() => {
                          dispatch({
                            type: Types.SET_SELECTED_PACS_SERVICE,
                            payload: {
                              selectedPacsService: service,
                            },
                          });
                          onTogglePacsList();
                        }}
                      >
                        {service}
                      </DropdownItem>
                    );
                  })
                ) : (
                  <DropdownItem>No service available</DropdownItem>
                )}
              </DropdownList>
            </Dropdown>
          </SplitItem>
          <SplitItem
            style={{
              marginLeft: "1em",
            }}
          >
            <Button
              onClick={() => {
                handleSubmitQuery(
                  true,
                  currentQueryType,
                  value,
                  selectedPacsService,
                );
              }}
            >
              Search
            </Button>
          </SplitItem>
        </Split>
      </GridItem>
      {errorState && (
        <GridItem lg={12}>
          <Alert
            onClose={() => {
              setErrorState("");
            }}
            closable
            type="error"
            description={errorState}
          />
        </GridItem>
      )}
    </Grid>
  );
};

const Results = () => {
  const { state } = React.useContext(PacsQueryContext);

  const { queryResult, fetchingResults } = state;

  return (
    <>
      {fetchingResults.status && <SpinContainer title={fetchingResults.text} />}
      {queryResult.length > 0 ? (
        queryResult.map((result: any, index: any) => {
          if (result && result.data.length > 0) {
            return (
              <div key={`result_${index}`} className="result-grid">
                <PatientCard queryResult={result.data} />
              </div>
            );
          }
          return (
            <EmptyStateComponent
              key={`result${index}`}
              title={`No results found for ${result.args.PatientID} ${result.args.PatientName} ${result.args.AccessionNumber}`}
            />
          );
        })
      ) : (
        <EmptyStateComponent />
      )}
    </>
  );
};
