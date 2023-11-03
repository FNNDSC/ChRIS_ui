import * as React from "react";
import {
  Card,
  Grid,
  GridItem,
  Split,
  SplitItem,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  TextInput,
  Button,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import { PFDCMQuery, PFDCMQueryTypes } from "./types";

interface QueryBuilderProps {
  selectedPacs?: string;
  pacsServices?: string[];
  onSelectPacs?: (key: string) => void;
  onFinalize: (q: PFDCMQuery[]) => void;
}

const QueryBuilder = (props: QueryBuilderProps) => {
  const { selectedPacs, pacsServices, onSelectPacs, onFinalize } = props;

  const [toggleType, setToggleType] = React.useState(false);
  const [togglePacsList, setTogglePacsList] = React.useState(false);
  const [query, setQuery] = React.useState<PFDCMQuery>({
    type: PFDCMQueryTypes.pmrn,
  } as PFDCMQuery);

  const onToggleType = () => setToggleType(!toggleType);
  const onTogglePacsList = () => setTogglePacsList(!togglePacsList);

  const setQueryType = (type: PFDCMQueryTypes) => {
    setQuery({ ...query, type } as PFDCMQuery);
  };

  const handleInput = (value: string) => {
    setQuery({ ...query, value } as PFDCMQuery);
  };

  const __queryType = (type: PFDCMQueryTypes) => {
    switch (type) {
      case PFDCMQueryTypes.pmrn:
        return "Patient MRN";
      case PFDCMQueryTypes.name:
        return "Patient Name";
      case PFDCMQueryTypes.accession_number:
        return "Accession Number";
    }
  };

  const finalize = (_query = query) => {
    const queries: PFDCMQuery[] = [];

    const csv = _query.value.split(",");

    for (const value of csv) {
      queries.push({
        value: value.trim(),
        type: _query.type,
        filters: _query.filters,
      });
    }
    onFinalize(queries);
  };

  const getTextInput = (type: PFDCMQueryTypes) => {
    return (
      <TextInput
        aria-label="search"
        customIcon={<SearchIcon />}
        placeholder={__queryType(type)}
        onChange={(_event, value) => {
          if (type === 1) {
            handleInput(value.split(" ").reverse().join("^"));
          }
          handleInput(value);
        }}
        onKeyDown={({ key }) => {
          if (key.toLowerCase() === "enter") finalize();
        }}
      ></TextInput>
    );
  };

  return (
    <Grid>
      <GridItem>
        <Grid hasGutter>
          <GridItem lg={10} sm={12}>
            <Card isSelectable isRounded style={{ height: "100%" }}>
              <Split id="search">
                <SplitItem>
                  <Dropdown
                    id="search-type"
                    isOpen={toggleType}
                    onSelect={onToggleType}
                    toggle={(toggleRef) => {
                      return (
                        <MenuToggle ref={toggleRef} onClick={onToggleType}>
                          {__queryType(query.type)}
                        </MenuToggle>
                      );
                    }}
                  >
                    <DropdownList>
                      <DropdownItem
                        key="pmrn"
                        onClick={() => setQueryType(PFDCMQueryTypes.pmrn)}
                      >
                        By Patient ID or MRN
                      </DropdownItem>

                      <DropdownItem
                        key="name"
                        onClick={() => setQueryType(PFDCMQueryTypes.name)}
                      >
                        By Patient Name
                      </DropdownItem>

                      <DropdownItem
                        key="accession_number"
                        onClick={() =>
                          setQueryType(PFDCMQueryTypes.accession_number)
                        }
                      >
                        By Accession Number
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </SplitItem>
                <SplitItem isFilled>{getTextInput(query.type)}</SplitItem>
                <SplitItem>
                  <Dropdown
                    id="pacs-service"
                    isOpen={togglePacsList}
                    onSelect={onTogglePacsList}
                    toggle={(toggleRef) => {
                      return (
                        <MenuToggle ref={toggleRef} onClick={onTogglePacsList}>
                          {selectedPacs ? (
                            <div style={{ fontWeight: 600 }}>
                              {selectedPacs}
                            </div>
                          ) : (
                            <div style={{ fontWeight: 600 }}>
                              {pacsServices ? pacsServices[0] : ""}
                            </div>
                          )}
                        </MenuToggle>
                      );
                    }}
                  >
                    <DropdownList>
                      {pacsServices &&
                        pacsServices.map((service) => {
                          return (
                            <DropdownItem
                              onClick={() => {
                                onSelectPacs && onSelectPacs(service);
                              }}
                              key={`pacs-${service}`}
                            >
                              {service}
                            </DropdownItem>
                          );
                        })}
                    </DropdownList>
                  </Dropdown>
                </SplitItem>
                <SplitItem>
                  <Button
                    icon={<SearchIcon />}
                    variant="primary"
                    onClick={() => {
                      query.value && finalize();
                    }}
                  >
                    Search
                  </Button>
                </SplitItem>
              </Split>
            </Card>
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};

export default QueryBuilder;
