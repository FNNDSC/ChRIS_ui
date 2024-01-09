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

  return (
    <>
      <Card isExpanded={isStudyExpanded} isRounded isSelectable isClickable>
        <CardHeader className='flex-series-container' onExpand={() => setIsStudyExpanded(!isStudyExpanded)}>
          <div className="flex-series-item">
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
              series, {`${formatStudyDate(study.StudyDate.value)}`}
            </div>
          </div>

          <div className="flex-series-item ">
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

          <div className="flex-series-item">
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

          <div className="flex-series-item">
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

          <div className="flex-series-item">
            <Button
              className="button-with-margin"
              size="sm"
              style={{ marginRight: "0.25em" }}
              onClick={() => {
                dispatch({
                  type: Types.SET_SHOW_PREVIEW,
                  payload: {
                    preview: !preview,
                  },
                });

                if (preview === false) {
                  setIsStudyExpanded(true);
                }
              }}
            >
              {preview ? "Hide" : "Show"} All Previews
            </Button>
            <Button className="button-with-margin" size="sm">
              Pull Study
            </Button>
          </div>
        </CardHeader>
      </Card>
      {isStudyExpanded && (
        <div className="patient-series">
          <Grid hasGutter>
            {study.series.map((series: any) => {
              const seriesID = series.SeriesInstanceUID.value;
              const seriesPreview = seriesPreviews[seriesID];
              return (
                <GridItem
                  key={series.SeriesInstanceUID.value}
                  className={seriesPreviews[seriesID] ? "series-grid" : ""}
                  rowSpan={1}
                  lg={seriesPreview ? 4 : 12}
                  md={seriesPreview ? 4 : 12}
                  sm={12}
                  xl={seriesPreview ? 3 : 12}
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
