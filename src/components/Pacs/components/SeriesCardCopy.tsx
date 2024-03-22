import { PACSFile, PACSFileList } from "@fnndsc/chrisapi";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  ProgressVariant,
  Tooltip,
  pluralize,
} from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
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

const SeriesCardCopy = ({ series }: { series: any }) => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(PacsQueryContext);
  const { selectedPacsService, pullStudy } = state;
  const client = new PFDCMClient();
  const {
    SeriesInstanceUID,
    StudyInstanceUID,
    NumberOfSeriesRelatedInstances,
  } = series;
  const [isFetching, setIsFetching] = useState(false);
  const [openSeriesPreview, setOpenSeriesPreview] = useState(false);

  const seriesInstances = parseInt(NumberOfSeriesRelatedInstances.value);

  const pullQuery: DataFetchQuery = useMemo(() => {
    return {
      SeriesInstanceUID: SeriesInstanceUID.value,
      StudyInstanceUID: StudyInstanceUID.value,
    };
  }, [SeriesInstanceUID.value, StudyInstanceUID.value]);

  async function fetchCubeFiles() {
    const cubeClient = ChrisAPIClient.getClient();
    const middleValue = Math.floor(seriesInstances / 2);

    try {
      const files: PACSFileList = await cubeClient.getPACSFiles({
        ...pullQuery,
        limit: 1,
        offset: middleValue,
      });

      const fileItems: PACSFile[] = files.getItems() as never as PACSFile[];
      let fileToPreview: PACSFile | null = null;
      if (fileItems) {
        fileToPreview = fileItems[0];
      }
      const totalFilesCount = files.totalCount;

      if (pullStudy) {
        dispatch({
          type: Types.SET_STUDY_PULL_TRACKER,
          payload: {
            seriesInstanceUID: SeriesInstanceUID.value,
            studyInstanceUID: StudyInstanceUID.value,
            currentProgress: totalFilesCount >= seriesInstances,
          },
        });
      }

      if (totalFilesCount >= seriesInstances && isFetching) {
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

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["pacsFiles", SeriesInstanceUID.value],
    queryFn: fetchCubeFiles,
    refetchInterval: () => {
      if (isFetching) return 2000;
      return false;
    },
    refetchOnMount: true,
  });

  useEffect(() => {
    if (pullStudy) {
      handleRetrieve();
    }
  }, [pullStudy]);

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
    <>
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
              //createFeed([cubeSeriesPath]);
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
    </>
  );

  return (
    <Card isRounded>
      <CardHeader className="flex-series-container">
        <div className="flex-series-item">
          <Tooltip content={series.SeriesDescription.value} position="auto">
            <div className="hide-content">
              <span style={{ marginRight: "0.5em" }}>
                {series.SeriesDescription.value}
              </span>{" "}
            </div>
          </Tooltip>

          <div>{pluralize(seriesInstances, "file", "files")}</div>
        </div>

        <div className="flex-series-item">
          <div>Modality</div>
          <Badge key={series.SeriesInstanceUID.value}>
            {series.Modality.value}
          </Badge>
        </div>

        <div className="flex-series-item steps-container">
          {isPending ? (
            <DotsIndicator title="Fetching current status..." />
          ) : data ? (
            <Progress
              className="retrieve-progress"
              title="Test"
              aria-labelledby="Retrieve Progress"
              value={data.totalFilesCount}
              max={seriesInstances}
              size={ProgressSize.sm}
              helperText={isError ? helperText : ""}
              variant={
                data.totalFilesCount >= seriesInstances
                  ? ProgressVariant.success
                  : isError
                    ? ProgressVariant.danger
                    : undefined
              }
              measureLocation={ProgressMeasureLocation.top}
            />
          ) : (
            <span>Failed to get status...</span>
          )}
        </div>

        <div className="flex-series-item button-container">
          {data && data.totalFilesCount < seriesInstances && !isFetching && (
            <Tooltip content="Retrieve Series">
              <Button
                variant="tertiary"
                icon={<DownloadIcon />}
                size="sm"
                onClick={handleRetrieve}
              />
            </Tooltip>
          )}
          {isFetching && data && data.totalFilesCount < 1 && (
            <DotsIndicator title="Retrieving the series" />
          )}
          {data?.fileToPreview && filePreviewButton}
        </div>
      </CardHeader>
      {data?.fileToPreview && largeFilePreview}
    </Card>
  );
};

export default SeriesCardCopy;
