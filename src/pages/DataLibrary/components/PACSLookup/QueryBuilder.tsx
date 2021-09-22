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
} from "@patternfly/react-core";

import { SearchIcon } from "@patternfly/react-icons";
import { PFDCMQuery, PFDCMQueryTypes } from ".";

import "./pacs-lookup.scss";
import { useHistory } from "react-router";

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
  const [query, setQuery] = useState({
    type: PFDCMQueryTypes.IMRN,
  } as PFDCMQuery);

  const setQueryType = (type: PFDCMQueryTypes) => {
    setQuery({ type } as PFDCMQuery);
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
      filters: { ...query.filters, filters },
    } as PFDCMQuery);
  };

  const { push:route, location } = useHistory();

  useEffect(() => {
    const q = (new URLSearchParams(location.search)).get('q');
    if (q)
      finalize(JSON.parse(atob(q)) as PFDCMQuery)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finalize = (_query = query) => {
    if (!_query.value && _query.filters === {}) return;

    const csv = (_query.value as string).split(",");
    const queries: PFDCMQuery[] = [];

    for (const value of csv) {
      queries.push({
        value: value.trim(),
        type: _query.type,
        filters: _query.filters,
      });
    }

    if (_query === query)
      route(`${location.pathname}?q=${btoa(JSON.stringify(_query))}`)
    onFinalize(queries);
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
                        Search By
                      </DropdownToggle>
                    }
                    dropdownItems={[
                      <DropdownItem
                        key="pmrn"
                        onClick={() => setQueryType(PFDCMQueryTypes.IMRN)}
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
                        key="date"
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
                      case PFDCMQueryTypes.IMRN:
                        return (
                          <TextInput
                            type="text"
                            id="search-value"
                            placeholder="Patient ID or MRN"
                            onChange={handleInput}
                            onKeyDown={({ key }) => {
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
                            onChange={(value) =>
                              handleInput(value.split(" ").reverse().join("^"))
                            }
                            onKeyDown={({ key }) => {
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
                            onKeyDown={({ key }) => {
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
                              style={{ textAlign: "left", padding: "auto 1em" }}
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
            <Button
              isLarge
              variant="primary"
              id="finalize"
              onClick={() => finalize()}
            >
              <SearchIcon /> Search
            </Button>
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
                  <Button variant="link" onClick={() => finalize()}>
                    Clear
                  </Button>
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
                    dateFormat={(date) => date.toDateString()}
                    onChange={(_, date) =>
                      handleFilter({
                        StudyDate: `${date?.getFullYear()}${date?.getMonth()}${date?.getDate()}`,
                      })
                    }
                    onKeyDown={({ key }) => {
                      if (key.toLowerCase() === "enter") finalize();
                    }}
                  />
                </GridItem>

                <GridItem lg={4} sm={12}>
                  Modality <br />
                  <TextInput
                    type="text"
                    onChange={(value) => handleFilter({ Modality: value })}
                    placeholder="Eg: MR"
                    id="modality"
                  />
                </GridItem>

                <GridItem lg={4} sm={12}>
                  Station Title
                  <br />
                  <TextInput
                    type="text"
                    onChange={(value) =>
                      handleFilter({ PerformedStationAETitle: value })
                    }
                    placeholder="Eg: LILA"
                    id="station"
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
