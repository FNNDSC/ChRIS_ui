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
} from "@patternfly/react-core";

import { PFDCMQuery, PFDCMQueryTypes } from '.';
import { SearchIcon } from '@patternfly/react-icons';

interface QueryBuilderProps {
  onFinalize: (q:PFDCMQuery) => void
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ onFinalize }: QueryBuilderProps) => {
  const [query, setQuery] = useState({ type: PFDCMQueryTypes.PATIENT } as PFDCMQuery);

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

  const finalize = () => {
    if (query)
      onFinalize(query)
  }

  const PatInputProps = {
    type: "text" as const,
    onChange: handlePatientInput
  }
  
  return (
    <Grid hasGutter>
      <GridItem>
        <Card>
          <CardHeader><b>Patient Lookup</b></CardHeader>
          <CardBody>
            <Grid hasGutter>
              <GridItem><TextInput {...PatInputProps} placeholder="Patient MRN" id="mrn" /></GridItem>
              <GridItem><TextInput {...PatInputProps} placeholder="Patient Name" id="name" /></GridItem>
            </Grid>
          </CardBody>
        </Card>
      </GridItem>

      <GridItem>
        <ExpandableSection
          toggleText="Filters and Constraints"
          onToggle={onToggleAdvanced}
          isExpanded={toggleAdvanced}
        >
          <Card>
            <CardHeader><b>Filters and Constraints</b></CardHeader>
            <CardBody>
              <Grid hasGutter>
                <GridItem lg={4} sm={12}>
                  Modality <br />
                  <TextInput type="text" placeholder="Eg: AR, AU, BDUS" id="modality" />
                </GridItem>

                <GridItem lg={8} sm={12}>
                  Study Date <br />
                  <DatePicker/>
                </GridItem>

                <GridItem lg={4} sm={12}>
                  Station AE Title <br />
                  <TextInput type="text" placeholder="MRI No. 2" id="station" />
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </ExpandableSection>
      </GridItem>

      <GridItem>
        <Split>
          <SplitItem isFilled />
          <SplitItem>
            <Button isLarge variant="primary" onClick={finalize}>
              <SearchIcon/> Search
            </Button>
          </SplitItem>
        </Split>
      </GridItem>
    </Grid>
  )
}

export default QueryBuilder
