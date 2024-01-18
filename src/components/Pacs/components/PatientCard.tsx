import { useState, useContext } from "react";
import { format, parse } from "date-fns";
import {
  GridItem,
  Card,
  CardHeader,
  Grid,
  Tooltip,
} from "@patternfly/react-core";
import StudyCard from "./StudyCard";
import { CardHeaderComponent } from "./SettingsComponents";
import { SpinContainer } from "../../Common";
import { PacsQueryContext } from "../context";
import useSettings from "../useSettings";

function getPatientDetails(patientDetails: any) {
  return {
    PatientName: patientDetails["PatientName"].value,
    PatientID: patientDetails["PatientID"].value,
    PatientBirthDate: patientDetails["PatientBirthDate"].value,
    PatientSex: patientDetails["PatientSex"].value,
  };
}

const PatientCard = ({ queryResult }: { queryResult: any }) => {
  const { data, isLoading, error } = useSettings();
  const { state } = useContext(PacsQueryContext);

  const patient = queryResult[0];
  const patientDetails = getPatientDetails(patient);
  const [isPatientExpanded, setIsPatientExpanded] = useState(
    state.shouldDefaultExpanded || false,
  );
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

  const userPreferences = data && data["patient"];
  const userPreferencesArray = userPreferences && Object.keys(userPreferences);

  return (
    <>
      <Card isRounded isExpanded={isPatientExpanded}>
        <CardHeader
          actions={{
            actions: <CardHeaderComponent resource={patient} type="patient" />,
          }}
          onExpand={() => setIsPatientExpanded(!isPatientExpanded)}
        >
          <Grid hasGutter style={{ width: "100%" }}>
            {isLoading ? (
              <GridItem>{/* Add loading content here if needed */}</GridItem>
            ) : userPreferences && userPreferencesArray.length > 0 ? (
              userPreferencesArray.map((key: string) => (
                <GridItem key={key} lg={4} md={4} sm={12}>
                  <div>{key}</div>
                  <Tooltip content={patient[key] ? patient[key].value : "N/A"}>
                    <div className="hide-content">
                      {patient[key] ? patient[key].value : "N/A"}
                    </div>
                  </Tooltip>
                </GridItem>
              ))
            ) : (
              <>
                <GridItem lg={4} md={4} sm={12}>
                  <div>
                    Patient Name: {PatientName.split("^").reverse().join(" ")}
                  </div>
                  <div>Patient MRN: {PatientID}</div>
                </GridItem>
                <GridItem lg={4} md={4} sm={12}>
                  <div>Patient Sex: {PatientSex}</div>
                  <div>Patient Birth Date: {formattedDate}</div>
                </GridItem>

                <GridItem lg={4} md={4} sm={12} className="last-item-align">
                  <div>
                    {queryResult.length}{" "}
                    {queryResult.length === 1 ? "study" : "studies"}
                  </div>
                  <div>
                    Latest Study Date: {" "}
                    {LatestDate(
                      queryResult.map((s: any) => s.StudyDate.value),
                    ).toDateString()}
                  </div>
                </GridItem>
              </>
            )}
          </Grid>
        </CardHeader>
      </Card>
      {isPatientExpanded &&
        queryResult.map((result: any) => {
          return (
            <div className="patient-studies" key={result.uid.value}>
              <StudyCard study={result} />
            </div>
          );
        })}
    </>
  );
};

export default PatientCard;
