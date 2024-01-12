import { useState, useEffect, useContext } from "react";

import {
  Card,
  CardHeader,
  GridItem,
  Badge,
  Tooltip,
  Grid,
  Button,
} from "@patternfly/react-core";
import { DotsIndicator } from "../../Common";
import FaQuestionCircle from "@patternfly/react-icons/dist/esm/icons/question-circle-icon";
import SeriesCard from "./SeriesCard";
import { formatStudyDate } from "./utils";
import { PacsQueryContext, Types } from "../context";
import PFDCMClient from "../pfdcmClient";
import useInterval from "./useInterval";

const client = new PFDCMClient();

const StudyCard = ({ study }: { study: any }) => {
  const { state, dispatch } = useContext(PacsQueryContext);
  const [isStudyExpanded, setIsStudyExpanded] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchNextStatus, setFetchNextStatus] = useState(false);
  const { seriesPreviews, preview, selectedPacsService, queryResult } = state;
  const query = {
    AccessionNumber: study.AccessionNumber.value,
    StudyInstanceUID: study.StudyInstanceUID.value,
  };

  useEffect(() => {
    return () => {
      dispatch({
        type: Types.RESET_SERIES_PREVIEWS,
      });

      dispatch({
        type: Types.RESET_SERIES_STATUS,
      });
    };
  }, [queryResult, dispatch]);

  useInterval(
    async () => {
      if (fetchNextStatus && !isFetching) {
        setIsFetching(true);
        try {
          const stepperStatus = await client.pullStudyStatus(
            query,
            selectedPacsService,
          );

          dispatch({
            type: Types.SET_SERIES_STATUS,
            payload: {
              status: stepperStatus,
              studyInstanceUID: study.StudyInstanceUID.value,
            },
          });

          let allCompleted = true;

          for (const [, seriesData] of Object.entries(stepperStatus)) {
            const statusArray = [
              "none",
              "retrieve",
              "push",
              "register",
              "completed",
            ];

            const currentStep = seriesData.progress.currentStep;

            const findIndex = statusArray.findIndex(
              (step) => step === currentStep,
            );

            if (findIndex <= 1 && seriesData.progress.currentProgress !== 1) {
              allCompleted = false;
              break;
            }
          }

          if (allCompleted) {
            setIsFetching(false);
            setFetchNextStatus(!fetchNextStatus);
          }
        } catch (error) {
          setIsFetching(false);
        } finally {
          setIsFetching(false);
        }
      }
    },
    fetchNextStatus ? 3000 : null,
  );

  return (
    <>
      <Card isExpanded={isStudyExpanded} isRounded isSelectable isClickable>
        <CardHeader
          className="flex-studies-container"
          onExpand={() => setIsStudyExpanded(!isStudyExpanded)}
        >
          <div className="flex-studies-item">
            <Tooltip content={study.StudyDescription.value} position="auto">
              <div
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ marginRight: "0.5em" }}>
                  {study.StudyDescription.value && study.StudyDescription.value}
                </span>{" "}
              </div>
            </Tooltip>
            <div>
              {study.NumberOfStudyRelatedSeries.value &&
                study.NumberOfStudyRelatedSeries.value}{" "}
              series, {`${formatStudyDate(study.StudyDate.value)}`}
            </div>
          </div>

          <div className="flex-studies-item ">
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

          <div className="flex-studies-item">
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

          <div className="flex-studies-item">
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

          <div className="flex-studies-item button-container">
            <Button
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

            {isFetching || fetchNextStatus ? (
              <DotsIndicator title="Pulling Study..." />
            ) : (
              <Button
                onClick={async () => {
                  await client.findRetrieve(query, selectedPacsService);
                  setFetchNextStatus(!fetchNextStatus);
                }}
                className="button-with-margin"
                size="sm"
              >
                Pull Study
              </Button>
            )}
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
