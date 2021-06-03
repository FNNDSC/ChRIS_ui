import React from "react";
import {
  Button,
  Stack,
  StackItem,
  TextInput,
  Form,
  FormGroup,
  ActionGroup,
  PageSection,
} from "@patternfly/react-core";
import { usePaginate } from "../../components/common/pagination";
import { getPacsFilesRequest } from "../../store/workflows/actions";

const PatientLookup = () => {
  const { handleFilterChange, run, filterState } = usePaginate();
  return (
    <PageSection>
      <Stack>
        <StackItem>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              run(getPacsFilesRequest);
            }}
          >
            <FormGroup fieldId="patient-mrn" label="Patient MRN">
              <TextInput
                aria-label="Input box for Patient MRN"
                onChange={(value: string) => handleFilterChange(value)}
                value={filterState.filter}
              />
            </FormGroup>
            <ActionGroup>
              <Button type="submit" variant="primary">
                Search
              </Button>
            </ActionGroup>
          </Form>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default PatientLookup;
