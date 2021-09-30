import React from "react";
import { message, Steps } from "antd";
import { useHistory } from "react-router";

import {
  Card,
  CardBody,
  Button,
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuToggle,
  Form,
  TextInput,
} from "@patternfly/react-core";
import { useDispatch } from "react-redux";
import FileUpload from "../../components/common/fileupload";
import { useTypedSelector } from "../../store/hooks";
import { LocalFile } from "../../components/feed/CreateFeed/types";
import { AnalysisStep } from "../../store/workflows/types";
import {
  setLocalFile,
  deleteLocalFile,
  setOptionState,
  setInfantAge,
  setCurrentStep,
  submitAnalysis,
  resetWorkflowState,
  clearFileSelection,
  generatePipeline,
  setUploadedSpec,
  setCurrentNode,
} from "../../store/workflows/actions";
import { Tree, ConfigurationPage } from "./components/Tree";
import {
  fastsurferPipeline,
  freesurferPipeline,
  fetalReconstructionPipeline,
} from "./utils";
import { TreeNode } from "../../store/workflows/types";

import { AiOutlineUpload } from "react-icons/ai";

const { Step } = Steps;

const FileDetails = () => {
  return <StepsComponent />;
};

const StepsComponent = () => {
  const currentStep = useTypedSelector((state) => state.workflows.currentStep);

  React.useEffect(() => {
    if (currentStep === 3) {
      message.success("Processing Complete");
    }
  }, [currentStep]);
  const steps = [
    {
      id: 0,
      title: "Local File Upload",
      content: (
        <ContentWrapper id={1}>
          <FileUploadWrapper />
        </ContentWrapper>
      ),
    },
    {
      id: 1,
      title: "Choose a Workflow",
      content: (
        <ContentWrapper id={2}>
          <SelectWorkflow />
        </ContentWrapper>
      ),
    },
    {
      id: 2,
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

const ContentWrapper = ({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: number;
}) => {
  const dispatch = useDispatch();
  const uploadedWorkflow = useTypedSelector(
    (state) => state.workflows.uploadedWorkflow
  );
  const history = useHistory();
  const {
    currentStep,
    optionState,
    localfilePayload,
    checkFeedDetails,
    pipelinePlugins,
    pluginPipings,
    pluginParameters,
    computeEnvs,
  } = useTypedSelector((state) => state.workflows);
  const username = useTypedSelector((state) => state.user.username);

  const localFiles = localfilePayload.files;

  const stepLength = 2;
  const isDisabled = id === 1 && localFiles.length === 0 ? true : false;

  return (
    <div className="steps-content">
      <div
        style={{
          marginBottom: "1rem",
          marginTop: "1rem",
          paddingTop: "1rem",
          paddingLeft: "1rem",
          height: `${id === 1 ? "350px" : id === 2 ? "350px" : "300px"}`,
        }}
      >
        {children}
      </div>
      <div className="steps-action">
        {currentStep < stepLength && id != 3 && (
          <Button
            isDisabled={isDisabled}
            onClick={() => {
              if (id === 2 && localFiles.length > 0 && username) {
                dispatch(
                  submitAnalysis({
                    localFiles,
                    username,
                    workflowType:
                      optionState.selectedOption || uploadedWorkflow,
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
        {localFiles.length > 0 && id === 1 && (
          <Button onClick={() => dispatch(clearFileSelection())}>
            Clear File Selection
          </Button>
        )}
        {currentStep === 3 && id === 3 && (
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
        {currentStep > 0 && id !== 1 && (
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

const workflows = [
  "covidnet",
  "infantFreesurfer",
  "infantFreesurferAge",
  "adultFreesurfer",
  "adultFreesurfermoc",
  "fastsurfer",
  "fastsurfermoc",
  "fetalReconstruction",
];

const workflowTitle: {
  [key: string]: {
    title: string;
  };
} = {
  covidnet: {
    title: "Covidnet",
  },
  infantFreesurfer: {
    title: "Infant Freesurfer",
  },
  infantFreesurferAge: {
    title: "Infant Freesurfer Age",
  },
  adultFreesurfer: {
    title: "Adult Freesurfer",
  },
  fastsurfer: {
    title: "Fastsurfer",
  },
  adultFreesurfermoc: {
    title: "Adult Freesurfer Moc",
  },
  fastsurfermoc: {
    title: "Fastsurfer Moc",
  },
  fetalReconstruction: {
    title: "Fetal Reconstruction",
  },
};

const getPipelineData = (workflow: string) => {
  if (workflow === "fastsurfer") {
    return fastsurferPipeline();
  }
  if (workflow === "fetalReconstruction") {
    return fetalReconstructionPipeline();
  }

  if (workflow === "adultFreesurfer") {
    return freesurferPipeline();
  }
};

const SelectWorkflow = () => {
  const dispatch = useDispatch();

  const { uploadedWorkflow, optionState } = useTypedSelector(
    (state) => state.workflows
  );

  const { selectedOption, isOpen, toggleTemplateText } = optionState;

  const handleSelect = (
    event?:
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
      | React.KeyboardEvent<Element>
  ) => {
    const id = event?.currentTarget.id;
    //@ts-ignore
    const name = event?.target.name;

    if (id) {
      dispatch(
        setOptionState({
          ...optionState,
          toggleTemplateText: name,
          selectedOption: id || uploadedWorkflow,
          isOpen: !isOpen,
        })
      );
      const data = getPipelineData(id);
      dispatch(generatePipeline(data));
    }
  };

  const onToggle = () => {
    dispatch(
      setOptionState({
        ...optionState,
        isOpen: !isOpen,
      })
    );
  };
  const handleNodeClick = (node: {
    data: TreeNode;
    pluginName: string;
    currentComputeEnv: string;
  }) => {
    dispatch(setCurrentNode(node));
  };

  const handleInputChange = (value: string) => {
    dispatch(setInfantAge(value));
  };

  const menuItems = workflows.map((workflow: string) => {
    return (
      <OptionsMenuItem
        onSelect={handleSelect}
        id={workflow}
        key={workflow}
        name={workflowTitle[workflow].title}
        isSelected={selectedOption === workflow}
      >
        {workflowTitle[workflow].title}
      </OptionsMenuItem>
    );
  });

  const toggle = (
    <OptionsMenuToggle
      onToggle={onToggle}
      toggleTemplate={toggleTemplateText}
    />
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <OptionsMenu
          id="option-menu"
          isOpen={isOpen}
          menuItems={menuItems}
          toggle={toggle}
        />
        <UploadJson />
      </div>

      <div
        style={{
          display: "flex",
          height: "100%",
        }}
      >
        <Tree handleNodeClick={handleNodeClick} />
        <ConfigurationPage />
        {selectedOption === "infantFreesurferAge" && (
          <div className="workflow-form">
            <Form isHorizontal>
              <TextInput
                isRequired
                type="text"
                id="infant-age"
                name="infant-age"
                onChange={handleInputChange}
                placeholder="Enter an Infant's age in months"
              />
            </Form>
          </div>
        )}
      </div>
    </>
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
