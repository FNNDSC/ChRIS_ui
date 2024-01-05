import {
  useRef,
  useEffect,
  useContext,
  useCallback,
  useState,
  useMemo,
} from "react";
import { Steps, StepProps } from "antd";
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
import { PacsQueryContext, Types } from "../context";
import { DotsIndicator } from "../../Common";
import PFDCMClient from "../pfdcmClient";

import { QueryStages, getIndex } from "../context";
import FaEye from "@patternfly/react-icons/dist/esm/icons/eye-icon";
import RedoIcon from "@patternfly/react-icons/dist/esm/icons/redo-icon";
import FaCodeBranch from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";
import LibraryIcon from "@patternfly/react-icons/dist/esm/icons/database-icon";
import { MainRouterContext } from "../../../routes";
import { formatStudyDate } from "./utils";

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
  const [stepperStatus, setStepperStatus] = useState<StepProps[]>([]);
  const [progress, setProgress] = useState({
    currentStep: "none",
    currentProgress: 0,
  });
  const { queryStageForSeries, selectedPacsService, preview, seriesPreviews } =
    state;
  const { currentStep, currentProgress } = progress;
  const [requestCounter, setRequestCounter] = useState<{
    [key: string]: number;
  }>({});

  const {
    SeriesInstanceUID,
    StudyInstanceUID,
    SeriesDescription,
    Modality,
    NumberOfSeriesRelatedInstances,
    AccessionNumber,
  } = series;

  const queryStage =
    queryStageForSeries && queryStageForSeries[SeriesInstanceUID.value];

  const pullQuery = useMemo(() => {
    return {
      SeriesInstanceUID: SeriesInstanceUID.value,
      StudyInstanceUID: StudyInstanceUID.value,
      AccessionNumber: AccessionNumber.value,
    };
  }, [AccessionNumber.value, SeriesInstanceUID.value, StudyInstanceUID.value]);

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
    if (preview && cubeFilePreview) {
      // rejiggle layout's
      dispatch({
        type: Types.SET_SERIES_PREVIEWS,
        payload: {
          seriesID: SeriesInstanceUID.value,
          preview: true,
        },
      });
    } else if (preview === false && Object.keys(seriesPreviews).length > 0) {
      dispatch({
        type: Types.RESET_SERIES_PREVIEWS,
        payload: {
          clearSeriesPreview: true,
        },
      });
    }
  }, [preview, cubeFilePreview]);

  useEffect(() => {
    async function fetchStatusForTheFirstTime() {
      const stepperStatus = await client.stepperStatus(
        pullQuery,
        selectedPacsService,
        NumberOfSeriesRelatedInstances.value
      );

      const { newImageStatus, progress } = stepperStatus;
      setStepperStatus(newImageStatus as StepProps[]);
      setProgress(progress);

      dispatch({
        type: Types.SET_QUERY_STAGE_FOR_SERIES,
        payload: {
          SeriesInstanceUID: SeriesInstanceUID.value,
          queryStage: progress.currentStep,
        },
      });

      progress.currentStep === "completed" && fetchCubeFilePreview();
    }

    fetchStatusForTheFirstTime();
  }, [
    fetchCubeFilePreview,
    dispatch,
    pullQuery,
    SeriesInstanceUID.value,
    selectedPacsService,
    NumberOfSeriesRelatedInstances.value,
  ]);

  const executeNextStepForTheSeries = async (nextStep: string) => {
    console.log("ExecuteStepForNextSeries");

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
      const stepperStatus = await client.stepperStatus(
        pullQuery,
        selectedPacsService,
        NumberOfSeriesRelatedInstances.value
      );

      const { newImageStatus, progress } = stepperStatus;
      const { currentStep, currentProgress } = progress;
      setStepperStatus(newImageStatus as StepProps[]);
      setProgress(progress);

      if (!(requestCounter[currentStep] > 2)) {
        setRequestCounter({
          ...requestCounter,
          [currentStep]: requestCounter[currentStep]
            ? requestCounter[currentStep] + 1
            : 1,
        });
      }

      if (
        requestCounter[currentStep] === 1 &&
        (currentProgress === 0 || currentProgress === 1)
      ) {
        const index = getIndex(currentStep);
        const nextStep = QueryStages[index + 1];
        currentStep !== "completed" && executeNextStepForTheSeries(nextStep);
        dispatch({
          type: Types.SET_QUERY_STAGE_FOR_SERIES,
          payload: {
            SeriesInstanceUID: SeriesInstanceUID.value,
            queryStage: currentStep,
          },
        });
      }

      currentStep === "completed" && setFetchNextStatus(!fetchNextStatus);
      currentStep === "completed" && fetchCubeFilePreview();
    }
  }, 4000);

  let nextQueryStage;
  if (queryStage) {
    const index = getIndex(queryStage);
    nextQueryStage = QueryStages[index + 1];
  }

  const showProcessingWithButton =
    (currentProgress > 0 && fetchNextStatus) ||
    (fetchNextStatus && currentStep !== "completed");

  const buttonContainer = (
    <>
      {currentStep &&
        currentStep !== "completed" &&
        nextQueryStage &&
        currentProgress === 0 && (
          <Button
            size="sm"
            variant="primary"
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
            variant="primary"
            size="sm"
            onClick={() => {
              setFetchNextStatus(!fetchNextStatus);
            }}
          >
            Continue this step
          </Button>
        )}
    </>
  );

  /*

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

   const showProcessingWithButton =
    (currentProgress > 0 && fetchNextStatus) ||
    (fetchNextStatus && currentStep !== "completed");

*/

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

  /*

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

            <FlexItem>
              <Steps size='small' items={stepperStatus} />
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    </>
  );
*/

  const rowLayout = (
    <CardHeader>
      <div style={{ flex: "1 1 15%", maxWidth: "15%" }}>
        <Tooltip content={SeriesDescription.value} position="auto">
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <b style={{ marginRight: "0.5em" }}>{SeriesDescription.value}</b>{" "}
          </div>
        </Tooltip>

        <div>{series.NumberOfSeriesRelatedInstances.value} files, on </div>
      </div>

      <div style={{ flex: "1 1 10%", maxWidth: "10%" }}>
        <Badge key={SeriesInstanceUID.value}>{Modality.value}</Badge>
      </div>

      <div style={{ flex: "1 1 40%", maxWidth: "40%" }}>
        <Steps size="small" items={stepperStatus} />
      </div>

      <div style={{ flex: "1 1 10%", maxWidth: "10%", marginLeft: "1rem" }}>
        {!showProcessingWithButton && buttonContainer}
      </div>
    </CardHeader>
  );

  const filePreviewLayout = (
    <CardBody>
      <FileDetailView preview="small" selectedFile={cubeFilePreview} />
      <div className="series-actions">
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
          <Button
            icon={<FaEye />}
            variant="secondary"
            style={{ fontSize: "small", margin: "auto" }}
            onClick={() => setOpenSeriesPreview(true)}
          >
            <b>Preview</b>
          </Button>
        </div>
      </div>
    </CardBody>
  );

  return (
    <Card isRounded isSelectable>
      {preview && seriesPreviews && seriesPreviews[SeriesInstanceUID.value]
        ? filePreviewLayout
        : rowLayout}
    </Card>
  );
};

export default SeriesCard;
