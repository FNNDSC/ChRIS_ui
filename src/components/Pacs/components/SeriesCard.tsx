import { MinusCircleOutlined } from "@ant-design/icons";
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
import {
  Alert,
  Modal as AntModal,
  Dropdown,
  Form,
  type FormListFieldData,
  Input,
  Select,
  Button as AntButton,
  Space,
  message,
} from "antd";
import axios from "axios";
import PQueue from "p-queue";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { MainRouterContext } from "../../../routes";
import { DotsIndicator } from "../../Common";
import { ThemeContext } from "../../DarkTheme/useTheme";
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
import type { AnonymizeTags } from "./usePipelinesMutation";
import { usePipelinesMutation } from "./usePipelinesMutation";
import { getBackgroundRowColor, getSeriesPath } from "./utils";

interface TagItem {
  tag: string;
  value: string;
}

const tagOptions = [
  { label: "PatientName", value: "PatientName" },
  { label: "PatientID", value: "PatientID" },
  { label: "PatientBirthDate", value: "PatientBirthDate" },
  { label: "InstitutionName", value: "InstitutionName" },
  { label: "ReferringPhysicianName", value: "ReferringPhysicianName" },
  { label: "AccessionNumber", value: "AccessionNumber" },
];

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

const queue = new PQueue({ concurrency: 10 });

const SeriesCardCopy = ({ series }: { series: any }) => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(PacsQueryContext);
  const selectedSeries = state.selectedSeries;

  const {
    data: userPreferenceData,
    isLoading: userDataLoading,
    isError: userDataError,
  } = useSettings();
  const userPreferences = userPreferenceData?.series;
  const userPreferencesArray = userPreferences && Object.keys(userPreferences);

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

  const isDisabled = seriesInstances === 0;
  const [isFetching, setIsFetching] = useState(false);
  const [openSeriesPreview, setOpenSeriesPreview] = useState(false);
  const [isPreviewFileAvailable, setIsPreviewFileAvailable] = useState(false);
  const [filePreviewForViewer, setFilePreviewForViewer] =
    useState<PACSFile | null>(null);
  const [pacsFileError, setPacsFileError] = useState("");
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);

  const [form] = Form.useForm();

  const pullQuery: DataFetchQuery = {
    StudyInstanceUID: studyInstanceUID,
    SeriesInstanceUID: seriesInstanceUID,
  };

  const handleRetrieveMutation = useMutation({
    mutationFn: async () => {
      try {
        await client.findRetrieve(selectedPacsService, pullQuery);
        setIsFetching(true);
      } catch (e) {
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

  async function fetchCubeFiles() {
    try {
      if (isDisabled) {
        setIsFetching(false);
        return {
          fileToPreview: null,
          totalCount: 0,
        };
      }

      const middleValue = Math.floor(seriesInstances / 2);

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

      const fileItems = response.results;
      let fileToPreview: PACSFile | null = null;
      if (fileItems.length > 0) {
        fileToPreview = fileItems[0];
      }

      const totalFilesCount = response.count;

      if (totalFilesCount >= middleValue) {
        setIsPreviewFileAvailable(true);
      }

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
          setIsFetching(false);
        }
      }

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
      return 1500;
    },
    refetchOnMount: true,
  });

  useEffect(() => {
    if (pullStudy[accessionNumber] && !isFetching) {
      setIsFetching(true);
    }
  }, [pullStudy[accessionNumber]]);

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
    async function fetchPacsFile() {
      try {
        const file = await getPacsFile(data?.fileToPreview);

        if (file) {
          setFilePreviewForViewer(file);
        }
      } catch (e) {
        if (e instanceof Error) {
          setPacsFileError(e.message);
        }
      }
    }

    if (preview && data?.fileToPreview) {
      fetchPacsFile();
    }
  }, [preview]);

  useEffect(() => {
    if (isConfigureModalOpen) {
      const savedFormData = localStorage.getItem("savedFormData");
      if (savedFormData) {
        const parsedFormData = JSON.parse(savedFormData);
        const tags = Object.entries(parsedFormData).map(([tag, value]) => ({
          tag,
          value,
        }));
        form.setFieldsValue({ tags });
      } else {
        form.setFieldsValue({ tags: [{}] });
      }
    }
  }, [isConfigureModalOpen, form]);

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
      key: "configure and push",
      label: "Configure Anonymization and Push",
      disabled: selectedSeries.length === 0,
      icon: <SettingsIcon />,
    },
  ];

  //@ts-ignore
  const fname = data?.fileToPreview?.fname;
  const seriesPath = fname ? getSeriesPath(fname) : "";

  const isSelected = selectedSeries.includes(seriesPath);
  const backgroundColor = getBackgroundRowColor(isSelected, isDarkTheme);

  const handleConfigureSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const newFormData: AnonymizeTags = {};
        values.tags.forEach((item: any) => {
          newFormData[item.tag] = item.value;
        });
        localStorage.setItem("savedFormData", JSON.stringify(newFormData));
        setIsConfigureModalOpen(false);
        if (Object.keys(newFormData).length > 0) {
          mutate({
            type: "configure and push",
            paths: selectedSeries,
            accessionNumber,
            formData: newFormData,
          });
        }
      })
      .catch(() => {
        message.error(
          "Form validation failed. Please check the highlighted fields.",
        );
      });
  };

  return (
    <>
      <Dropdown
        aria-role="menu"
        menu={{
          items,
          onClick: (info) => {
            if (info.key === "configure and push") {
              setIsConfigureModalOpen(true);
            } else if (info.key === "anonymize and push") {
              mutate({
                type: "anonymize and push",
                paths: selectedSeries,
                accessionNumber,
                formData: {},
              });
            }
          },
        }}
        trigger={["contextMenu"]}
        onOpenChange={(open) => {
          if (open && selectedSeries.length === 0) {
            message.warning(
              "Please select a series before running a pipeline.",
            );
          }
        }}
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
      <AntModal
        centered
        title="Configuration"
        open={isConfigureModalOpen}
        onCancel={() => setIsConfigureModalOpen(false)}
        destroyOnClose
        width={600}
        footer={[
          <AntButton
            type="dashed"
            key="clear"
            onClick={() => {
              localStorage.removeItem("savedFormData");
              form.setFieldsValue({ tags: [{}] });
            }}
          >
            Clear Saved Values
          </AntButton>,
          <AntButton
            type="dashed"
            key="cancel"
            onClick={() => setIsConfigureModalOpen(false)}
          >
            Cancel
          </AntButton>,
          <AntButton
            type="primary"
            key="submit"
            onClick={handleConfigureSubmit}
          >
            Ok
          </AntButton>,
        ]}
      >
        <Form form={form} layout="horizontal">
          <Form.List name="tags">
            {(fields: FormListFieldData[], { add, remove }) => {
              const selectedTags = (form.getFieldValue("tags") as TagItem[])
                ?.map((item) => item?.tag)
                .filter(Boolean);

              const addFieldIfNeeded = () => {
                const currentFields =
                  (form.getFieldValue("tags") as TagItem[]) || [];
                if (
                  currentFields.length < tagOptions.length &&
                  currentFields.every((field) => field.tag && field.value)
                ) {
                  add();
                }
              };

              return (
                <>
                  {fields.map((field, index) => {
                    const availableTags = tagOptions.filter(
                      (option) =>
                        !selectedTags?.includes(option.value) ||
                        option.value ===
                          form.getFieldValue(["tags", index, "tag"]),
                    );

                    return (
                      <Form.Item
                        required={false}
                        key={field.key}
                        style={{ marginBottom: "2px" }}
                      >
                        <Space.Compact style={{ display: "flex" }}>
                          <Form.Item
                            name={[field.name, "tag"]}
                            rules={[
                              {
                                required: true,
                                message: "Please select a tag",
                              },
                            ]}
                            style={{
                              flexGrow: 1,
                              flexBasis: "40%",
                              marginRight: "2px",
                            }}
                            key={`tag_${field.key}`}
                          >
                            <Select
                              placeholder="Select tag"
                              options={availableTags}
                              onChange={() => {
                                addFieldIfNeeded();
                              }}
                            />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, "value"]}
                            rules={[
                              {
                                required: true,
                                message: "Please input a value",
                              },
                            ]}
                            style={{
                              flexGrow: 1,
                              flexBasis: "60%",
                              marginRight: "4px",
                            }}
                            key={`value_${field.key}`}
                          >
                            <Input
                              placeholder="Enter value"
                              onPressEnter={(e) => {
                                e.preventDefault();
                                addFieldIfNeeded();
                              }}
                            />
                          </Form.Item>
                          {fields.length > 1 && (
                            <Form.Item key={`delete_${field.key}`}>
                              <MinusCircleOutlined
                                onClick={() => {
                                  remove(field.name);
                                }}
                                style={{
                                  fontSize: "16px",
                                  cursor: "pointer",
                                  verticalAlign: "center",
                                }}
                              />
                            </Form.Item>
                          )}
                        </Space.Compact>
                      </Form.Item>
                    );
                  })}
                </>
              );
            }}
          </Form.List>
        </Form>
      </AntModal>
    </>
  );
};

export default SeriesCardCopy;
