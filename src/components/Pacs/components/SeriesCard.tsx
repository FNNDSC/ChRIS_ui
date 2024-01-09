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
  CardBody,
  CardHeader,
  Button,
  Badge,
  Modal,
  Tooltip,
} from "@patternfly/react-core";

import FileDetailView from "../../Preview/FileDetailView";
import { DotsIndicator } from "../../Common";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { PacsQueryContext, Types } from "../context";
import PFDCMClient from "../pfdcmClient";
import { QueryStages, getIndex } from "../context";
import FaEye from "@patternfly/react-icons/dist/esm/icons/eye-icon";
import FaBranch from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";
import { Alert } from "antd";
import { pluralize } from "../../../api/common";
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
  const [isFetching, setIsFetching] = useState(false);

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
        parseInt(NumberOfSeriesRelatedInstances.value) / 2,
      );

      console.log("middleValue", middleValue)

      const cubeClient = ChrisAPIClient.getClient();

      const files = await cubeClient.getPACSFiles({
        ...pullQuery,
        limit: 1,
        offset: middleValue,
      });
      console.log("Files", files)

      const fileItems = files.getItems();

      if (fileItems && fileItems.length > 0) {
        setCubeFilePreview(fileItems[0]);
      } else {
        setError("Files are not available in storage");
      }
    },
    [pullQuery, NumberOfSeriesRelatedInstances.value],
  );

  useEffect(() => {
    if (preview && cubeFilePreview) {
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
  }, [
    preview,
    cubeFilePreview,
    SeriesInstanceUID.value,
    seriesPreviews,
    dispatch,
  ]);

  useEffect(() => {
    async function fetchStatusForTheFirstTime() {
      const stepperStatus = await client.stepperStatus(
        pullQuery,
        selectedPacsService,
        NumberOfSeriesRelatedInstances.value,
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

      progress.currentStep === "completed" && (await fetchCubeFilePreview());
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

  useInterval(
    async () => {
      console.log("USE INTERVAL:");
      if (fetchNextStatus && !isFetching) {
        setIsFetching(true);
        try {
          const stepperStatus = await client.stepperStatus(
            pullQuery,
            selectedPacsService,
            NumberOfSeriesRelatedInstances.value,
            true,
          );

          const { newImageStatus, progress } = stepperStatus;
          const { currentStep, currentProgress } = progress;

          setStepperStatus(newImageStatus as StepProps[]);
          setProgress(progress);

          if (!requestCounter[currentStep]) {
            setRequestCounter({
              ...requestCounter,
              [currentStep]: 1,
            });
          }

          if (
            requestCounter[currentStep] === 1 &&
            (currentProgress === 0 || currentProgress === 1)
          ) {
            const index = getIndex(currentStep);
            const nextStep = QueryStages[index + 1];
            currentStep !== "completed" &&
              executeNextStepForTheSeries(nextStep);
            dispatch({
              type: Types.SET_QUERY_STAGE_FOR_SERIES,
              payload: {
                SeriesInstanceUID: SeriesInstanceUID.value,
                queryStage: currentStep,
              },
            });
          }

          if (currentStep === "completed") {
            await fetchCubeFilePreview();
            setFetchNextStatus(!fetchNextStatus);
            setIsFetching(false);
          }
        } catch (error) {
          // Handle error if needed
          setIsFetching(false);
          setFetchNextStatus(!fetchNextStatus);
        } finally {
          setIsFetching(false);
        }
      }
    },
    fetchNextStatus ? 3000 : null,
  );

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
            className="button-with-margin"
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
            className="button-with-margin"
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

  const filePreviewButton = (
    <>
      <Tooltip content="Create Feed">
        <Button
          style={{ marginRight: "0.25em" }}
          size="sm"
          icon={<FaBranch />}
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
          variant="tertiary"
        ></Button>
      </Tooltip>

      <Tooltip content="See a Preview">
        <Button
          style={{ marginRight: "0.25em" }}
          size="sm"
          className="button-with-margin"
          icon={<FaEye />}
          onClick={() => setOpenSeriesPreview(true)}
          variant="tertiary"
        ></Button>
      </Tooltip>

      <Tooltip content="Review the dataset">
        <Button
          size="sm"
          icon={<LibraryIcon />}
          variant="tertiary"
          onClick={() => {
            const pathSplit = cubeFilePreview.data.fname.split("/");
            const url = pathSplit.slice(0, pathSplit.length - 1).join("/");
            navigate(`/library/${url}`);
          }}
        ></Button>
      </Tooltip>
    </>
  );

  
  const rowLayout = (
    <CardHeader className="flex-series-container">
      <div className="flex-series-item">
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

        <div>
          {series.NumberOfSeriesRelatedInstances.value}{" "}
          {pluralize(
            "file",
            +series.NumberOfSeriesRelatedInstances.value,
          )}
        </div>
      </div>

      <div className="flex-series-item">
        <Badge key={SeriesInstanceUID.value}>{Modality.value}</Badge>
      </div>

      <div className="flex-series-item steps-container ">
        {stepperStatus.length > 0 ? (
          <Steps size="small" items={stepperStatus} />
        ) : (
          <DotsIndicator title="Fetching Status..." />
        )}
      </div>

      <div className="flex-series-item button-container">
        {!showProcessingWithButton && buttonContainer}{" "}
        {cubeFilePreview && filePreviewButton}
      </div>
    </CardHeader>
  );

  const filePreviewLayout = (
    <CardBody style={{ height: "350px" }}>
      <FileDetailView preview="small" selectedFile={cubeFilePreview} />
      <div className="series-actions">
        <div className="action-button-container hover">{filePreviewButton}</div>
      </div>
    </CardBody>
  );

  const LargeFilePreview = (
    <Modal
      style={{ height: "800px" }}
      title="Preview"
      aria-label="viewer"
      isOpen={openSeriesPreview}
      onClose={() => setOpenSeriesPreview(false)}
    >
      <FileDetailView preview="large" selectedFile={cubeFilePreview} />
    </Modal>
  );

  return (
    <>
      {error && (
        <Alert
          type="error"
          message="An Error was found"
          description={error}
          closable
          onClose={() => setError("")}
        ></Alert>
      )}

      <Card isRounded isSelectable>
        {preview && seriesPreviews && seriesPreviews[SeriesInstanceUID.value]
          ? filePreviewLayout
          : rowLayout}
        {cubeFilePreview && LargeFilePreview}
      </Card>
    </>
  );
};

export default SeriesCard;
