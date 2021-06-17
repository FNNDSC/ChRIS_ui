import React, { useState } from 'react'
import {
  Card, CardBody, CardHeader, 
  ExpandableSection, 
  Grid, GridItem, 
  TextInput
} from "@patternfly/react-core";

interface QueryBuilderProps {
  onChange: (arg:any) => void
}

export const QueryBuilder: React.FC<QueryBuilderProps> = () => {
  const [toggleAdvanced, setToggleAdvanced] = useState(false)
  const onToggleAdvanced = () => setToggleAdvanced(!toggleAdvanced)

  return (
    <Grid hasGutter style={{ margin: '0.5em auto' }}>
      <GridItem lg={6} sm={12}>
        <Card>
          <CardHeader><b>Patient Lookup</b></CardHeader>
          <CardBody>
            <Grid hasGutter>
              <GridItem><TextInput type="text" placeholder="Patient MRN"/></GridItem>
              <GridItem><TextInput type="text" placeholder="Patient Name"/></GridItem>
            </Grid>
          </CardBody>
        </Card>
      </GridItem>

      <GridItem lg={6} sm={12}>
        <Card>
          <CardHeader><b>Study Lookup</b></CardHeader>
          <CardBody>
            <TextInput type="text" placeholder="Study Name"/>
          </CardBody>
        </Card>
      </GridItem>

      <GridItem sm={12}>
        <ExpandableSection
          toggleText="Filters and Constraints"
          onToggle={onToggleAdvanced}
          isExpanded={toggleAdvanced}
        >
          <Card>
            <CardBody>
              Filters and Constraints
            </CardBody>
          </Card>
        </ExpandableSection>
      </GridItem>
    </Grid>
  )
}

export default QueryBuilder
