import { useState } from "react";
import { parse, format } from "date-fns";
import {
  Card,
  CardHeader,
  GridItem,
  Badge,
  Tooltip,
  Grid,
} from "@patternfly/react-core";
import FaQuestionCircle from "@patternfly/react-icons/dist/esm/icons/question-circle-icon";
import SeriesCard from "./SeriesCard";

const StudyCard = ({ study }: { study: any }) => {
  const [isStudyExpanded, setIsStudyExpanded] = useState(false);

  const formatStudyDate = (studyDateString: string) => {
    // Parse the input string to a Date object
    const parsedDate = parse(studyDateString, "yyyyMMdd", new Date());

    // Format the Date object to 'MMMM d yyyy' format (e.g., 'December 6 2011')
    const formattedDate = format(parsedDate, "MMMM d yyyy");

    // Add 'st', 'nd', 'rd', or 'th' to the day part of the formatted date
    const day: any = format(parsedDate, "d");
    const dayWithSuffix =
      day +
      (["st", "nd", "rd"][
        (day - 1) % 10 === 0
          ? 0
          : (day - 11) % 10 === 0
          ? 1
          : (day - 12) % 10 === 0
          ? 2
          : 3
      ] || "th");

    return formattedDate.replace(day, dayWithSuffix);
  };

  return (
    <>
      <Card isExpanded={isStudyExpanded} isRounded isSelectable isClickable>
        <CardHeader onExpand={() => setIsStudyExpanded(!isStudyExpanded)}>
          <Grid hasGutter>
            <GridItem span={4}>
              <div>
                <b style={{ marginRight: "0.5em" }}>
                  {study.StudyDescription.value && study.StudyDescription.value}
                </b>{" "}
              </div>
              <div>
                {study.NumberOfStudyRelatedSeries.value &&
                  study.NumberOfStudyRelatedSeries.value}{" "}
                series, on {`${formatStudyDate(study.StudyDate.value)}`}
              </div>
            </GridItem>
            <GridItem span={2}>
              <div className="study-detail-title">Modalities in Study</div>
              <div>
                {study.ModalitiesInStudy.value &&
                  study.ModalitiesInStudy.value.split("\\").map((m: string) => (
                    <Badge style={{ margin: "auto 0.125em" }} key={m}>
                      {m}
                    </Badge>
                  ))}
              </div>
            </GridItem>
            <GridItem span={2}>
              <div className="study-detail-title">Accession Number</div>
              {study.AccessionNumber.value &&
              study.AccessionNumber.value.startsWith("no value") ? (
                <Tooltip content={study.AccessionNumber}>
                  <FaQuestionCircle />
                </Tooltip>
              ) : (
                <div>{study.AccessionNumber.value}</div>
              )}
            </GridItem>

            <GridItem span={2}>
              <div className="study-detail-title">Station</div>
              {study.PerformedStationAETitle.value &&
              study.PerformedStationAETitle.value.startsWith("no value") ? (
                <Tooltip content={study.PerformedStationAETitle.value}>
                  <FaQuestionCircle />
                </Tooltip>
              ) : (
                <div>{study.PerformedStationAETitle.value}</div>
              )}
            </GridItem>
          </Grid>
        </CardHeader>
      </Card>
      {isStudyExpanded && (
        <Grid hasGutter className="patient-series">
          {study.series.map((series: any, index: number) => {
            return (
              <GridItem sm={12} lg={4} xl={4} md={3} key={index}>
                <SeriesCard series={series} key={index} />
              </GridItem>
            );
          })}
        </Grid>
      )}
    </>
  );
};

export default StudyCard;
