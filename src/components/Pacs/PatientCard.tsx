import * as React from "react";
import { PACSPatient, PFDCMFilters, PACSPullStages } from "./types";
import { PFDCMPull } from "./pfdcm";

import { Card, CardHeader, GridItem, Grid } from "@patternfly/react-core";
import pluralize from "pluralize";
import StudyCard from "./StudyCard";

const LatestDate = (dates: Date[]) => {
  let latestStudy = dates[0];
  for (const date of dates) {
    if (latestStudy.getTime() < date.getTime()) latestStudy = date;
  }
  return latestStudy;
};

const PatientCard = ({
  patient,
  onRequestStatus,
  onExecutePACSStage,
}: {
  patient: PACSPatient;
  onRequestStatus: (query: PFDCMFilters) => Promise<PFDCMPull>;
  onExecutePACSStage: (query: PFDCMFilters, stage: PACSPullStages) => any;
}) => {
  const { PatientID, PatientBirthDate, PatientName, PatientSex } = patient;
  const [isPatientExpanded, setIsPatientExpanded] = React.useState(false);
  const expandPatient = () => {
    setIsPatientExpanded(!isPatientExpanded);
  };
  return (
    <>
      <Card isRounded isExpanded={isPatientExpanded}>
        <CardHeader onExpand={expandPatient.bind(PatientCard)}>
          <Grid hasGutter style={{ width: "100%" }}>
            <GridItem lg={4}>
              <div>
                <b>{PatientName.split("^").reverse().join(" ")}</b>
              </div>
              <div>MRN {PatientID}</div>
            </GridItem>
            <GridItem lg={4}>
              <div>
                <b>Sex</b> ({PatientSex})
              </div>
              <div>
                <b>DoB</b> {`${PatientBirthDate}`}
              </div>
            </GridItem>

            <GridItem lg={4} style={{ textAlign: "right", color: "gray" }}>
              <div>
                <b>
                  {patient.studies.length}{" "}
                  {pluralize("study", patient.studies.length)}
                </b>
              </div>
              <div>
                Latest on{" "}
                {LatestDate(
                  patient.studies.map((s) => s.StudyDate)
                ).toDateString()}
              </div>
            </GridItem>
          </Grid>
        </CardHeader>
      </Card>

      {isPatientExpanded && (
        <Grid hasGutter className="patient-studies">
          {patient.studies.map((study) => (
            <GridItem key={study.StudyInstanceUID}>
              <StudyCard
                study={study}
                onExecutePACSStage={onExecutePACSStage}
                onRequestStatus={onRequestStatus}
              />
            </GridItem>
          ))}
        </Grid>
      )}
    </>
  );
};

export default PatientCard;
