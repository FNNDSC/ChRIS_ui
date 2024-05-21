import { PACSFile, PACSFileList } from "@fnndsc/chrisapi";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  ProgressVariant,
  Skeleton,
  Tooltip,
  pluralize,
} from "@patternfly/react-core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { MainRouterContext } from "../../../routes";
import { DotsIndicator } from "../../Common";
import {
  CodeBranchIcon,
  DownloadIcon,
  LibraryIcon,
  PreviewIcon,
} from "../../Icons";
import FileDetailView from "../../Preview/FileDetailView";
import { PacsQueryContext, Types } from "../context";
import PFDCMClient, { DataFetchQuery } from "../pfdcmClient";
import useSettings from "../useSettings";
import { CardHeaderComponent } from "./SettingsComponents";

async function getPACSData(
  pacsIdentifier: string,
  pullQuery: DataFetchQuery,
  additionalParams = {},
) {
  const cubeClient = ChrisAPIClient.getClient();
  try {
    const data: PACSFileList = await cubeClient.getPACSFiles({
      //@ts-ignore
      pacs_identifier: pacsIdentifier,
      ...pullQuery,
      ...additionalParams,
    });
    return data;
  } catch (error) {
    throw error;
  }
}

const SeriesCardCopy = ({ series }: { series: any }) => {
  const navigate = useNavigate();
  // Load user Preference Data
  const {
    data: userPreferenceData,
    isLoading: userDataLoading,
    isError: userDataError,
  } = useSettings();
  const userPreferences = userPreferenceData?.series;
  const userPreferencesArray = userPreferences && Object.keys(userPreferences);

  const { state, dispatch } = useContext(PacsQueryContext);
  const createFeed = useContext(MainRouterContext).actions.createFeedWithData;
  const { selectedPacsService, pullStudy, preview } = state;
  const client = new PFDCMClient();
  const {
    SeriesInstanceUID,
    StudyInstanceUID,
    NumberOfSeriesRelatedInstances,
  } = series;
  const seriesInstances = parseInt(NumberOfSeriesRelatedInstances.value);
  const studyInstanceUID = StudyInstanceUID.value;
  const seriesInstanceUID = SeriesInstanceUID.value;

  // disable the card completely in this case
  const isDisabled = seriesInstances === 0;
  const [isFetching, setIsFetching] = useState(false);
  const [openSeriesPreview, setOpenSeriesPreview] = useState(false);
  const [isPreviewFileAvailable, setIsPreviewFileAvailable] = useState(false);
  const [timeStamp, setTimeStamp] = useState(
    localStorage.getItem(seriesInstanceUID.value) || "",
  );

  const pullQuery: DataFetchQuery = {
    StudyInstanceUID: studyInstanceUID,
    SeriesInstanceUID: seriesInstanceUID,
  };

  // Handle Retrieve Request and save the timestamp of the request for polling
  const handleRetrieveMutation = useMutation({
    mutationFn: async () => {
      try {
        const data = await client.findRetrieve(selectedPacsService, pullQuery);
        localStorage.setItem(SeriesInstanceUID.value, data);
        // Timestamp data is important for tracking the min_creation_date while polling the backend for files
        setTimeStamp(data);
        // Start polling for files after a successful pfdcm request
        setIsFetching(true);
      } catch (e) {
        // Don't poll if the request fails
        throw e;
      }
    },
  });

  const {
    isPending: retrieveLoading,
    isError: retrieveFetchError,
    error: retrieveErrorMessage,
  } = handleRetrieveMutation;

  // Polling cube files after a successful retrieve request from pfdcm;
  async function fetchCubeFiles() {
    try {
      const middleValue = Math.floor(seriesInstances / 2);

      // Get the total file count current in cube
      const files = await getPACSData(selectedPacsService, pullQuery, {
        limit: 1,
        offset: isPreviewFileAvailable ? middleValue : 0,
      });

      // Setting files to preview
      const fileItems: PACSFile[] = files.getItems() as never as PACSFile[];
      let fileToPreview: PACSFile | null = null;
      if (fileItems) {
        fileToPreview = fileItems[0];
      }

      // Get the series related instance in cube
      const seriesRelatedInstance = await getPACSData(
        "org.fnndsc.oxidicom",
        pullQuery,
        {
          limit: 1,
          ProtocolName: "NumberOfSeriesRelatedInstances",
          min_creation_date: fileToPreview?.data.creation_date || timeStamp,
        },
      );

      const seriesCountCheck = seriesRelatedInstance.getItems();

      let seriesCount = null;
      if (seriesCountCheck && seriesCountCheck.length > 0) {
        seriesCount = +seriesCountCheck[0].data.SeriesDescription;

        if (seriesCount !== seriesInstances) {
          throw new Error(
            "The number of series related instances in cube does not match the number in pfdcm.",
          );
        }
      }

      const pushCountInstance = await getPACSData(
        "org.fnndsc.oxidicom",
        pullQuery,
        {
          limit: 1,
          ProtocolName: "OxidicomAttemptedPushCount",
          min_creation_date: fileToPreview?.data.creation_date || timeStamp,
        },
      );

      const pushCountCheck = pushCountInstance.getItems();
      let pushCount = null;
      if (pushCountCheck && pushCountCheck.length > 0) {
        pushCount = +pushCountCheck[0].data.SeriesDescription;
      }

      const totalFilesCount = files.totalCount;

      if (totalFilesCount >= middleValue) {
        // Pick the middle image of the stack for preview. Set to true if that file is available
        setIsPreviewFileAvailable(true);
      }

      // setting the study instance tracker if pull study is clicked
      if (pullStudy?.[studyInstanceUID]) {
        dispatch({
          type: Types.SET_STUDY_PULL_TRACKER,
          payload: {
            seriesInstanceUID: SeriesInstanceUID.value,
            studyInstanceUID: StudyInstanceUID.value,
            currentProgress: totalFilesCount === seriesInstances,
          },
        });
      }

      if (pushCount && isFetching) {
        // This means oxidicom is done pushing as the push count file is available
        setIsFetching(false);
        // Delete the timestamp from localstorage;
        localStorage.removeItem(SeriesInstanceUID.value);
        // oxidicom is done pushing but the file count in cube is less than the series related instances. Something has behaved.
        if (pushCount && seriesCount && files.totalCount < seriesCount) {
          throw new Error(
            "Failed to retrieve successfully. The total file count does not match the expected series instances. Please try again",
          );
        }
      }

      return {
        fileToPreview,
        totalFilesCount,
      };
    } catch (error) {
      setIsFetching(false);
      throw error;
    }
  }

  const {
    data,
    isPending: filesLoading,
    isError: filesError,
    error: filesErrorMessage,
  } = useQuery({
    queryKey: [SeriesInstanceUID.value, StudyInstanceUID.value],
    queryFn: fetchCubeFiles,
    refetchInterval: () => {
      // Only fetch after a successfull response from pfdcm
      // Decrease polling frequency to avoid overwhelming cube with network requests
      if (isFetching) return 1500;
      return false;
    },
    refetchOnMount: true,
  });

  // Retrieve this series if the pull study is clicked and the series is not already being retrieved.
  useEffect(() => {
    if (pullStudy?.[studyInstanceUID] && !isFetching && !isDisabled) {
      setIsFetching(true);
    }
  }, [pullStudy]);

  // Start polling from where the user left off in case the user refreshed the screen.
  useEffect(() => {
    if (isFetching) return;
    if (
      data &&
      data.totalFilesCount > 0 &&
      data.totalFilesCount !== seriesInstances &&
      !isFetching
    ) {
      setIsFetching(true);
    }
  }, [data]);

  // Error and loading state indicators for retrieving from pfdcm and polling cube for files.
  const isResourceBeingFetched = filesLoading || retrieveLoading;
  const resourceErrorFound = filesError || retrieveFetchError;
  const errorMessages = filesErrorMessage
    ? filesErrorMessage.message
    : retrieveErrorMessage
      ? retrieveErrorMessage.message
      : "";

  const helperText = (
    <HelperText>
      <HelperTextItem variant="error">{errorMessages}</HelperTextItem>
    </HelperText>
  );

  const largeFilePreview = data?.fileToPreview && (
    <Modal
      variant={ModalVariant.large}
      title="Preview"
      aria-label="viewer"
      isOpen={openSeriesPreview}
      onClose={() => setOpenSeriesPreview(false)}
    >
      <FileDetailView preview="large" selectedFile={data.fileToPreview} />
    </Modal>
  );

  const filePreviewButton = (
    <div
      style={{
        display: "flex",
        marginRight: "0.5em",
        marginTop: "1em",
      }}
    >
      <Tooltip content="Create Feed">
        <Button
          style={{ marginRight: "0.25em" }}
          size="sm"
          icon={<CodeBranchIcon />}
          onClick={() => {
            if (data?.fileToPreview) {
              const file = data.fileToPreview;
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
          icon={<PreviewIcon />}
          onClick={() => {
            setOpenSeriesPreview(true);
          }}
          variant="tertiary"
        />
      </Tooltip>

      <Tooltip content="Review the dataset">
        <Button
          size="sm"
          icon={<LibraryIcon />}
          variant="tertiary"
          onClick={() => {
            if (data?.fileToPreview) {
              const pathSplit = data.fileToPreview.data.fname.split("/");
              const url = pathSplit.slice(0, pathSplit.length - 1).join("/");
              navigate(`/library/${url}`);
            }
          }}
        />
      </Tooltip>
    </div>
  );

  const filePreviewLayout = (
    <CardBody style={{ position: "relative", height: "400px" }}>
      <FileDetailView
        preview="large"
        selectedFile={data?.fileToPreview as PACSFile}
      />
      <div className="series-actions">
        <div className="action-button-container">
          <span
            style={{
              marginBottom: "1px",
            }}
          >
            {series.SeriesDescription.value}
          </span>
          {filePreviewButton}
        </div>
      </div>
    </CardBody>
  );

  const retrieveButton = (
    <Button
      variant="tertiary"
      icon={<DownloadIcon />}
      size="sm"
      onClick={() => {
        handleRetrieveMutation.mutate();
      }}
      // Only when the number of series related instances in a series is 0
      isDisabled={isDisabled}
    />
  );

  const rowLayout = (
    <CardHeader
      actions={{
        actions: <CardHeaderComponent resource={series} type="series" />,
      }}
      className="flex-series-container"
    >
      {userDataLoading ? (
        <div className="flex-series-item">
          <Skeleton width="100%" height="100%" />
        </div>
      ) : !userDataError &&
        userPreferences &&
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
              {pluralize(
                +series.NumberOfSeriesRelatedInstances.value,
                "file",
                "files",
              )}
            </div>
          </div>

          <div className="flex-series-item">
            <div>Modality</div>
            <Badge key={series.SeriesInstanceUID.value}>
              {series.Modality.value}
            </Badge>
          </div>

          <div className="flex-series-item">
            <div>Accession Number</div>
            <Tooltip content={series.AccessionNumber.value} position="auto">
              <div className="hide-content">
                <span style={{ marginRight: "0.5em" }}>
                  {series.AccessionNumber.value}
                </span>{" "}
              </div>
            </Tooltip>
          </div>
        </>
      )}

      <div className="flex-series-item steps-container">
        {isResourceBeingFetched && !resourceErrorFound && !data ? (
          <DotsIndicator title="Fetching current status..." />
        ) : data ? (
          <Progress
            className={`retrieve-progress ${
              data.totalFilesCount === seriesInstances && "progress-success"
            } ${
              data.totalFilesCount < seriesInstances &&
              isFetching &&
              "progress-active"
            }`}
            title="Test"
            aria-labelledby="Retrieve Progress"
            value={data.totalFilesCount}
            max={seriesInstances}
            size={ProgressSize.sm}
            helperText={resourceErrorFound ? helperText : ""}
            variant={resourceErrorFound ? ProgressVariant.danger : undefined}
            measureLocation={ProgressMeasureLocation.top}
          />
        ) : (
          resourceErrorFound && (
            <Alert
              style={{ height: "100%" }}
              closable
              type="error"
              message={errorMessages}
              description={<span>{retrieveButton}</span>}
            />
          )
        )}
      </div>

      <div className="flex-series-item button-container">
        {((data && data.totalFilesCount <= 0 && !isFetching) ||
          resourceErrorFound) && (
          <Tooltip content="Retrieve Series">{retrieveButton}</Tooltip>
        )}
        {isFetching && data && data.totalFilesCount < 1 && (
          <DotsIndicator title="Retrieving the series" />
        )}
        {data?.fileToPreview && filePreviewButton}
      </div>
    </CardHeader>
  );

  return (
    <Card
      isDisabled={isDisabled}
      isFlat={true}
      isFullHeight={true}
      isCompact={true}
      isRounded={true}
    >
      {preview && data?.fileToPreview ? filePreviewLayout : rowLayout}
      {data?.fileToPreview && largeFilePreview}
    </Card>
  );
};

export default SeriesCardCopy;
