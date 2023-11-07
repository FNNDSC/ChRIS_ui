import { useState } from "react";
import { GridItem, Card, CardHeader, Grid } from "@patternfly/react-core";
import StudyCard from "./StudyCard";

function getPatientDetails(patientDetails: any) {
  return {
    PatientName: patientDetails["PatientName"].value,
    PatientID: patientDetails["PatientID"].value,
    PatientBirthDate: patientDetails["PatientBirthDate"].value,
    PatientSex: patientDetails["PatientSex"].value,
  };
}

const PatientCard = ({ queryResult }: { queryResult: any }) => {
  const patient = queryResult[0];
  const patientDetails = getPatientDetails(patient);
  const [isPatientExpanded, setIsPatientExpanded] = useState(false);
  const { PatientID, PatientName, PatientBirthDate, PatientSex } =
    patientDetails;

  return (
    <>
      <Card isRounded isExpanded={isPatientExpanded}>
        <CardHeader onExpand={() => setIsPatientExpanded(!isPatientExpanded)}>
          <Grid hasGutter style={{ width: "100%" }}>
            <GridItem lg={4}>
              <div>{PatientName.split("^").reverse().join(" ")}</div>
              <div>Patient MRN: {PatientID}</div>
            </GridItem>
            <GridItem lg={4}>
              <div>Patient Sex: ({PatientSex})</div>
              <div>
                Patient Birth Date:
                {`${PatientBirthDate}`}
              </div>
            </GridItem>
          </Grid>
        </CardHeader>
      </Card>
      {isPatientExpanded &&
        queryResult.map((result: any, index: number) => {
          return (
            <div className="patient-studies" key={index}>
              <StudyCard key={index} study={result} />
            </div>
          );
        })}
    </>
  );
};

export default PatientCard;
