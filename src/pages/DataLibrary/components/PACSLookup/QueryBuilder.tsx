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

  const handlePatientInput = useCallback(
    (value: string, event: React.FormEvent<HTMLInputElement>) => {
      setQuery({
        ...query,
        value: {
          [event.currentTarget.id]: value
        }
      } as PFDCMQuery)
    }, [query])

  const handleFilterInput = () => {
    return
  }

  const finalize = () => {
    if (query)
      onFinalize(query)
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
                          onChange={handlePatientInput} 
                        />

                      case PFDCMQueryTypes.MRN:
                        return <TextInput type="text" id="search-value" 
                          placeholder="Patient ID or MRN" 
                          onChange={handlePatientInput} 
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
          toggleText="Filters and More Options"
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
                  <TextInput type="text" onChange={handleFilterInput} placeholder="Eg: AR, AU, BDUS" id="modality" />
                </GridItem>

                <GridItem lg={4} sm={12}>
                  Station <br />
                  <TextInput type="text" onChange={handleFilterInput} placeholder="Eg: LILA" id="station" />
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
