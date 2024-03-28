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
import { useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import ChrisAPIClient from "../../../api/chrisapiclient";
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
import { MainRouterContext } from "../../../routes";

async function getPACSData(
  pacsIdentifier: string,
  pullQuery: DataFetchQuery,
  additionalParams = {},
) {
  const cubeClient = ChrisAPIClient.getClient();
  try {
    const data: PACSFileList = await cubeClient.getPACSFiles({
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
  const { data: userData, isLoading, error: queryError } = useSettings();
  const { state, dispatch } = useContext(PacsQueryContext);
  const createFeed = useContext(MainRouterContext).actions.createFeedWithData;
  const { selectedPacsService, pullStudy, preview } = state;
  const client = new PFDCMClient();
  const {
    SeriesInstanceUID,
    StudyInstanceUID,
    NumberOfSeriesRelatedInstances,
  } = series;
  const [isFetching, setIsFetching] = useState(false);
  const [openSeriesPreview, setOpenSeriesPreview] = useState(false);
  const [isPreviewFileAvailable, setIsPreviewFileAvailable] = useState(false);

  const seriesInstances = parseInt(NumberOfSeriesRelatedInstances.value);

  const pullQuery: DataFetchQuery = useMemo(() => {
    return {
      SeriesInstanceUID: SeriesInstanceUID.value,
    };
  }, [SeriesInstanceUID.value]);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["pacsFiles", SeriesInstanceUID.value],
    queryFn: fetchCubeFiles,
    refetchInterval: () => {
      if (isFetching) return 500;
      return false;
    },
    refetchOnMount: true,
  });

  useEffect(() => {
    if (pullStudy && !isFetching) {
      handleRetrieve();
    }
  }, [pullStudy]);

  useEffect(() => {
    if (
      data &&
      data.totalFilesCount > 0 &&
      data.totalFilesCount !== seriesInstances &&
      !isFetching
    ) {
      setIsFetching(true);
    }
  }, [data]);

  async function fetchCubeFiles() {
    try {
      const middleValue = Math.floor(seriesInstances / 2);
      const files = await getPACSData(selectedPacsService, pullQuery, {
        limit: 1,
        offset: isPreviewFileAvailable ? middleValue : 0,
      });

      const seriesRelatedInstance = await getPACSData(
        "org.fnndsc.oxidicom",
        pullQuery,
        {
          limit: 1,
          ProtocolName: "NumberOfSeriesRelatedInstances",
        },
      );

      const pushCountInstance = await getPACSData(
        "org.fnndsc.oxidicom",
        pullQuery,
        {
          limit: 1,
          ProtocolName: "OxidicomAttemptedPushCount",
        },
      );

      const seriesCountCheck = seriesRelatedInstance.getItems();
      const pushCountCheck = pushCountInstance.getItems();

      if (seriesCountCheck && seriesCountCheck.length > 0) {
        const seriesCount = +seriesCountCheck[0].data.SeriesDescription;

        if (seriesCount !== seriesInstances) {
          throw new Error(
            "The number of series related instances in cube does not match the number in pfdcm.",
          );
        }
      }

      if (pushCountCheck && pushCountCheck.length > 0) {
        const pushCount = +pushCountCheck[0].data.SeriesDescription;

        if (pushCount !== seriesInstances) {
          throw new Error(
            "The attempted push count does not match the number of series related instances.",
          );
        }
      }

      const fileItems: PACSFile[] = files.getItems() as never as PACSFile[];
      let fileToPreview: PACSFile | null = null;
      if (fileItems) {
        fileToPreview = fileItems[0];
      }

      const totalFilesCount = files.totalCount;

      if (totalFilesCount >= middleValue) {
        // Preview is the middle image of the stack
        setIsPreviewFileAvailable(true);
      }

      if (pullStudy) {
        dispatch({
          type: Types.SET_STUDY_PULL_TRACKER,
          payload: {
            seriesInstanceUID: SeriesInstanceUID.value,
            studyInstanceUID: StudyInstanceUID.value,
            currentProgress: totalFilesCount === seriesInstances,
          },
        });
      }

      if (totalFilesCount === seriesInstances && isFetching) {
        setIsFetching(false);
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

  const handleRetrieve = async () => {
    await client.findRetrieve(selectedPacsService, pullQuery);
    setIsFetching(true);
  };

  const helperText = (
    <HelperText>
      <HelperTextItem variant="error">{error?.message}</HelperTextItem>
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

  const userPreferences = userData?.series;
  const userPreferencesArray = userPreferences && Object.keys(userPreferences);

  const retrieveButton = (
    <Button
      variant="tertiary"
      icon={<DownloadIcon />}
      size="sm"
      onClick={handleRetrieve}
    />
  );

  const rowLayout = (
    <CardHeader
      actions={{
        actions: <CardHeaderComponent resource={series} type="series" />,
      }}
      className="flex-series-container"
    >
      {isLoading ? (
        <Skeleton width="100%" height="100%" />
      ) : queryError ? (
        <Alert
          type="error"
          description="Failed to fetching user preferences..."
        />
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
        {isPending && !isError ? (
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
            helperText={isError ? helperText : ""}
            variant={isError ? ProgressVariant.danger : undefined}
            measureLocation={ProgressMeasureLocation.top}
          />
        ) : (
          <Alert
            style={{ height: "100%" }}
            closable
            type="error"
            message={error?.message || "Failed to get status. Try again"}
            description={<span>{retrieveButton}</span>}
          />
        )}
      </div>

      <div className="flex-series-item button-container">
        {data && data.totalFilesCount <= 0 && !isFetching && (
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
    <Card isRounded>
      {preview && data?.fileToPreview ? filePreviewLayout : rowLayout}
      {data?.fileToPreview && largeFilePreview}
    </Card>
  );
};

export default SeriesCardCopy;
