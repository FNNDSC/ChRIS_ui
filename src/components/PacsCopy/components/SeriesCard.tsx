import {
  useRef,
  useEffect,
  useContext,
  useCallback,
  useState,
  useMemo,
} from "react";
import {
  Card,
  Flex,
  FlexItem,
  CardBody,
  Button,
  Badge,
  Progress,
  ProgressSize,
  Modal,
  Tooltip,
  ProgressMeasureLocation,
} from "@patternfly/react-core";
import pluralize from "pluralize";
import FileDetailView from "../../Preview/FileDetailView";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { PacsQueryContext } from "../context";
import PFDCMClient from "../pfdcmClient";
import { Types } from "../context/index";
import { QueryStages, getIndex } from "../context";
import FaEye from "@patternfly/react-icons/dist/esm/icons/eye-icon";
import FaCodeBranch from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";

const cubeClient = ChrisAPIClient.getClient();
const client = new PFDCMClient();

function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void | null>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [delay]);
}

const SeriesCard = ({ series }: { series: any }) => {
  const { state, dispatch } = useContext(PacsQueryContext);
  const oldStep = useRef("");

  const [cubeFiles, setCubeFiles] = useState<any[]>();
  const [fetchNextStatus, setFetchNextStatus] = useState(false);
  const [openSeriesPreview, setOpenSeriesPreview] = useState(false);

  const [progress, setProgress] = useState({
    currentStep: "",
    currentProgress: 0,
    progressText: "",
  });
  const { queryStageForSeries, selectedPacsService } = state;

  const {
    SeriesInstanceUID,
    StudyInstanceUID,
    PatientID,
    SeriesDescription,
    Modality,
    NumberOfSeriesRelatedInstances,
  } = series;

  const queryStage =
    queryStageForSeries && queryStageForSeries[SeriesInstanceUID.value];

  const pullQuery = useMemo(() => {
    return {
      SeriesInstanceUID: SeriesInstanceUID.value,
      StudyInstanceUID: StudyInstanceUID.value,
      PatientID: PatientID.value,
    };
  }, [PatientID.value, SeriesInstanceUID.value, StudyInstanceUID.value]);

  const fetchCubeSeries = useCallback(
    async function fetchCubeSeries() {
      const files = await cubeClient.getPACSFiles({
        ...pullQuery,
        limit: parseInt(NumberOfSeriesRelatedInstances.value),
      });

      const fileItems = files.getItems();

      if (fileItems) {
        setCubeFiles(fileItems);
      }
    },
    [pullQuery, NumberOfSeriesRelatedInstances.value]
  );

  useEffect(() => {
    async function fetchStatusForTheFirstTime() {
      const status = await client.status(pullQuery, selectedPacsService);

      if (status) {
        const { currentStatus } = status;
        dispatch({
          type: Types.SET_QUERY_STAGE_FOR_SERIES,
          payload: {
            SeriesInstanceUID: SeriesInstanceUID.value,
            queryStage: currentStatus.currentStep,
          },
        });

        setProgress(currentStatus);
      }
    }
    fetchStatusForTheFirstTime();
  }, [dispatch, pullQuery, SeriesInstanceUID.value, selectedPacsService]);

  const executeNextStepForTheSeries = async (step: string) => {
    const index = getIndex(step);
    const nextStep = QueryStages[index + 1];

    console.log("NextStep", nextStep);

    if (nextStep === "retrieve") {
      await client.findRetrieve(pullQuery, selectedPacsService);
    }

    if (nextStep === "push") {
      await client.findPush(pullQuery, selectedPacsService);
    }
    if (nextStep === "register") {
      await client.findRegister(pullQuery, selectedPacsService);
    }
  };

  useInterval(async () => {
    if (queryStage !== "completed" && fetchNextStatus) {
      const status = await client.status(pullQuery, selectedPacsService);

      if (status) {
        const { currentStatus } = status;
        setProgress(currentStatus);

        if (
          oldStep.current !== currentStatus.currentStep &&
          currentStatus.currentStep !== "completed"
        ) {
          dispatch({
            type: Types.SET_QUERY_STAGE_FOR_SERIES,
            payload: {
              SeriesInstanceUID: SeriesInstanceUID.value,
              queryStage: currentStatus.currentStep,
            },
          });
          currentStatus.currentStep !== "completed" &&
            executeNextStepForTheSeries(currentStatus.currentStep);
          oldStep.current = currentStatus.currentStep;
        }
      }
    }
  }, 3000);

  let nextQueryStage;
  if (queryStage) {
    const index = getIndex(queryStage);
    nextQueryStage = QueryStages[index + 1];
  }

  const buttonContainer = (
    <div style={{ margin: "auto" }}>
      <Tooltip content="Pull this series to use it in ChRIS">
        {queryStage &&
        queryStage !== "completed" &&
        nextQueryStage &&
        nextQueryStage !== "completed" ? (
          <Button
            variant="secondary"
            style={{ marginBottom: "0.5em", fontSize: "small" }}
            onClick={() => {
              setFetchNextStatus(!fetchNextStatus);
            }}
          >
            <b>{nextQueryStage && nextQueryStage.toUpperCase()}</b>
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              fetchCubeSeries();
            }}
          >
            Fetch the Files
          </Button>
        )}
      </Tooltip>
      <div style={{ fontSize: "smaller", color: "gray" }}>
        {series.NumberOfSeriesRelatedInstances.value}{" "}
        {pluralize("file", series.NumberOfSeriesRelatedInstances.value)}
      </div>
    </div>
  );

  const fileDetailsComponent = (
    <>
      {cubeFiles && (
        <div style={{ marginTop: "-1em", wordWrap: "break-word" }}>
          <FileDetailView
            preview="small"
            selectedFile={
              cubeFiles[
                Math.floor(series.NumberOfSeriesRelatedInstances.value / 2)
              ]
            }
          />

          {openSeriesPreview && (
            <Modal
              style={{
                height: "800px",
              }}
              title="Preview"
              aria-label="viewer"
              isOpen={!!openSeriesPreview}
              onClose={() => setOpenSeriesPreview(false)}
            >
              <FileDetailView
                selectedFile={
                  cubeFiles[
                    Math.floor(series.NumberOfSeriesRelatedInstances.value / 2)
                  ]
                }
                preview="large"
              />
            </Modal>
          )}
        </div>
      )}
      <div
        className="action-button-container hover"
        style={{ display: "flex", flexFlow: "row", flexWrap: "wrap" }}
      >
        <Tooltip content="Click to create a new feed with this series">
          <Button
            variant="primary"
            style={{ fontSize: "small", margin: "auto" }}
            onClick={() => {
              console.log("Clicked");
            }}
          >
            <FaCodeBranch /> <b>Create Feed</b>
          </Button>
        </Tooltip>
        <Button
          variant="secondary"
          style={{ fontSize: "small", margin: "auto" }}
          onClick={() => setOpenSeriesPreview(true)}
        >
          <FaEye /> <b>Preview</b>
        </Button>
      </div>
    </>
  );

  return (
    <>
      <Card isRounded style={{ height: "100%" }}>
        <CardBody>
          <div className="series-actions">
            <div
              style={{ display: "flex", flexDirection: "column" }}
              className="action-button-container"
            >
              {cubeFiles && cubeFiles.length > 0 ? (
                <div>{fileDetailsComponent}</div>
              ) : progress.currentProgress > 0 &&
                progress.currentProgress < 1 ? (
                <div> Processing... </div>
              ) : (
                <>{buttonContainer}</>
              )}
            </div>
          </div>

          <Flex>
            <FlexItem style={{ fontSize: "small" }}>
              <b>{SeriesDescription.value}</b>
            </FlexItem>
            <FlexItem>
              <Badge key={SeriesInstanceUID.value}>{Modality.value}</Badge>
            </FlexItem>
          </Flex>
          <Flex>
            {progress.currentProgress > 0 && progress.currentProgress < 1 && (
              <Progress
                value={progress.currentProgress * 100}
                style={{ gap: "0.5em", textAlign: "left" }}
                title={progress.currentStep.toUpperCase()}
                label={progress.progressText}
                valueText={progress.progressText}
                measureLocation={ProgressMeasureLocation.top}
                size={ProgressSize.sm}
              />
            )}
          </Flex>
        </CardBody>
      </Card>
    </>
  );
};

export default SeriesCard;
