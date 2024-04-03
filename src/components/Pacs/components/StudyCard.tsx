import {
  Badge,
  Button,
  Card,
  CardHeader,
  Grid,
  GridItem,
  Skeleton,
  Tooltip,
} from "@patternfly/react-core";
import { format, parse } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { DotsIndicator } from "../../Common";
import {
  DownloadIcon,
  PreviewIcon,
  QuestionCircleIcon,
  ThLargeIcon,
} from "../../Icons";
import { PacsQueryContext, Types } from "../context";
import SeriesCard from "./SeriesCard";
import { CardHeaderComponent } from "./SettingsComponents";

import useSettings from "../useSettings";

const StudyCardCopy = ({ study }: { study: any }) => {
  const { data, isLoading, error } = useSettings();
  const { state, dispatch } = useContext(PacsQueryContext);
  const [isStudyExpanded, setIsStudyExpanded] = useState(false);
  const { preview, pullStudy, studyPullTracker } = state;
  const userPreferences = data?.study;
  const userPreferencesArray = userPreferences && Object.keys(userPreferences);
  const studyInstanceUID = study.StudyInstanceUID.value;

  const studyDate = study.StudyDate.value;
  const parsedDate = parse(studyDate, "yyyyMMdd", new Date());
  const formattedDate = Number.isNaN(
    parsedDate.getTime(),
  ) /* Check if parsedDate is a valid date */
    ? studyDate
    : format(parsedDate, "MMMM d, yyyy");

  useEffect(() => {
    if (studyPullTracker && pullStudy) {
      const studyBeingTracked = studyPullTracker[studyInstanceUID];
      if (studyBeingTracked) {
        let allSeriesBeingTracked = true;
        for (const series in studyBeingTracked) {
          const isSeriesDone = studyBeingTracked[series];
          if (!isSeriesDone) {
            allSeriesBeingTracked = false;
            break;
          }
        }
        if (allSeriesBeingTracked) {
          dispatch({
            type: Types.SET_PULL_STUDY,
            payload: {
              studyInstanceUID,
              status: false,
            },
          });
        }
      }
    }
  }, [studyPullTracker, pullStudy]);

  return (
    <>
      <Card
        isFlat={true}
        isFullHeight={true}
        isCompact={true}
        isRounded={true}
        isExpanded={isStudyExpanded}
        isSelectable
        isClickable
      >
        <CardHeader
          actions={{
            actions: <CardHeaderComponent resource={study} type="study" />,
          }}
          className="flex-studies-container"
          onExpand={() => setIsStudyExpanded(!isStudyExpanded)}
        >
          <>
            {isLoading ? (
              <div className="flex-studies-item">
                <Skeleton
                  width="100%"
                  height="100%"
                  screenreaderText="Loading contents"
                />
              </div>
            ) : (
              <>
                {!error &&
                userPreferences &&
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
                        series, {formattedDate}
                      </div>
                    </div>
                    <div className="flex-studies-item ">
                      <div className="study-detail-title">
                        Modalities in Study
                      </div>
                      <div>
                        {study.ModalitiesInStudy.value
                          ?.split("\\")
                          .map((m: string, index: number) => (
                            <Badge
                              style={{ margin: "auto 0.125em" }}
                              key={`${m}_${index}`}
                            >
                              {m}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div className="flex-studies-item">
                      <div className="study-detail-title">Accession Number</div>
                      {study.AccessionNumber.value?.startsWith("no value") ? (
                        <Tooltip content={study.AccessionNumber}>
                          <QuestionCircleIcon />
                        </Tooltip>
                      ) : (
                        <div>{study.AccessionNumber.value}</div>
                      )}
                    </div>
                    <div className="flex-studies-item">
                      <div className="study-detail-title">Station</div>
                      {study.PerformedStationAETitle.value?.startsWith(
                        "no value",
                      ) ? (
                        <Tooltip content={study.PerformedStationAETitle.value}>
                          <QuestionCircleIcon />
                        </Tooltip>
                      ) : (
                        <div>{study.PerformedStationAETitle.value}</div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
            <div className="flex-studies-item button-container">
              {import.meta.env.VITE_OHIF_URL && (
                <Tooltip content="Open in OHIF">
                  <Button
                    size="sm"
                    variant="secondary"
                    style={{ marginRight: "0.25em" }}
                    icon={<ThLargeIcon />}
                    component="a"
                    href={`${
                      import.meta.env.VITE_OHIF_URL
                    }viewer?StudyInstanceUIDs=${study.StudyInstanceUID.value}`}
                    target="_blank"
                  />
                </Tooltip>
              )}
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
                  icon={<PreviewIcon />}
                />
              </Tooltip>

              {pullStudy[studyInstanceUID] ? (
                <DotsIndicator title="Pulling Study..." />
              ) : (
                <Tooltip content="Pull Study">
                  <Button
                    onClick={() => {
                      dispatch({
                        type: Types.SET_PULL_STUDY,
                        payload: {
                          studyInstanceUID,
                          status: true,
                        },
                      });
                      setIsStudyExpanded(true);
                    }}
                    variant="tertiary"
                    className="button-with-margin"
                    size="sm"
                    icon={<DownloadIcon />}
                  />
                </Tooltip>
              )}
            </div>
          </>
        </CardHeader>
      </Card>
      {isStudyExpanded && (
        <div className="patient-series">
          <Grid hasGutter>
            {study.series.map((series: any) => {
              return (
                <GridItem
                  key={series.SeriesInstanceUID.value}
                  rowSpan={1}
                  lg={12}
                  md={12}
                  sm={12}
                  xl={12}
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

export default StudyCardCopy;
