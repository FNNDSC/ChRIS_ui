import React, { useCallback, useState } from 'react'
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

import { SearchIcon } from '@patternfly/react-icons';
import { PFDCMQuery, PFDCMQueryTypes } from '.';

import "./pacs-lookup.scss"

interface QueryBuilderProps {
  onFinalize: (q:PFDCMQuery) => void
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ onFinalize }: QueryBuilderProps) => {
  const [query, setQuery] = useState({ type: PFDCMQueryTypes.MRN } as PFDCMQuery);
  const setQueryType = (type: PFDCMQueryTypes) => {
    setQuery({ type } as PFDCMQuery);
  }

  const [toggleType, setToggleType] = useState(false);
  const onToggleType = () => setToggleType(!toggleType);

  const [toggleAdvanced, setToggleAdvanced] = useState(false);
  const onToggleAdvanced = () => setToggleAdvanced(!toggleAdvanced);

  const handleInput = (value: string) => {
    setQuery({ ...query, value } as PFDCMQuery);
  }

  const handleFilter = (filters: any) => {
    setQuery({ ...query, filters } as PFDCMQuery);
  }

  const finalize = () => {
    if (query.value && query.value !== "")
      onFinalize(query)
    else
      return Error()
  }
  
  return (
    <Grid hasGutter id="pacs-query-builder">
      <GridItem>
        <Grid hasGutter>
          <GridItem lg={10} sm={12}>
            <Card style={{ height: "100%" }}>
            <Split id="search">
              <SplitItem>
                <Dropdown id="search-type"
                  isOpen={toggleType}
                  onSelect={onToggleType}
                  toggle={
                    <DropdownToggle onToggle={onToggleType}>
                      Search By
                    </DropdownToggle>
                  }
                  dropdownItems={[
                    <DropdownItem key="pmrn" onClick={() => setQueryType(PFDCMQueryTypes.MRN)}>By Patient ID or MRN</DropdownItem>,
                    <DropdownItem key="name" onClick={() => setQueryType(PFDCMQueryTypes.PATIENT)}>By Patient Name</DropdownItem>,
                    <DropdownItem key="date" onClick={() => setQueryType(PFDCMQueryTypes.DATE)}>By Study Date</DropdownItem>
                  ]}
                />
              </SplitItem>

              <SplitItem isFilled>
                {
                  function () {
                    switch (query.type) {
                      case PFDCMQueryTypes.DATE:
                        return <DatePicker id="search-value" placeholder="Study Date (yyyy-MM-dd)" />

                      case PFDCMQueryTypes.PATIENT:
                        return <TextInput type="text" id="search-value" 
                          placeholder="Patient Name" 
                          onChange={handleInput} 
                        />

                      case PFDCMQueryTypes.MRN:
                        return <TextInput type="text" id="search-value" 
                          placeholder="Patient ID or MRN" 
                          onChange={handleInput} 
                        />
                    }
                  }()
                }
              </SplitItem>
            </Split>
            </Card>
          </GridItem>

          <GridItem lg={2} sm={12}>
            <Button isLarge variant="primary" id="finalize" onClick={finalize}>
              <SearchIcon/> Search
            </Button>
          </GridItem>
        </Grid>
      </GridItem>

      <GridItem id="filters">
        <ExpandableSection
          toggleText="More Lookup Options"
          onToggle={onToggleAdvanced}
          isExpanded={toggleAdvanced}
        >
          <Card>
            <CardHeader>
              <Split>
                <SplitItem isFilled><b>Basic Filters</b></SplitItem>
                <SplitItem>
                  <Button variant="link" onClick={finalize}>Clear</Button>
                </SplitItem>
                <SplitItem>
                  <Button variant="secondary" onClick={finalize}>Apply</Button>
                </SplitItem>
              </Split>
            </CardHeader>
            <CardBody>
              <Grid hasGutter>
                <GridItem lg={4} sm={12}>
                  Modality <br />
                  <TextInput type="text" onChange={handleFilter} placeholder="Eg: AR, AU, BDUS" id="modality" />
                </GridItem>

                <GridItem lg={4} sm={12}>
                  Station <br />
                  <TextInput type="text" onChange={handleFilter} placeholder="Eg: LILA" id="station" />
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </ExpandableSection>
      </GridItem>
    </Grid>
  )
}

export default QueryBuilder
