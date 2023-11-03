import { useState } from "react";
import {
  Card,
  CardHeader,
  Grid,
  GridItem,
  Tooltip,
  Badge,
} from "@patternfly/react-core";
import FaQuestionCircle from "@patternfly/react-icons/dist/esm/icons/question-circle-icon";
import { PACSStudy, PFDCMFilters, PACSPullStages } from "./types";

import { PFDCMPull } from "./pfdcm";
import StudyActions from "./StudyActions";

const StudyCard = ({
  study,
  onRequestStatus,
  onExecutePACSStage,
}: {
  study: PACSStudy;
  onRequestStatus: (query: PFDCMFilters) => Promise<PFDCMPull>;
  onExecutePACSStage: (query: PFDCMFilters, stage: PACSPullStages) => any;
}) => {
  const [isStudyExpanded, setIsStudyExpanded] = useState(false);
  const expandStudy = () => {
    setIsStudyExpanded(!isStudyExpanded);
  };

  return (
    <Card isRounded isExpanded={isStudyExpanded}>
      <CardHeader
        onExpand={() => {
          expandStudy();
        }}
      >
        <Grid hasGutter>
          <GridItem span={4}>
            <div>
              <b style={{ marginRight: "0.5em" }}>
                {study.StudyDescription && study.StudyDescription}
              </b>{" "}
              {study.StudyDate &&
              study.StudyDate.getTime() >=
                Date.now() - 30 * 24 * 60 * 60 * 1000 ? (
                <Tooltip content="Study was performed in the last 30 days.">
                  <Badge>NEW</Badge>
                </Tooltip>
              ) : null}
            </div>
            <div>
              {study.NumberOfStudyRelatedSeries &&
                study.NumberOfStudyRelatedSeries}{" "}
              series, on {`${study.StudyDate}`}
            </div>
          </GridItem>
          <GridItem span={2}>
            <div className="study-detail-title">Modalities in Study</div>
            <div>
              {study.ModalitiesInStudy &&
                study.ModalitiesInStudy.split("\\").map((m) => (
                  <Badge style={{ margin: "auto 0.125em" }} key={m}>
                    {m}
                  </Badge>
                ))}
            </div>
          </GridItem>
          <GridItem span={2}>
            <div className="study-detail-title">Accession Number</div>
            {study.AccessionNumber &&
            study.AccessionNumber.startsWith("no value") ? (
              <Tooltip content={study.AccessionNumber}>
                <FaQuestionCircle />
              </Tooltip>
            ) : (
              <div>{study.AccessionNumber}</div>
            )}
          </GridItem>

          <GridItem span={2}>
            <div className="study-detail-title">Station</div>
            {study.PerformedStationAETitle &&
            study.PerformedStationAETitle.startsWith("no value") ? (
              <Tooltip content={study.PerformedStationAETitle}>
                <FaQuestionCircle />
              </Tooltip>
            ) : (
              <div>{study.PerformedStationAETitle}</div>
            )}
          </GridItem>
          <GridItem
            span={2}
            style={{
              margin: "auto 0 auto 2em",
              minWidth: "12em",
              textAlign: "right",
              fontSize: "small",
            }}
          >
            <StudyActions
              study={study}
              onExecutePACSStage={onExecutePACSStage}
              onRequestStatus={onRequestStatus}
            />
          </GridItem>
        </Grid>
      </CardHeader>
    </Card>
  );
};

export default StudyCard;
