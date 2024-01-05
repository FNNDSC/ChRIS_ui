import { useState, useContext } from "react";

import {
  Card,
  CardHeader,
  GridItem,
  Badge,
  Tooltip,
  Grid,
  Button,
} from "@patternfly/react-core";
import FaQuestionCircle from "@patternfly/react-icons/dist/esm/icons/question-circle-icon";
import SeriesCard from "./SeriesCard";
import { formatStudyDate } from "./utils";
import { PacsQueryContext, Types } from "../context";

const StudyCard = ({ study }: { study: any }) => {
  const { state, dispatch } = useContext(PacsQueryContext);
  const [isStudyExpanded, setIsStudyExpanded] = useState(false);

  const { seriesPreviews, preview } = state;

  console.log("State", state);

  return (
    <>
      <Card isExpanded={isStudyExpanded} isRounded isSelectable isClickable>
        <CardHeader onExpand={() => setIsStudyExpanded(!isStudyExpanded)}>
          <div style={{ flex: "1 1 25%", maxWidth: "25%", padding: "0.5em" }}>
            <Tooltip content={study.StudyDescription.value} position="auto">
              <div
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <b style={{ marginRight: "0.5em" }}>
                  {study.StudyDescription.value && study.StudyDescription.value}
                </b>{" "}
              </div>
            </Tooltip>
            <div>
              {study.NumberOfStudyRelatedSeries.value &&
                study.NumberOfStudyRelatedSeries.value}{" "}
              series, on {`${formatStudyDate(study.StudyDate.value)}`}
            </div>
          </div>

          <div style={{ flex: "1 1 10%", maxWidth: "10%", padding: "0.5em" }}>
            <div className="study-detail-title">Modalities in Study</div>
            <div>
              {study.ModalitiesInStudy.value &&
                study.ModalitiesInStudy.value
                  .split("\\")
                  .map((m: string, index: number) => (
                    <Badge
                      style={{ margin: "auto 0.125em" }}
                      key={`${m} _${index}`}
                    >
                      {m}
                    </Badge>
                  ))}
            </div>
          </div>

          <div style={{ flex: "1 1 10%", maxWidth: "10%", padding: "0.5em" }}>
            <div className="study-detail-title">Accession Number</div>
            {study.AccessionNumber.value &&
            study.AccessionNumber.value.startsWith("no value") ? (
              <Tooltip content={study.AccessionNumber}>
                <FaQuestionCircle />
              </Tooltip>
            ) : (
              <div>{study.AccessionNumber.value}</div>
            )}
          </div>

          <div style={{ flex: "1 1 25%", maxWidth: "25%", padding: "0.5em" }}>
            <div className="study-detail-title">Station</div>
            {study.PerformedStationAETitle.value &&
            study.PerformedStationAETitle.value.startsWith("no value") ? (
              <Tooltip content={study.PerformedStationAETitle.value}>
                <FaQuestionCircle />
              </Tooltip>
            ) : (
              <div>{study.PerformedStationAETitle.value}</div>
            )}
          </div>
        </CardHeader>
      </Card>
      {isStudyExpanded && (
        <div className="patient-series">
          <div
            style={{
              textAlign: "right",
            }}
            className="button-container"
          >
            <Button
              onClick={() => {
                dispatch({
                  type: Types.SET_SHOW_PREVIEW,
                  payload: {
                    preview: !preview,
                  },
                });
              }}
              style={{ display: "inline-block" }}
            >
              {preview ? "Hide" : "Show"} All Previews
            </Button>
          </div>

          <Grid hasGutter>
            {study.series.map((series: any) => {
              const seriesID = series.SeriesInstanceUID.value;
              return (
                <GridItem
                  className={seriesPreviews[seriesID] ? "series-grid" : ""}
                  rowSpan={1}
                  span={seriesPreviews[seriesID] ? 4 : 12}
                >
                  <SeriesCard
                    key={series.SeriesInstanceUID.value}
                    series={series}
                  />
                </GridItem>
              );
            })}
          </Grid>
        </div>
      )}
    </>
  );
};

export default StudyCard;
