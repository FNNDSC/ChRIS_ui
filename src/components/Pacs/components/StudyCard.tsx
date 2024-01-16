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
import { Popover } from "antd";
import SettingsComponent from "./SettingsComponents";
import { DotsIndicator } from "../../Common";
import SettingsIcon from "@patternfly/react-icons/dist/esm/icons/cog-icon";
import FaQuestionCircle from "@patternfly/react-icons/dist/esm/icons/question-circle-icon";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import EyeIcon from "@patternfly/react-icons/dist/esm/icons/eye-icon";
import SeriesCard from "./SeriesCard";
import { formatStudyDate } from "./utils";
import { PacsQueryContext, Types } from "../context";
import useInterval from "./useInterval";

const StudyCard = ({ study }: { study: any }) => {
  const { state, dispatch } = useContext(PacsQueryContext);
  const [isStudyExpanded, setIsStudyExpanded] = useState(false);

  const [fetchNextStatus, setFetchNextStatus] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const {
    seriesPreviews,
    preview,

    resourcesDict,
    seriesUpdate,
  } = state;

  const userPreferences = resourcesDict && resourcesDict["study"];

  useEffect(() => {}, []);

  const headerActions = (
    <div>
      <Popover
        content={
          <SettingsComponent
            handleModalClose={() => {
              setSettingsModal(!settingsModal);
            }}
            study={study}
          />
        }
        title="Study Card Configuration"
        trigger="click"
        open={settingsModal}
        onOpenChange={() => {
          setSettingsModal(!settingsModal);
        }}
      >
        <Button
          onClick={() => {
            setSettingsModal(!settingsModal);
          }}
          variant="link"
          icon={<SettingsIcon />}
        ></Button>
      </Popover>
    </div>
  );

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

  const userPreferencesArray = userPreferences && Object.keys(userPreferences);

  return (
    <>
      <Card isExpanded={isStudyExpanded} isRounded isSelectable isClickable>
        <CardHeader
          actions={{ actions: headerActions }}
          className="flex-studies-container"
          onExpand={() => setIsStudyExpanded(!isStudyExpanded)}
        >
          {userPreferences && userPreferencesArray.length > 0 ? (
            userPreferencesArray.map((key: string) => {
              return (
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
              );
            })
          ) : (
            <>
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
