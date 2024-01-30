import { useState, useContext } from "react";
import { Alert } from "antd";
import {
  Card,
  CardHeader,
  GridItem,
  Badge,
  Tooltip,
  Grid,
  Button,
  Skeleton,
} from "@patternfly/react-core";
import { DotsIndicator } from "../../Common";
import FaQuestionCircle from "@patternfly/react-icons/dist/esm/icons/question-circle-icon";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import EyeIcon from "@patternfly/react-icons/dist/esm/icons/eye-icon";
import SeriesCard from "./SeriesCard";
import { formatStudyDate } from "./utils";
import { PacsQueryContext, Types } from "../context";
import { CardHeaderComponent } from "./SettingsComponents";
import useInterval from "./useInterval";
import useSettings from "../useSettings";

const StudyCard = ({ study }: { study: any }) => {
  const { data, isLoading, error } = useSettings();
  const { state, dispatch } = useContext(PacsQueryContext);
  const [isStudyExpanded, setIsStudyExpanded] = useState(false);

  const [fetchNextStatus, setFetchNextStatus] = useState(false);

  const { seriesPreviews, preview, seriesUpdate } = state;

  const userPreferences = data && data["study"];
  const userPreferencesArray = userPreferences && Object.keys(userPreferences);

  useInterval(
    () => {
      if (fetchNextStatus) {
        const { series } = study;

        let allCompleted = true;
        const seriesUpdateForStudy = seriesUpdate[study.StudyInstanceUID.value];

        if (seriesUpdateForStudy) {
          for (const serie of series) {
            const instanceUID = serie.SeriesInstanceUID.value;

            if (seriesUpdateForStudy[instanceUID] !== "completed") {
              allCompleted = false;
              break;
            }
          }
        }

        if (allCompleted && seriesUpdateForStudy) {
          setFetchNextStatus(!fetchNextStatus);
          dispatch({
            type: Types.SET_PULL_STUDY,
          });
        }
      }
    },
    fetchNextStatus ? 4000 : null,
  );

  return (
    <>
      <Card isExpanded={isStudyExpanded} isRounded isSelectable isClickable>
        <CardHeader
          actions={{
            actions: <CardHeaderComponent resource={study} type="study" />,
          }}
          className="flex-studies-container"
          onExpand={() => setIsStudyExpanded(!isStudyExpanded)}
        >
          {isLoading ? (
            <GridItem lg={4} md={4} sm={12}>
              <Skeleton
                width="100%"
                height="100%"
                screenreaderText="Loading contents"
              />
            </GridItem>
          ) : error ? (
            <GridItem>
              <Alert type="error" description="Please Refresh the page..." />
            </GridItem>
          ) : (
            <>
              {userPreferences &&
              userPreferencesArray &&
              userPreferencesArray.length > 0 ? (
                userPreferencesArray.map((key: string) => (
                  <div key={key} className="flex-studies-item">
                    <div className="study-detail-title">{key}</div>
                    <Tooltip content={study[key].value} position="auto">
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{ marginRight: "0.5em" }}>
                          {study[key].value && study[key].value}
                        </span>{" "}
                      </div>
                    </Tooltip>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex-studies-item">
                    <Tooltip
                      content={study.StudyDescription.value}
                      position="auto"
                    >
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{ marginRight: "0.5em" }}>
                          {study.StudyDescription.value &&
                            study.StudyDescription.value}
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
                    <div className="study-detail-title">
                      Modalities in Study
                    </div>
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
                    study.PerformedStationAETitle.value.startsWith(
                      "no value",
                    ) ? (
                      <Tooltip content={study.PerformedStationAETitle.value}>
                        <FaQuestionCircle />
                      </Tooltip>
                    ) : (
                      <div>{study.PerformedStationAETitle.value}</div>
                    )}
                  </div>
                </>
              )}

              <div className="flex-studies-item button-container">
                <Tooltip
                  content={
                    preview === true ? "Hide All Previews" : "Show All Previews"
                  }
                >
                  <Button
                    size="sm"
                    variant="tertiary"
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
                    icon={<EyeIcon />}
                  ></Button>
                </Tooltip>

                {fetchNextStatus ? (
                  <DotsIndicator title="Pulling Study..." />
                ) : (
                  <Tooltip content="Pull Study">
                    <Button
                      onClick={() => {
                        dispatch({
                          type: Types.SET_PULL_STUDY,
                        });

                        setFetchNextStatus(!fetchNextStatus);
                        setIsStudyExpanded(true);
                      }}
                      variant="tertiary"
                      className="button-with-margin"
                      size="sm"
                      icon={<DownloadIcon />}
                    ></Button>
                  </Tooltip>
                )}
              </div>
            </>
          )}
        </CardHeader>
      </Card>
      {isStudyExpanded && (
        <div className="patient-series">
          <Grid hasGutter>
            {study.series.map((series: any) => {
              const seriesID = series.SeriesInstanceUID.value;
              const seriesPreview = seriesPreviews && seriesPreviews[seriesID];
              return (
                <GridItem
                  key={series.SeriesInstanceUID.value}
                  className={
                    seriesPreviews && seriesPreviews[seriesID]
                      ? "series-grid"
                      : ""
                  }
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
