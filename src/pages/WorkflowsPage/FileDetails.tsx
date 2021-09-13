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
} from "../../store/workflows/actions";
import { Tree, ConfigurationPage } from "./components/Tree";

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
    <Steps size="small" direction="horizontal">
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
  const history = useHistory();
  const {
    currentStep,
    optionState,
    localfilePayload,
    infantAge,
    checkFeedDetails,
  } = useTypedSelector((state) => state.workflows);
  const username = useTypedSelector((state) => state.user.username);

  const localFiles = localfilePayload.files;

  const stepLength = 2;
  const isDisabled =
    id === 1 && localFiles.length === 0
      ? true
      : id === 2 && !optionState.selectedOption
      ? true
      : false;

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
                    workflowType: optionState.selectedOption,
                    infantAge,
                    plugins: optionState.plugins,
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

const workflowPlugins: {
  [key: string]: string[];
} = {
  covidnet: [
    "pl-dircopy",
    "pl-med2img",
    "pl-covidnet",
    "pl-covidnet-pdfgeneration",
  ],
  infantFreesurfer: [
    "pl-dircopy",
    "pl-pfdicom_tagSub",
    "pl-pfdicom_tagExtract",
    "pl-fshack-infant",
    "pl-multipass",
    "pl-pfdorun",
    "pl-mgz2LUT_report",
  ],
  infantFreesurferAge: [
    "pl-dircopy",
    "pl-pfdicom_tagSub",
    "pl-pfdicom_tagExtract",
    "pl-fshack-infant",
    "pl-multipass",
    "pl-pfdorun",
    "pl-mgz2LUT_report",
  ],
  adultFreesurfer: [
    "pl-dircopy",
    "pl-pfdicom_tagSub",
    "pl-pfdicom_tagExtract",
    "pl-fshack",
    "pl-multipass",
    "pl-pfdorun",
    "pl-mgz2LUT_report",
  ],
  fastsurfer: [
    "pl-dircopy",
    "pl-pfdicom_tagExtract",
    "pl-pfdicom_tagSub",
    "pl-fshack",
    "pl-fastsurfer_inference",
    "pl-multipass",
    "pl-pfdorun",
    "pl-mgz2LUT_report",
  ],
  adultFreesurfermoc: [
    "pl-dircopy",
    "pl-pfdicom_tagextract_ghcr",
    "pl-pfdicom_tagsub_ghcr",
    "pl-fshack_ghcr:1.0.0",
    "pl-multipass_ghcr",
    "pl-pfdorun_ghcr",
    "pl-mgz2lut_report_ghcr_m3",
  ],
  fastsurfermoc: [
    "pl-dircopy",
    "pl-pfdicom_tagextract_ghcr",
    "pl-pfdicom_tagsub_ghcr",
    "pl-fshack_ghcr:1.0.0",
    "pl-fastsurfer_inference_cpu_30",
    "pl-multipass_ghcr",
    "pl-pfdorun_ghcr",
    "pl-mgz2lut_report_ghcr_m3",
  ],
  fetalReconstruction: [
    "pl-dircopy",
    "pl-fetal-brain-mask",
    "pl-ANTs_N4BiasFieldCorrection",
    "pl-fetal-brain-assessment",
    "pl-irtk-reconstruction",
  ],
};

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

const SelectWorkflow = () => {
  const dispatch = useDispatch();
  const optionState = useTypedSelector((state) => state.workflows.optionState);
  const localFiles = useTypedSelector(
    (state) => state.workflows.localfilePayload.files
  );
  const { selectedOption, isOpen, toggleTemplateText } = optionState;
  const [nodeName, setNodeName] = React.useState("");
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
          selectedOption: id,
          isOpen: !isOpen,
          plugins: workflowPlugins[id],
          localFiles,
        })
      );
    }
  };

  const onToggle = () => {
    dispatch(
      setOptionState({
        ...optionState,
        isOpen: !isOpen,
        localFiles,
      })
    );
  };
  const handleNodeClick = (nodeName: string) => {
    setNodeName(nodeName);
  };

  const handleInputChange = (value: string) => {
    dispatch(setInfantAge(value));
  };

  const menuItems = workflows.map((workflow: string) => {
    return (
      <>
        <OptionsMenuItem
          onSelect={handleSelect}
          id={workflow}
          key={workflow}
          name={workflowTitle[workflow].title}
          isSelected={selectedOption === workflow}
        >
          {workflowTitle[workflow].title}
        </OptionsMenuItem>
      </>
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
      <OptionsMenu
        id="option-menu"
        isOpen={isOpen}
        menuItems={menuItems}
        toggle={toggle}
      />
      <div
        style={{
          display: "flex",
          height: "100%",
        }}
      >
        <Tree handleNodeClick={handleNodeClick} />
        {nodeName && <ConfigurationPage nodeName={nodeName} />}
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
