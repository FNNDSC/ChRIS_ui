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
import { notification } from "antd";
import { format, parse } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { DotsIndicator } from "../../Common";
import {
  DownloadIcon,
  PreviewIcon,
  QuestionCircleIcon,
  RetryIcon,
  ThLargeIcon,
} from "../../Icons";
import { PacsQueryContext, Types } from "../context";
import PfdcmClient from "../pfdcmClient";
import useSettings from "../useSettings";
import SeriesCard from "./SeriesCard";
import { CardHeaderComponent } from "./SettingsComponents";
import usePullStudyHook from "./usePullStudyHook";

const StudyCardCopy = ({ study }: { study: any }) => {
  const [api, contextHolder] = notification.useNotification();
  const { writeStatus, getStatus } = usePullStudyHook();
  const { data, isLoading, isError } = useSettings();
  const { state, dispatch } = useContext(PacsQueryContext);
  const [isStudyExpanded, setIsStudyExpanded] = useState(false);
  const [startPullStudy, setStartStudying] = useState(false);
  const { preview, pullStudy, studyPullTracker, selectedPacsService } = state;
  const userPreferences = data?.study;
  const userPreferencesArray = userPreferences && Object.keys(userPreferences);
  const accessionNumber = study.AccessionNumber.value;
  const studyDate = study.StudyDate.value;
  const parsedDate = parse(studyDate, "yyyyMMdd", new Date());
  const formattedDate = Number.isNaN(
    parsedDate.getTime(),
  ) /* Check if parsedDate is a valid date */
    ? studyDate
    : format(parsedDate, "MMMM d, yyyy");

  const clearState = async () => {
    dispatch({
      type: Types.SET_PULL_STUDY,
      payload: {
        studyInstanceUID: accessionNumber,
        status: false,
      },
    });
    // stop tracking this status as an active pull
    await writeStatus(accessionNumber, false);
  };

  useEffect(() => {
    async function setUpStatus() {
      if (studyPullTracker[accessionNumber] && pullStudy[accessionNumber]) {
        const studyBeingTracked = studyPullTracker[accessionNumber];
        if (studyBeingTracked) {
          let allSeriesBeingTracked = true;
          for (const series in studyBeingTracked) {
            const isSeriesDone = studyBeingTracked[series];
            if (!isSeriesDone) {
              allSeriesBeingTracked = false;
              break;
            }
          }

          // All series are being tracked and are complete
          if (
            allSeriesBeingTracked &&
            study.series.length === Object.keys(studyBeingTracked).length
          ) {
            await clearState();
          }
        }
      }
    }

    setUpStatus();
  }, [studyPullTracker[accessionNumber], pullStudy[accessionNumber]]);

  useEffect(() => {
    async function fetchStatus() {
      const status = await getStatus(accessionNumber);
      if (status?.[accessionNumber]) {
        setIsStudyExpanded(true);
        dispatch({
          type: Types.SET_PULL_STUDY,
          payload: {
            studyInstanceUID: accessionNumber,
            status: true,
          },
        });
      }
    }
    // Fetch Status
    fetchStatus();
  }, []);

  const retrieveStudy = async () => {
    setStartStudying(true);
    await writeStatus(study.AccessionNumber.value, true);
    const client = new PfdcmClient();
    await client.findRetrieve(selectedPacsService, {
      AccessionNumber: study.AccessionNumber.value,
    });
    dispatch({
      type: Types.SET_PULL_STUDY,
      payload: {
        studyInstanceUID: accessionNumber,
        status: true,
      },
    });
    setStartStudying(false);
    setIsStudyExpanded(true);
  };

  return (
    <>
      {contextHolder}
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
                {!isError &&
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
              {import.meta.env.VITE_OHIF_URL &&
                import.meta.env.VITE_OHIF_URL.length > 0 && (
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

              {pullStudy[accessionNumber] || startPullStudy ? (
                <>
                  <Tooltip content="Retry the pull if you see no progress">
                    <Button
                      onClick={async () => {
                        await clearState();
                      }}
                      variant="danger"
                      style={{
                        marginLeft: "0.5em",
                      }}
                      size="sm"
                      icon={<RetryIcon />}
                    />
                  </Tooltip>
                  <DotsIndicator title="Pulling Study..." />
                </>
              ) : (
                <Tooltip content="Pull Study">
                  <Button
                    onClick={async () => {
                      const status = await getStatus(accessionNumber);
                      if (status?.[accessionNumber]) {
                        api.info({
                          message: "This study has already been pulled",
                          description: (
                            <Button
                              variant="tertiary"
                              onClick={async () => {
                                await retrieveStudy();
                              }}
                            >
                              Pull again?
                            </Button>
                          ),
                          duration: 4,
                        });
                        setIsStudyExpanded(true);
                      } else {
                        await retrieveStudy();
                      }
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
