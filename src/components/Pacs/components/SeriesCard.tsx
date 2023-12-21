import {
  useRef,
  useEffect,
  useContext,
  useCallback,
  useState,
  useMemo,
} from "react";
import { useNavigate } from "react-router";
import {
  Card,
  Flex,
  FlexItem,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Progress,
  ProgressSize,
  Modal,
  Tooltip,
  ProgressMeasureLocation,
  Text,
} from "@patternfly/react-core";
import pluralize from "pluralize";
import FileDetailView from "../../Preview/FileDetailView";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { PacsQueryContext } from "../context";
import PFDCMClient from "../pfdcmClient";
import { Types } from "../context/index";
import { QueryStages, getIndex } from "../context";
import FaEye from "@patternfly/react-icons/dist/esm/icons/eye-icon";
import RedoIcon from "@patternfly/react-icons/dist/esm/icons/redo-icon";
import FaCodeBranch from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";
import LibraryIcon from "@patternfly/react-icons/dist/esm/icons/database-icon";
import { MainRouterContext } from "../../../routes";

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
  const navigate = useNavigate();
  const { state, dispatch } = useContext(PacsQueryContext);
  const createFeed = useContext(MainRouterContext).actions.createFeedWithData;

  const [cubeFilePreview, setCubeFilePreview] = useState<any>();
  const [fetchNextStatus, setFetchNextStatus] = useState(false);
  const [openSeriesPreview, setOpenSeriesPreview] = useState(false);
  const [error, setError] = useState("");

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
        parseInt(NumberOfSeriesRelatedInstances.value) / 2
      );

      const cubeClient = ChrisAPIClient.getClient();

      const files = await cubeClient.getPACSFiles({
        ...pullQuery,
        limit: 1,
        offset: middleValue,
      });

      const fileItems = files.getItems();

      if (fileItems && fileItems.length > 0) {
        setCubeFilePreview(fileItems[0]);
      } else {
        setError("Files are not available in storage");
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
        currentStatus.currentStep === "completed" && fetchCubeFilePreview();
      }
    }
    fetchStatusForTheFirstTime();
  }, [
    fetchCubeFilePreview,
    dispatch,
    pullQuery,
    SeriesInstanceUID.value,
    selectedPacsService,
  ]);

  const executeNextStepForTheSeries = async (nextStep: string) => {
    try {
      if (nextStep === "retrieve") {
        await client.findRetrieve(pullQuery, selectedPacsService);
      }

      if (nextStep === "push") {
        await client.findPush(pullQuery, selectedPacsService);
      }
      if (nextStep === "register") {
        await client.findRegister(pullQuery, selectedPacsService);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  useInterval(async () => {
    if (fetchNextStatus) {
      const status = await client.status(pullQuery, selectedPacsService);

      if (status) {
        const { currentStatus } = status;
        setProgress(currentStatus);

        if (status.currentStatus.currentProgress === 1) {
          dispatch({
            type: Types.SET_QUERY_STAGE_FOR_SERIES,
            payload: {
              SeriesInstanceUID: SeriesInstanceUID.value,
              queryStage: currentStatus.currentStep,
            },
          });

          const index = getIndex(currentStatus.currentStep);
          const nextStep = QueryStages[index + 1];
          currentStatus.currentStep !== "completed" &&
            executeNextStepForTheSeries(nextStep);
          currentStatus.currentStep === "completed" &&
            setFetchNextStatus(!fetchNextStatus);
          currentStatus.currentStep === "completed" && fetchCubeFilePreview();
        }
      }
    }
  }, 3000);

  let nextQueryStage;
  if (queryStage) {
    const index = getIndex(queryStage);
    nextQueryStage = QueryStages[index + 1];
  }

  const pluralizedFileLength = (
    <div style={{ fontSize: "smaller", color: "gray" }}>
      {series.NumberOfSeriesRelatedInstances.value}{" "}
      {pluralize("file", series.NumberOfSeriesRelatedInstances.value)}
    </div>
  );

  function continueNextStep(currentStep: string) {
    executeNextStepForTheSeries(currentStep);
    setFetchNextStatus(!fetchNextStatus);
  }

  const buttonContainer = (
    <div style={{ margin: "auto" }}>
      {!currentStep && <Text>Fetching current status...</Text>}

      {currentStep &&
        currentStep !== "completed" &&
        nextQueryStage &&
        currentProgress === 0 && (
          <Button
            variant="secondary"
            onClick={() => {
              if (currentStep !== "completed") {
                const index = getIndex(currentStep);
                const nextStep = QueryStages[index + 1];
                continueNextStep(nextStep);
              }
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
      {pluralizedFileLength}
    </div>
  );

  const fileDetailsComponent = (
    <>
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

      <div
        className="action-button-container hover"
        style={{ display: "flex", flexFlow: "row", flexWrap: "wrap" }}
      >
        <Tooltip content="Click to create a new feed with this series">
          <Button
            icon={<FaCodeBranch />}
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
            <b>Create Feed</b>
          </Button>
        </Tooltip>
        <Button
          icon={<FaEye />}
          variant="secondary"
          style={{ fontSize: "small", margin: "auto" }}
          onClick={() => setOpenSeriesPreview(true)}
        >
          <b>Preview</b>
        </Button>

        <Button
          icon={<LibraryIcon />}
          variant="secondary"
          style={{ fontSize: "small", margin: "auto" }}
          onClick={() => {
            const pathSplit = cubeFilePreview.data.fname.split("/");
            const url = pathSplit.slice(0, pathSplit.length - 1).join("/");
            navigate(`/library/${url}`);
          }}
        >
          <b>Go to Library</b>
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
    setError("");
    await client.findRetrieve(pullQuery, selectedPacsService);
    await client.findPush(pullQuery, selectedPacsService);
    await client.findRegister(pullQuery, selectedPacsService);
    setFetchNextStatus(true);
  };

  const showProcessingWithButton =
    (currentProgress > 0 && fetchNextStatus) ||
    (fetchNextStatus && currentStep !== "completed");

  return (
    <>
      <Card isRounded style={{ height: "100%" }}>
        <CardHeader
          style={{ zIndex: "999", margin: "0 auto", display: "flex" }}
        >
          <div
            style={{
              marginRight: "1em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {SeriesDescription.value.length > 20 ? (
              <Tooltip content={SeriesDescription.value}>
                <Text
                  style={{ color: cubeFilePreview ? "white" : "inherit" }}
                >{`${SeriesDescription.value.slice(0, 20)}...`}</Text>
              </Tooltip>
            ) : (
              <Text style={{ color: cubeFilePreview ? "white" : "inherit" }}>
                {SeriesDescription.value}
              </Text>
            )}
          </div>
          <div>
            <Badge key={SeriesInstanceUID.value}>{Modality.value}</Badge>
          </div>
        </CardHeader>
        <CardBody
          style={{
            padding: "0.25rem",
            height: "16em",
          }}
        >
          {cubeFilePreview && (
            <FileDetailView preview="small" selectedFile={cubeFilePreview} />
          )}

          <div className="series-actions">
            <div
              style={{ display: "flex", flexDirection: "column" }}
              className="action-button-container"
            >
              {cubeFilePreview ? (
                <div>{fileDetailsComponent}</div>
              ) : error ? (
                <>
                  <Text style={{ color: "#C9190B" }}>{error} </Text>
                  {pluralizedFileLength}
                </>
              ) : showProcessingWithButton ? (
                <Text>
                  {" "}
                  {currentStep === "none"
                    ? "Processing..."
                    : `Processing ${currentStep}...`}
                </Text>
              ) : (
                <div>{buttonContainer} </div>
              )}
            </div>
          </div>

          <Flex
            direction={{
              default: "column",
            }}
            alignItems={{
              default: "alignItemsCenter",
            }}
          >
            <FlexItem>
              {progress.currentProgress > 0 &&
                progress.currentStep !== "completed" && (
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
              <FlexItem style={{ marginTop: "1em", justifyContent: "center" }}>
                <Tooltip content={"Retry all the steps if processing is stuck"}>
                  <Button
                    icon={<RedoIcon />}
                    onClick={handleRetry}
                    variant="link"
                  />
                </Tooltip>
              </FlexItem>
            )}
          </Flex>
        </CardBody>
      </Card>
    </>
  );
};

export default SeriesCard;
