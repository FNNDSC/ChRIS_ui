import { useEffect, useContext, useCallback, useState, useMemo } from "react";
import { Steps, Alert } from "antd";
import { useNavigate } from "react-router";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Modal,
  Tooltip,
  Skeleton,
  ModalVariant,
} from "@patternfly/react-core";
import FileDetailView from "../../Preview/FileDetailView";
import { DotsIndicator } from "../../Common";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { PacsQueryContext, Types } from "../context";
import { CardHeaderComponent } from "./SettingsComponents";
import PFDCMClient, {
  type DataFetchQuery,
  type ImageStatusType,
} from "../pfdcmClient";
import { QueryStages, getIndex } from "../context";
import FaEye from "@patternfly/react-icons/dist/esm/icons/eye-icon";
import FaBranch from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";
import { pluralize } from "../../../api/common";
import LibraryIcon from "@patternfly/react-icons/dist/esm/icons/database-icon";
import { MainRouterContext } from "../../../routes";
import useInterval from "./useInterval";
import useSettings from "../useSettings";

const client = new PFDCMClient();

const SeriesCard = ({ series }: { series: any }) => {
  const {
    SeriesInstanceUID,
    StudyInstanceUID,
    NumberOfSeriesRelatedInstances,
    AccessionNumber,
  } = series;
  const { data, isLoading, error: queryError } = useSettings();
  const navigate = useNavigate();
  const { state, dispatch } = useContext(PacsQueryContext);
  const createFeed = useContext(MainRouterContext).actions.createFeedWithData;
  const [cubeFilePreview, setCubeFilePreview] = useState<any>();
  const [fetchNextStatus, setFetchNextStatus] = useState(false);
  const [openSeriesPreview, setOpenSeriesPreview] = useState(false);
  const [error, setError] = useState("");
  const [stepperStatus, setStepperStatus] = useState<ImageStatusType[]>([]);
  const [currentProgressStep, setCurrentProgressStep] = useState({
    currentStep: "none",
    currentProgress: 0,
  });

  const {
    seriesUpdate,
    selectedPacsService,
    preview,
    seriesPreviews,
    pullStudy,
  } = state;

  const userPreferences = data?.series;

  const { currentStep, currentProgress } = currentProgressStep;

  const [requestCounter, setRequestCounter] = useState<{
    [key: string]: number;
  }>({});
  const [isFetching, setIsFetching] = useState(false);

  const queryStage =
    (seriesUpdate &&
      Object.keys(seriesUpdate).length > 0 &&
      seriesUpdate[StudyInstanceUID.value] &&
      seriesUpdate[StudyInstanceUID.value][SeriesInstanceUID.value]) ||
    "none";

  const pullQuery: DataFetchQuery = useMemo(() => {
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

      const cubeClient = ChrisAPIClient.getClient();

      try {
        const files = await cubeClient.getPACSFiles({
          ...pullQuery,
          limit: 1,
          offset: middleValue,
        });

        const fileItems = files.getItems();

        if (fileItems && fileItems.length > 0) {
          setCubeFilePreview(fileItems[0]);
        }
      } catch {
        setError("Could not fetch this file from storage");
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
    } else if (
      preview === false &&
      seriesPreviews &&
      Object.keys(seriesPreviews).length > 0
    ) {
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
        SeriesInstanceUID.value,
        NumberOfSeriesRelatedInstances.value,
        false,
      );

      const status = stepperStatus.get(SeriesInstanceUID.value);

      if (status) {
        const { progress, newImageStatus } = status;
        setStepperStatus(newImageStatus);
        setCurrentProgressStep(progress);

        dispatch({
          type: Types.SET_SERIES_UPDATE,
          payload: {
            currentStep: progress.currentStep,
            seriesInstanceUID: SeriesInstanceUID.value,
            studyInstanceUID: StudyInstanceUID.value,
          },
        });

        progress.currentStep === "completed" && (await fetchCubeFilePreview());
      }
    }

    if (pullStudy) {
      setFetchNextStatus(true);
    } else {
      fetchStatusForTheFirstTime();
    }
  }, [
    fetchCubeFilePreview,
    dispatch,
    pullQuery,
    SeriesInstanceUID.value,
    StudyInstanceUID.value,
    selectedPacsService,
    NumberOfSeriesRelatedInstances.value,
    pullStudy,
  ]);

  const executeNextStepForTheSeries = async (nextStep: string) => {
    try {
      if (nextStep === "retrieve") {
        await client.findRetrieve(selectedPacsService, pullQuery);
      }

      if (nextStep === "push") {
        await client.findPush(selectedPacsService, pullQuery);
      }
      if (nextStep === "register") {
        await client.findRegister(selectedPacsService, pullQuery);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  function setSeriesUpdate(step: string) {
    dispatch({
      type: Types.SET_SERIES_UPDATE,
      payload: {
        currentStep: step,
        seriesInstanceUID: SeriesInstanceUID.value,
        studyInstanceUID: series.StudyInstanceUID.value,
      },
    });
  }

  useInterval(
    async () => {
      if (fetchNextStatus && !isFetching) {
        setIsFetching(true);

        try {
          const stepperStatus = await client.stepperStatus(
            pullQuery,
            selectedPacsService,
            SeriesInstanceUID.value,
            NumberOfSeriesRelatedInstances.value,
            currentStep === "none" ? true : false,
          );

          const status = stepperStatus.get(SeriesInstanceUID.value);

          if (status) {
            const { progress, newImageStatus } = status;
            const { currentStep, currentProgress } = progress;

            setStepperStatus(newImageStatus);
            setCurrentProgressStep(progress);

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
              setSeriesUpdate(nextStep);
            }

            if (currentStep === "completed") {
              setSeriesUpdate(currentStep);
              await fetchCubeFilePreview();
              setFetchNextStatus(!fetchNextStatus);
              setIsFetching(false);
            }
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
    fetchNextStatus && pullStudy ? 5000 : fetchNextStatus ? 3000 : null,
  );

  let nextQueryStage = "";
  if (queryStage) {
    const index = getIndex(queryStage);
    nextQueryStage = QueryStages[index + 1];
  }

  const showProcessingWithButton =
    stepperStatus.length > 0 &&
    ((currentProgress > 0 && fetchNextStatus) ||
      (fetchNextStatus && currentStep !== "completed"));

  const buttonContainer = (
    <>
      {currentStep &&
        currentStep !== "completed" &&
        nextQueryStage &&
        currentProgress === 0 &&
        stepperStatus.length > 0 && (
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
        />
      </Tooltip>

      <Tooltip content="See a Preview">
        <Button
          style={{ marginRight: "0.25em" }}
          size="sm"
          icon={<FaEye />}
          onClick={() => setOpenSeriesPreview(true)}
          variant="tertiary"
        />
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
        />
      </Tooltip>
    </>
  );

  const userPreferencesArray = userPreferences && Object.keys(userPreferences);

  const rowLayout = (
    <CardHeader
      actions={{
        actions: <CardHeaderComponent resource={series} type="series" />,
      }}
      className="flex-series-container"
    >
      {isLoading ? (
        <div className="flex-series-item">
          <Skeleton width="100%" height="100%" />{" "}
        </div>
      ) : queryError ? (
        <Alert type="error" description="Please refresh the page..." />
      ) : userPreferences &&
        userPreferencesArray &&
        userPreferencesArray.length > 0 ? (
        userPreferencesArray.map((key: string) => (
          <div key={key} className="flex-series-item">
            <div className="study-detail-title hide-content">
              <span style={{ marginRight: "0.5em" }}>{key} </span>
            </div>
            <Tooltip content={series[key].value} position="auto">
              <div className="hide-content">
                {series[key] ? series[key].value : "N/A"}
              </div>
            </Tooltip>
          </div>
        ))
      ) : (
        <>
          <div className="flex-series-item">
            <Tooltip content={series.SeriesDescription.value} position="auto">
              <div className="hide-content">
                <span style={{ marginRight: "0.5em" }}>
                  {series.SeriesDescription.value}
                </span>{" "}
              </div>
            </Tooltip>

            <div>
              {series.NumberOfSeriesRelatedInstances.value}{" "}
              {pluralize("file", +series.NumberOfSeriesRelatedInstances.value)}
            </div>
          </div>

          <div className="flex-series-item">
            <div>Modality</div>
            <Badge key={series.SeriesInstanceUID.value}>
              {series.Modality.value}
            </Badge>
          </div>
        </>
      )}

      <div className="flex-series-item steps-container">
        {stepperStatus.length > 0 ? (
          //@ts-ignore
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

  const largeFilePreview = (
    <Modal
      variant={ModalVariant.large}
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
        />
      )}

      <Card isRounded>
        {preview && seriesPreviews && seriesPreviews[SeriesInstanceUID.value]
          ? filePreviewLayout
          : rowLayout}
        {cubeFilePreview && largeFilePreview}
      </Card>
    </>
  );
};

export default SeriesCard;
