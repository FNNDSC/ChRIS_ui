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
import { MainRouterContext } from "../../../routes";

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
  const createFeed = useContext(MainRouterContext).actions.createFeedWithData;
  const oldStep = useRef("");

  const [cubeFilePreview, setCubeFilePreview] = useState<any>();
  const [fetchNextStatus, setFetchNextStatus] = useState(false);
  const [openSeriesPreview, setOpenSeriesPreview] = useState(false);

  const [progress, setProgress] = useState({
    currentStep: "",
    progressText: "",
    currentProgress: 0,
  });

  const { queryStageForSeries, selectedPacsService } = state;

  const { currentStep, currentProgress } = progress;

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

  const fetchCubeFilePreview = useCallback(
    async function fetchCubeSeries() {
      const middleValue = Math.floor(
        parseInt(NumberOfSeriesRelatedInstances.value) / 2,
      );

      const files = await cubeClient.getPACSFiles({
        ...pullQuery,
        limit: 1,
        offset: middleValue,
      });

      const fileItems = files.getItems();

      if (fileItems && fileItems.length > 0) {
        setCubeFilePreview(fileItems[0]);
      }
    },
    [pullQuery, NumberOfSeriesRelatedInstances.value],
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

        currentStatus.currentStep === "completed" && fetchCubeFilePreview();
      }
    }
    fetchStatusForTheFirstTime();
  }, [dispatch, pullQuery, SeriesInstanceUID.value, selectedPacsService]);

  const executeNextStepForTheSeries = async (step: string) => {
    const index = getIndex(step);
    const nextStep = QueryStages[index + 1];

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
          oldStep.current !== currentStatus.currentStep ||
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

          currentStatus.currentStep === "completed" &&
            setFetchNextStatus(!fetchNextStatus);

          currentStatus.currentStep === "completed" && fetchCubeFilePreview();
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
      {!currentStep && <div>Fetching current status</div>}

      {currentStep &&
        currentStep !== "completed" &&
        nextQueryStage &&
        currentProgress === 0 && (
          <Button
            variant="secondary"
            onClick={() => {
              setFetchNextStatus(!fetchNextStatus);
            }}
          >
            {nextQueryStage.toUpperCase()}
          </Button>
        )}

      {currentStep !== "completed" &&
        currentProgress > 0 &&
        fetchNextStatus === false && (
          <Button
            variant="secondary"
            onClick={() => {
              setFetchNextStatus(!fetchNextStatus);
            }}
          >
            Continue this step
          </Button>
        )}

      <div style={{ fontSize: "smaller", color: "gray" }}>
        {series.NumberOfSeriesRelatedInstances.value}{" "}
        {pluralize("file", series.NumberOfSeriesRelatedInstances.value)}
      </div>
    </div>
  );

  const fileDetailsComponent = (
    <>
      {cubeFilePreview && (
        <div style={{ marginTop: "-1em", wordWrap: "break-word" }}>
          <FileDetailView preview="small" selectedFile={cubeFilePreview} />

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
              <FileDetailView selectedFile={cubeFilePreview} preview="large" />
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
              if (cubeFilePreview) {
                const file = cubeFilePreview;
                const cubeSeriesPath = file.data.fname
                  .split("/")
                  .slice(0, -1)
                  .join("/");
                createFeed([cubeSeriesPath]);
              }
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

  const handleRetry = async () => {
    dispatch({
      type: Types.SET_QUERY_STAGE_FOR_SERIES,
      payload: {
        SeriesInstanceUID: SeriesInstanceUID.value,
        queryStage: "none",
      },
    });

    await client.findRetrieve(pullQuery, selectedPacsService);
    await client.findPush(pullQuery, selectedPacsService);
    await client.findRegister(pullQuery, selectedPacsService);

    oldStep.current = "none";
    setFetchNextStatus(true);
  };

  const showProcessingWithButton =
    (currentProgress > 0 && fetchNextStatus) ||
    (fetchNextStatus && currentStep !== "completed");

  return (
    <>
      <Card isRounded style={{ height: "100%" }}>
        <CardBody>
          <div className="series-actions">
            <div
              style={{ display: "flex", flexDirection: "column" }}
              className="action-button-container"
            >
              {cubeFilePreview ? (
                <div>{fileDetailsComponent}</div>
              ) : showProcessingWithButton ? (
                <div>Processing...</div>
              ) : (
                <div>{buttonContainer} </div>
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
          <Flex
            direction={{
              default: "column",
            }}
          >
            <FlexItem
              style={{
                marginTop: "1em",
              }}
            >
              {progress.currentProgress > 0 && (
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
            </FlexItem>

            {!cubeFilePreview && (
              <FlexItem style={{ marginTop: "1em" }}>
                <Button onClick={handleRetry} variant="secondary">
                  Retry all steps
                </Button>
              </FlexItem>
            )}
          </Flex>
        </CardBody>
      </Card>
    </>
  );
};

export default SeriesCard;
