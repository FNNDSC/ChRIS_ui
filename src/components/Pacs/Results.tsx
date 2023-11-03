import { PACSPatient, PFDCMFilters, PACSPullStages, PACSStudy } from "./types";
import { PFDCMPull } from "./pfdcm";
import { Grid, GridItem } from "@patternfly/react-core";
import PatientCard from "./PatientCard";

interface QueryResultsProps {
  results: PACSPatient[] | PACSStudy[];
  onRequestStatus: (query: PFDCMFilters) => Promise<PFDCMPull>;
  onExecutePACSStage: (query: PFDCMFilters, stage: PACSPullStages) => any;
}

const Results = (props: QueryResultsProps) => {
  const { results, onRequestStatus, onExecutePACSStage } = props;

  const patientResults = results as PACSPatient[];

  return (
    <Grid hasGutter>
      {patientResults.map((patient) => {
        return (
          <GridItem key={patient.PatientID}>
            <PatientCard
              patient={patient}
              onExecutePACSStage={onExecutePACSStage}
              onRequestStatus={onRequestStatus}
            />
          </GridItem>
        );
      })}
    </Grid>
  );
};

export default Results;
