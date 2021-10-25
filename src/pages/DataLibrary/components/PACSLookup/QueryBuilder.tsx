import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  ExpandableSection,
  Grid,
  GridItem,
  Split,
  SplitItem,
  TextInput,
  Button,
  DatePicker,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  Tooltip,
} from "@patternfly/react-core";

import { SearchIcon } from "@patternfly/react-icons";
import { PFDCMQuery, PFDCMQueryTypes } from ".";

import "./pacs-lookup.scss";
import { useHistory } from "react-router";
import { toPACSDate } from "../../../../api/pfdcm/pfdcm-utils";

interface QueryBuilderProps {
  PACS?: string;
  PACSservices?: string[];
  onSelectPACS?: (key: string) => void;
  onFinalize: (q: PFDCMQuery[]) => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  PACS,
  PACSservices,
  onSelectPACS,
  onFinalize,
}: QueryBuilderProps) => {
  const [query, setQuery] = useState<PFDCMQuery>({
    type: PFDCMQueryTypes.PMRN,
  } as PFDCMQuery);

  const setQueryType = (type: PFDCMQueryTypes) => {
    setQuery({ ...query, type } as PFDCMQuery);
  };

  const [toggleType, setToggleType] = useState(false);
  const onToggleType = () => setToggleType(!toggleType);

  const [togglePACSList, setTogglePACSList] = useState(false);
  const onTogglePACSList = () => setTogglePACSList(!togglePACSList);

  const [toggleAdvanced, setToggleAdvanced] = useState(false);
  const onToggleAdvanced = () => setToggleAdvanced(!toggleAdvanced);

  const handleInput = (value: any) => {
    setQuery({ ...query, value } as PFDCMQuery);
  };

  const handleFilter = (filters: any) => {
    setQuery({
      ...query,
      filters: { ...query.filters, ...filters },
    } as PFDCMQuery);
  };

  const { push: route, location } = useHistory();

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q");
    if (q) finalize(JSON.parse(atob(q)) as PFDCMQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finalize = (_query = query) => {
    if (_query === query)
      route(`${location.pathname}?q=${btoa(JSON.stringify(_query))}`);

    if (!_query.value)
      if (_query.filters)
        return onFinalize([
          {
            ..._query,
            value: String(),
            filters: _query.filters,
          },
        ]);
      else return;

    const csv = (_query.value as string).split(",");
    const queries: PFDCMQuery[] = [];

    for (const value of csv) {
      queries.push({
        value: value.trim(),
        type: _query.type,
        filters: _query.filters,
      });
    }
    onFinalize(queries);
  };

  const __queryType = (type: PFDCMQueryTypes) => {
    switch (type) {
      case PFDCMQueryTypes.PMRN:
        return "Patient MRN";
      case PFDCMQueryTypes.NAME:
        return "Patient Name";
      case PFDCMQueryTypes.ACCN:
        return "Accession Number";
    }
  };

  return (
    <Grid hasGutter id="pacs-query-builder">
      <GridItem>
        <Grid hasGutter>
          <GridItem lg={10} sm={12}>
            <Card isHoverable isRounded style={{ height: "100%" }}>
              <Split id="search">
                <SplitItem>
                  <Dropdown
                    id="search-type"
                    isOpen={toggleType}
                    onSelect={onToggleType}
                    toggle={
                      <DropdownToggle onToggle={onToggleType}>
                        <div style={{ textAlign: "left", padding: "0 0.5em" }}>
                          <div style={{ fontSize: "smaller", color: "gray" }}>
                            Search By
                          </div>
                          <div style={{ fontWeight: 600 }}>
                            {__queryType(query.type)}
                          </div>
                        </div>
                      </DropdownToggle>
                    }
                    dropdownItems={[
                      <DropdownItem
                        key="pmrn"
                        onClick={() => setQueryType(PFDCMQueryTypes.PMRN)}
                      >
                        By Patient ID or MRN
                      </DropdownItem>,
                      <DropdownItem
                        key="name"
                        onClick={() => setQueryType(PFDCMQueryTypes.NAME)}
                      >
                        By Patient Name
                      </DropdownItem>,
                      <DropdownItem
                        key="accn"
                        onClick={() => setQueryType(PFDCMQueryTypes.ACCN)}
                      >
                        By Accession Number
                      </DropdownItem>,
                    ]}
                  />
                </SplitItem>

                <SplitItem isFilled>
                  {(function () {
                    switch (query.type) {
                      case PFDCMQueryTypes.PMRN:
                        return (
                          <TextInput
                            type="text"
                            id="search-value"
                            placeholder="Patient ID or MRN"
                            onChange={handleInput}
                            onKeyDown={({ key }: { key: any }) => {
                              if (key.toLowerCase() === "enter") finalize();
                            }}
                          />
                        );

                      case PFDCMQueryTypes.NAME:
                        return (
                          <TextInput
                            type="text"
                            id="search-value"
                            placeholder="Patient Name"
                            onChange={(value: string) =>
                              handleInput(value.split(" ").reverse().join("^"))
                            }
                            onKeyDown={({ key }: { key: any }) => {
                              if (key.toLowerCase() === "enter") finalize();
                            }}
                          />
                        );

                      case PFDCMQueryTypes.ACCN:
                        return (
                          <TextInput
                            type="text"
                            id="search-value"
                            placeholder="Accession Number"
                            onChange={handleInput}
                            onKeyDown={({ key }: { key: any }) => {
                              if (key.toLowerCase() === "enter") finalize();
                            }}
                          />
                        );
                    }
                  })()}
                </SplitItem>

                {PACSservices && onSelectPACS && (
                  <SplitItem>
                    <Dropdown
                      id="pacs-service"
                      isOpen={togglePACSList}
                      onSelect={onTogglePACSList}
                      toggle={
                        <DropdownToggle onToggle={onTogglePACSList}>
                          {PACS ? (
                            <div
                              style={{ textAlign: "left", padding: "0 0.5em" }}
                            >
                              <div
                                style={{ fontSize: "smaller", color: "gray" }}
                              >
                                PACS Service
                              </div>
                              <div style={{ fontWeight: 600 }}>{PACS}</div>
                            </div>
                          ) : (
                            "PACS Service"
                          )}
                        </DropdownToggle>
                      }
                      dropdownItems={PACSservices.map((service) => (
                        <DropdownItem
                          key={`pacs-${service}`}
                          onClick={onSelectPACS.bind(QueryBuilder, service)}
                        >
                          {service}
                        </DropdownItem>
                      ))}
                    />
                  </SplitItem>
                )}
              </Split>
            </Card>
          </GridItem>

          <GridItem lg={2} sm={12}>
            {query.value ? (
              <Button
                isLarge
                variant="primary"
                id="finalize"
                onClick={() => finalize()}
              >
                <SearchIcon /> Search
              </Button>
            ) : (
              <Tooltip content="Please enter a search term">
                <Button isLarge variant="primary" id="finalize">
                  <SearchIcon /> Search
                </Button>
              </Tooltip>
            )}
          </GridItem>
        </Grid>
      </GridItem>

      <GridItem id="filters">
        <ExpandableSection
          toggleText="More Options"
          onToggle={onToggleAdvanced}
          isExpanded={toggleAdvanced}
        >
          <Card>
            <CardHeader>
              <Split>
                <SplitItem isFilled>
                  <b>Filters</b>
                </SplitItem>
                <SplitItem>
                  {/* <Button variant="link" onClick={() => setQuery({ ...query, filters: {} })}>
                    Clear
                  </Button> */}
                </SplitItem>
                <SplitItem>
                  <Button variant="secondary" onClick={() => finalize()}>
                    Apply
                  </Button>
                </SplitItem>
              </Split>
            </CardHeader>
            <CardBody>
              <Grid hasGutter>
                <GridItem lg={4} sm={12}>
                  Study Date
                  <br />
                  <DatePicker
                    placeholder="Study Date (yyyy-MM-dd)"
                    dateFormat={(date: any) => date.toDateString()}
                    onChange={(_: any, date: any) =>
                      handleFilter(
                        date && {
                          StudyDate: toPACSDate(date),
                        }
                      )
                    }
                    onKeyDown={({ key }: { key: any }) => {
                      if (key.toLowerCase() === "enter") finalize();
                    }}
                  />
                </GridItem>

                <GridItem lg={4} sm={12}>
                  Modality <br />
                  <TextInput
                    type="text"
                    onChange={(value: string) =>
                      handleFilter({ Modality: value })
                    }
                    placeholder="Eg: MR"
                    id="modality"
                  />
                </GridItem>

                <GridItem lg={4} sm={12}>
                  Station Title
                  <br />
                  <TextInput
                    type="text"
                    onChange={(value: string) =>
                      handleFilter({ PerformedStationAETitle: value })
                    }
                    placeholder="Eg: LILA"
                    id="station"
                  />
                </GridItem>

                <GridItem lg={4} sm={12}>
                  Patient Birth Date
                  <br />
                  <DatePicker
                    placeholder="Birth Date (yyyy-MM-dd)"
                    dateFormat={(date: Date) => date.toDateString()}
                    onChange={(_: any, date?: Date) =>
                      handleFilter(
                        date && {
                          PatientBirthDate: toPACSDate(date),
                        }
                      )
                    }
                    onKeyDown={({ key }: { key: any }) => {
                      if (key.toLowerCase() === "enter") finalize();
                    }}
                  />
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </ExpandableSection>
      </GridItem>
    </Grid>
  );
};

export default QueryBuilder;
