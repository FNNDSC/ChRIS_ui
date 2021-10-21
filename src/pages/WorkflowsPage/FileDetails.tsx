import React from "react";
import { Steps } from "antd";
import { useHistory } from "react-router";
import {
  Card,
  CardBody,
  Button,
  SimpleList,
  SimpleListItem,
  Pagination,
} from "@patternfly/react-core";
import { useDispatch } from "react-redux";
import FileUpload from "../../components/common/fileupload";
import { useTypedSelector } from "../../store/hooks";
import { LocalFile } from "../../components/feed/CreateFeed/types";
import { AnalysisStep, TreeNode } from "../../store/workflows/types";
import {
  setLocalFile,
  deleteLocalFile,
  setCurrentStep,
  submitAnalysis,
  resetWorkflowState,
  clearFileSelection,
  setUploadedSpec,
  setPipelinesList,
  setCurrentPipeline,
  setCurrentComputeEnv,
} from "../../store/workflows/actions";

import { AiOutlineUpload } from "react-icons/ai";
import { usePaginate } from "../../components/common/pagination";
import ChrisAPIClient from "../../api/chrisapiclient";
import { Tree, ConfigurationPage } from "./components/Tree";

const { Step } = Steps;

const FileDetails = () => {
  return <StepsComponent />;
};

const StepsComponent = () => {
  const currentStep = useTypedSelector((state) => state.workflows.currentStep);

  React.useEffect(() => {
    if (currentStep === 3) {
      /*
      message.success("Processing Complete");
      */
    }
  }, [currentStep]);
  const steps = [
    {
      id: 0,
      title: "Local File Upload",
      content: (
        <ContentWrapper id={0}>
          <FileUploadWrapper />
        </ContentWrapper>
      ),
    },
    {
      id: 1,
      title: "Choose a Workflow",
      content: (
        <ContentWrapper id={1}>
          <SelectWorkflow />
        </ContentWrapper>
      ),
    },
    {
      id: 2,
      title: "Configure the pipeline",
      content: (
        <ContentWrapper id={2}>
          <ConfigurePipeline />
        </ContentWrapper>
      ),
    },
    {
      id: 3,
      title: "Execution Status",
      content: (
        <ContentWrapper id={3}>
          <StatusComponent />
        </ContentWrapper>
      ),
    },
  ];

  return (
    <Card>
      <CardBody>
        <Steps current={currentStep} direction="vertical">
          {steps.map((step) => {
            const showContent =
              currentStep === step.id || currentStep > step.id;
            return (
              <Step
                key={step.title}
                title={step.title}
                description={showContent && step.content}
              />
            );
          })}
        </Steps>
      </CardBody>
    </Card>
  );
};

const ContentWrapper = ({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: number;
}) => {
  const dispatch = useDispatch();

  const history = useHistory();
  const {
    currentStep,
    localfilePayload,
    checkFeedDetails,
    pipelinePlugins,
    pluginPipings,
    pluginParameters,
    computeEnvs,
  } = useTypedSelector((state) => state.workflows);
  const username = useTypedSelector((state) => state.user.username);

  const localFiles = localfilePayload.files;

  const stepLength = 4;
  const isDisabled = id === 1 && localFiles.length === 0 ? true : false;

  return (
    <div className="steps-content">
      <div
        style={{
          marginBottom: "1rem",
          marginTop: "1rem",
          paddingTop: "1rem",
          paddingLeft: "1rem",
          height: `${id === 1 ? "350px" : id === 2 ? "300px" : "300px"}`,
        }}
      >
        {children}
      </div>
      <div className="steps-action">
        {currentStep < stepLength && (
          <Button
            isDisabled={isDisabled}
            onClick={() => {
              if (id === 2 && localFiles.length > 0 && username) {
                dispatch(
                  submitAnalysis({
                    localFiles,
                    username,
                    pipelinePlugins,
                    pluginPipings,
                    pluginParameters,
                    computeEnvs,
                  })
                );
              }
              dispatch(setCurrentStep(currentStep + 1));
            }}
          >
            Continue
          </Button>
        )}
        {localFiles.length > 0 && id === 0 && (
          <Button onClick={() => dispatch(clearFileSelection())}>
            Clear File Selection
          </Button>
        )}
        {currentStep === 4 && id === 4 && (
          <Button
            onClick={() => {
              if (checkFeedDetails) {
                history.push(`/feeds/${checkFeedDetails}`);
              }
            }}
          >
            Check Feed Details
          </Button>
        )}
        {currentStep > 0 && id !== 0 && (
          <Button
            onClick={() => {
              if (currentStep === 3) {
                dispatch(resetWorkflowState());
              } else dispatch(setCurrentStep(currentStep - 1));
            }}
          >
            {currentStep === 3 ? "Clear" : "Previous"}
          </Button>
        )}
      </div>
    </div>
  );
};

const FileUploadWrapper = () => {
  const dispatch = useDispatch();
  const localFilesPayload = useTypedSelector(
    (state) => state.workflows.localfilePayload
  );
  const handleDispatch = (files: LocalFile[]) => {
    dispatch(setLocalFile(files));
  };
  const handleDeleteDispatch = (fileName: string) => {
    dispatch(deleteLocalFile(fileName));
  };
  const { files } = localFilesPayload;
  return (
    <FileUpload
      className="workflow-file-upload"
      handleDeleteDispatch={handleDeleteDispatch}
      localFiles={files}
      dispatchFn={handleDispatch}
    />
  );
};

const SelectWorkflow = () => {
  const dispatch = useDispatch();
  const { pipelinesList } = useTypedSelector((state) => state.workflows);
  const [pipelinesCount, setPipelinesCount] = React.useState<number>(0);
  const { filterState, handlePageSet, handlePerPageSet } = usePaginate();
  const [selectedPipeline, setSelectedPipeline] = React.useState();
  const { page, perPage } = filterState;

  React.useEffect(() => {
    async function fetchPipelines() {
      const offset = perPage * (page - 1);
      const client = ChrisAPIClient.getClient();
      const params = {
        limit: perPage,
        offset: offset,
      };
      const registeredPipelinesList = await client.getPipelines(params);
      const registeredPipelines = registeredPipelinesList.getItems();
      if (registeredPipelines) {
        dispatch(setPipelinesList(registeredPipelines));
        setPipelinesCount(registeredPipelinesList.totalCount);
      }
    }

    fetchPipelines();
  }, [page, perPage, dispatch]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Pagination
          itemCount={pipelinesCount}
          perPage={perPage}
          page={page}
          onSetPage={handlePageSet}
          onPerPageSelect={handlePerPageSet}
        />
        <SimpleList
          style={{
            marginTop: "2em",
          }}
        >
          {pipelinesList &&
            pipelinesList.map((pipeline) => {
              return (
                <SimpleListItem
                  isActive={selectedPipeline === pipeline.data.name}
                  onClick={() => {
                    dispatch(setCurrentPipeline(pipeline.data.name));
                    setSelectedPipeline(pipeline.data.name);
                  }}
                  key={pipeline.data.id}
                >
                  {pipeline.data.name}{" "}
                </SimpleListItem>
              );
            })}
        </SimpleList>
      </div>
      <UploadJson />
    </div>
  );
};

export const ConfigurePipeline = () => {
  const dispatch = useDispatch();

  const handleNodeClick = (node: {
    data: TreeNode;
    pluginName: string;
    currentComputeEnv?: string;
  }) => {
    const { pluginName, currentComputeEnv } = node;

    if (currentComputeEnv)
      dispatch(
        setCurrentComputeEnv({
          pluginName,
          currentComputeEnv,
        })
      );
  };
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <Tree handleNodeClick={handleNodeClick} />
      <ConfigurationPage />
    </div>
  );
};

export default FileDetails;

export const UploadJson = () => {
  const dispatch = useDispatch();
  const fileOpen = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState("");

  const showOpenFile = () => {
    if (fileOpen.current) {
      fileOpen.current.click();
    }
  };

  const readFile = (file: any) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        if (reader.result) {
          const result = JSON.parse(reader.result as string);
          dispatch(setUploadedSpec(result));
          setFileName(result.name);
        }
      } catch (error) {
        console.log("NOT a valid json file");
      }
    };
    if (file) {
      reader.readAsText(file);
    }
  };

  const handleUpload = (event: any) => {
    const file = event.target.files && event.target.files[0];
    readFile(file);
  };
  return (
    <>
      <div>
        <span style={{ marginRight: "0.5rem", fontWeight: 700 }}>
          {fileName}
        </span>
        <Button onClick={showOpenFile} icon={<AiOutlineUpload />}>
          Upload a JSON spec{" "}
        </Button>
      </div>

      <input
        ref={fileOpen}
        style={{ display: "none" }}
        type="file"
        onChange={handleUpload}
      />
    </>
  );
};

const StatusComponent = () => {
  const steps = useTypedSelector((state) => state.workflows.steps);
  return (
    <Steps direction="horizontal">
      {steps.map((step: AnalysisStep) => {
        return (
          <Step
            key={step.id}
            status={step.status}
            title={step.title}
            description={step.error && step.error}
          />
        );
      })}
    </Steps>
  );
};
