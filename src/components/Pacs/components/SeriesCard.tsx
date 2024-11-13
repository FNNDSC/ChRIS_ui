import type { PACSFile } from "@fnndsc/chrisapi";
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
import { Alert, Modal as AntModal, Form, Input } from "antd";
import axios from "axios";
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
  SettingsIcon,
} from "../../Icons";
import FileDetailView from "../../Preview/FileDetailView";
import { PacsQueryContext, Types } from "../context";
import PFDCMClient, { type DataFetchQuery } from "../pfdcmClient";
import useSettings from "../useSettings";
import { CardHeaderComponent } from "./SettingsComponents";
import PQueue from "p-queue";
import { Dropdown } from "antd";
import { usePipelinesMutation } from "./usePipelinesMutation";
import { ThemeContext } from "../../DarkTheme/useTheme";
import { getBackgroundRowColor, getSeriesPath } from "./utils";

async function getPacsFile(file: PACSFile["data"]) {
  const { id } = file;
  const client = ChrisAPIClient.getClient();
  try {
    const pacs_file = await client.getPACSFile(id);
    return pacs_file;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
}
// Renamed function from getTestData to fetchPACSFilesData
async function fetchPACSFilesData(
  pacsIdentifier: string,
  pullQuery: DataFetchQuery,
  protocolName?: string,
  offset?: number,
) {
  const cubeClient = ChrisAPIClient.getClient();
  try {
    let url = `${
      import.meta.env.VITE_CHRIS_UI_URL
    }pacsfiles/search/?pacs_identifier=${pacsIdentifier}&StudyInstanceUID=${
      pullQuery.StudyInstanceUID
    }&SeriesInstanceUID=${pullQuery.SeriesInstanceUID}`;

    if (protocolName) {
      url += `&ProtocolName=${protocolName}`;
    }
    if (offset) {
      url += `&offset=${offset}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${cubeClient.auth.token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `Error: ${error.response.status} - ${error.response.data}`,
        );
      }
      if (error.request) {
        throw new Error("Error: No response received from server.");
      }
      // Something else happened while setting up the request

      throw new Error(`Error: ${error.message}`);
    }

    throw new Error("An unexpected error occurred.");
  }
}

function getLatestPACSFile(pacsFiles: PACSFile["data"][]) {
  return pacsFiles.reduce((latestFile, currentFile) => {
    const latestDate = new Date(latestFile.creation_date);
    const currentDate = new Date(currentFile.creation_date);

    return currentDate > latestDate ? currentFile : latestFile;
  });
}

/**
 * The browser's limit on the number of concurrent connections to the same domain, which can result in requests being blocked if too many are fired simultaneously.
 * To manage this, we implement a queue system to control the concurrency of your async requests.
 */

const queue = new PQueue({ concurrency: 10 }); // Set concurrency limit here

const SeriesCardCopy = ({ series }: { series: any }) => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(PacsQueryContext);
  const selectedSeries = state.selectedSeries; // Accessed only once

  // Load user Preference Data
  const {
    data: userPreferenceData,
    isLoading: userDataLoading,
    isError: userDataError,
  } = useSettings();
  const userPreferences = userPreferenceData?.series;
  const userPreferencesArray = userPreferences && Object.keys(userPreferences);

  // Pipeline creation mutation
  const { isDarkTheme } = useContext(ThemeContext);
  const { mutate } = usePipelinesMutation();

  const createFeed = useContext(MainRouterContext).actions.createFeedWithData;
  const { selectedPacsService, pullStudy, preview } = state;
  const client = new PFDCMClient();
  const {
    SeriesInstanceUID,
    StudyInstanceUID,
    NumberOfSeriesRelatedInstances,
    AccessionNumber,
  } = series;
  const seriesInstances = +NumberOfSeriesRelatedInstances.value;
  const studyInstanceUID = StudyInstanceUID.value;
  const seriesInstanceUID = SeriesInstanceUID.value;
  const accessionNumber = AccessionNumber.value;

  // Disable the card completely in this case
  const isDisabled = seriesInstances === 0;
  // This flag controls the start/stop for polling cube for files and display progress indicators
  const [isFetching, setIsFetching] = useState(false);
  const [openSeriesPreview, setOpenSeriesPreview] = useState(false);
  const [isPreviewFileAvailable, setIsPreviewFileAvailable] = useState(false);
  const [filePreviewForViewer, setFilePreviewForViewer] =
    useState<PACSFile | null>(null);
  const [pacsFileError, setPacsFileError] = useState("");
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);

  const pullQuery: DataFetchQuery = {
    StudyInstanceUID: studyInstanceUID,
    SeriesInstanceUID: seriesInstanceUID,
  };

  // Handle Retrieve Request
  const handleRetrieveMutation = useMutation({
    mutationFn: async () => {
      try {
        await client.findRetrieve(selectedPacsService, pullQuery);
        setIsFetching(true);
      } catch (e) {
        // Don't poll if the request fails
        // biome-ignore lint/complexity/noUselessCatch: <explanation>
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
      if (isDisabled) {
        // Cancel polling for files that have zero number of series instances
        setIsFetching(false);
        return {
          fileToPreview: null,
          totalCount: 0,
        };
      }

      const middleValue = Math.floor(seriesInstances / 2);

      // Perform these three requests in parallel
      const [response, seriesRelatedInstance, pushCountInstance] =
        await Promise.all([
          queue.add(() =>
            fetchPACSFilesData(
              selectedPacsService,
              pullQuery,
              "",
              isPreviewFileAvailable ? middleValue : 0,
            ),
          ),
          queue.add(() =>
            fetchPACSFilesData(
              "org.fnndsc.oxidicom",
              pullQuery,
              "NumberOfSeriesRelatedInstances",
            ),
          ),
          queue.add(() =>
            fetchPACSFilesData(
              "org.fnndsc.oxidicom",
              pullQuery,
              "OxidicomAttemptedPushCount",
            ),
          ),
        ]);

      // Process the response
      const fileItems = response.results;
      let fileToPreview: PACSFile | null = null;
      if (fileItems.length > 0) {
        fileToPreview = fileItems[0];
      }

      const totalFilesCount = response.count;

      if (totalFilesCount >= middleValue) {
        // Pick the middle image of the stack for preview. Set to true if that file is available
        setIsPreviewFileAvailable(true);
      }

      // Get the series related instance in cube
      const seriesRelatedInstanceList = seriesRelatedInstance.results;
      const pushCountInstanceList = pushCountInstance.results;

      if (seriesRelatedInstanceList.length > 0) {
        const seriesCountLatest = getLatestPACSFile(seriesRelatedInstanceList);
        const seriesCount = +seriesCountLatest.SeriesDescription;
        if (seriesCount !== seriesInstances) {
          throw new Error(
            "The number of series related instances in cube does not match the number in pfdcm.",
          );
        }
      }

      let pushCount = 0;
      if (pushCountInstanceList.length > 0) {
        const pushCountLatest = getLatestPACSFile(pushCountInstanceList);
        pushCount = +pushCountLatest.SeriesDescription;

        if (pushCount > 0 && pushCount === totalFilesCount && isFetching) {
          // This means oxidicom is done pushing as the push count file is available
          // Cancel polling
          setIsFetching(false);
        }
      }

      // Setting the study instance tracker if pull study is clicked
      if (pullStudy?.[accessionNumber]) {
        dispatch({
          type: Types.SET_STUDY_PULL_TRACKER,
          payload: {
            seriesInstanceUID: SeriesInstanceUID.value,
            studyInstanceUID: accessionNumber,
            currentProgress: !!(
              seriesInstances === 0 || totalFilesCount === pushCount
            ),
          },
        });
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
      // Only fetch after a successful response from pfdcm
      // Decrease polling frequency to avoid overwhelming cube with network requests
      return 1500;
    },
    refetchOnMount: true,
  });

  // Retrieve this series if the pull study is clicked and the series is not already being retrieved.
  useEffect(() => {
    if (pullStudy[accessionNumber] && !isFetching) {
      setIsFetching(true);
    }
  }, [pullStudy[accessionNumber]]);

  // Start polling from where the user left off in case the user refreshed the screen.
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

  useEffect(() => {
    // This is the preview all mode clicked on the study card
    async function fetchPacsFile() {
      try {
        const file = await getPacsFile(data?.fileToPreview);

        if (file) {
          setFilePreviewForViewer(file);
        }
      } catch (e) {
        // Handle error
        if (e instanceof Error) {
          setPacsFileError(e.message);
        }
      }
    }

    if (preview && data?.fileToPreview) {
      fetchPacsFile();
    }
  }, [preview]);

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

  // This is opened when the 'preview' button is clicked
  const largeFilePreview = filePreviewForViewer && (
    <Modal
      variant={ModalVariant.large}
      title="Preview"
      aria-label="viewer"
      isOpen={openSeriesPreview}
      onClose={() => setOpenSeriesPreview(false)}
    >
      <FileDetailView
        preview="large"
        selectedFile={filePreviewForViewer as PACSFile}
      />
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
          onClick={async () => {
            if (data?.fileToPreview) {
              try {
                const file = await getPacsFile(data?.fileToPreview);
                if (file) {
                  const cubeSeriesPath = file.data.fname
                    .split("/")
                    .slice(0, -1)
                    .join("/");
                  createFeed([cubeSeriesPath]);
                }
              } catch (e) {
                if (e instanceof Error) {
                  setPacsFileError(e.message);
                }
              }
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
          onClick={async () => {
            try {
              const file = await getPacsFile(data?.fileToPreview);
              if (file) {
                setFilePreviewForViewer(file);
                setOpenSeriesPreview(true);
              }
            } catch (e) {
              if (e instanceof Error) {
                setPacsFileError(e.message);
              }
            }
          }}
          variant="tertiary"
        />
      </Tooltip>

      <Tooltip content="Review the dataset">
        <Button
          size="sm"
          icon={<LibraryIcon />}
          variant="tertiary"
          onClick={async () => {
            if (data?.fileToPreview) {
              try {
                const file = await getPacsFile(data.fileToPreview);
                if (file) {
                  const pathSplit = file.data.fname.split("/");
                  const url = pathSplit
                    .slice(0, pathSplit.length - 1)
                    .join("/");
                  navigate(`/library/${url}`);
                }
              } catch (e) {
                // Handle Error
                if (e instanceof Error) {
                  setPacsFileError(e.message);
                }
              }
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
        selectedFile={filePreviewForViewer as PACSFile}
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
            variant={
              resourceErrorFound
                ? ProgressVariant.danger
                : data.totalFilesCount === seriesInstances
                  ? ProgressVariant.success
                  : undefined
            }
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

  const items = [
    {
      key: "anonymize and push",
      label: "Anonymize and Push",
      disabled: selectedSeries.length === 0,
      icon: <DownloadIcon />,
    },
    {
      key: "configure",
      label: "Configure anon and push",
      icon: <SettingsIcon />,
    },
  ];

  // Get the series path for the current card
  //@ts-ignore
  const fname = data?.fileToPreview?.fname;
  const seriesPath = fname ? getSeriesPath(fname) : "";

  // Check if the current series is selected
  const isSelected = selectedSeries.includes(seriesPath);

  const backgroundColor = getBackgroundRowColor(isSelected, isDarkTheme);

  const [form] = Form.useForm();
  const handleConfigureSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // Handle form submission

        setIsConfigureModalOpen(false);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <>
      <Dropdown
        aria-role="menu"
        menu={{
          items,
          onClick: (info) => {
            console.log("info", info);
            if (info.key === "configure") {
              setIsConfigureModalOpen(true);
            } else {
              const clippedPaths = selectedSeries;
              mutate({
                type: info.key,
                paths: clippedPaths,
                accessionNumber,
              });
            }
          },
        }}
        trigger={["contextMenu"]}
      >
        <Card
          isDisabled={isDisabled}
          isFlat={true}
          isFullHeight={true}
          isCompact={true}
          isRounded={true}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (seriesPath) {
              if (!isSelected) {
                dispatch({
                  type: Types.SET_SELECTED_SERIES,
                  payload: {
                    path: seriesPath,
                  },
                });
              } else {
                dispatch({
                  type: Types.REMOVE_SELECTED_SERIES,
                  payload: {
                    path: seriesPath,
                  },
                });
              }
            }
          }}
          style={{
            backgroundColor,
          }}
        >
          {preview && data?.fileToPreview ? filePreviewLayout : rowLayout}
          {data?.fileToPreview && largeFilePreview}

          {pacsFileError && <Alert type="error" description={pacsFileError} />}
        </Card>
      </Dropdown>
      {/* Configuration Modal */}
      <AntModal
        title="Configuration"
        open={isConfigureModalOpen}
        onOk={handleConfigureSubmit}
        onCancel={() => setIsConfigureModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Input 1"
            name="input1"
            rules={[{ required: true, message: "Please input something!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Input 2"
            name="input2"
            rules={[{ required: true, message: "Please input something!" }]}
          >
            <Input />
          </Form.Item>
          {/* Add more input boxes as needed */}
        </Form>
      </AntModal>
    </>
  );
};

export default SeriesCardCopy;
