import { useState } from "react";
import pluralize from "pluralize";
import { format, parse } from "date-fns";
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

  const parsedDate = parse(PatientBirthDate, "yyyyMMdd", new Date());
  const formattedDate = format(parsedDate, "MMMM d, yyyy");

  const LatestDate = (dateStrings: string[]) => {
    let latestStudy = parse(dateStrings[0], "yyyyMMdd", new Date());

    for (const dateString of dateStrings) {
      const currentDate = parse(dateString, "yyyyMMdd", new Date());

      if (currentDate > latestStudy) {
        latestStudy = currentDate;
      }
    }

    return latestStudy;
  };

  return (
    <>
      <Card isRounded isExpanded={isPatientExpanded}>
        <CardHeader onExpand={() => setIsPatientExpanded(!isPatientExpanded)}>
          <Grid hasGutter style={{ width: "100%" }}>
            <GridItem lg={4}>
              <div>{PatientName.split("^").reverse().join(" ")}</div>
              <div>Patient MRN: ({PatientID})</div>
            </GridItem>
            <GridItem lg={4}>
              <div>Patient Sex: ({PatientSex})</div>
              <div>Patient Birth Date: ({formattedDate})</div>
            </GridItem>

            <GridItem lg={4} style={{ textAlign: "right" }}>
              <div>
                <b>
                  {queryResult.length} {pluralize("study", queryResult.length)}
                </b>
              </div>
              <div>
                Latest Study Date:
                ({LatestDate(
                  queryResult.map((s: any) => s.StudyDate.value)
                ).toDateString()})
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
