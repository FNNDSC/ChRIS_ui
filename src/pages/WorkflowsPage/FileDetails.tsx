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
          height: `${id === 1 ? "350px" : id === 2 ? "150px" : "300px"}`,
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
  "infant-freesurfer",
  "infant-freesurfer-age",
  "adult-freesurfer",
  "fastsurfer",
  "fetal-reconstruction",
];

const SelectWorkflow = () => {
  const dispatch = useDispatch();
  const optionState = useTypedSelector((state) => state.workflows.optionState);
  const { selectedOption, isOpen, toggleTemplateText } = optionState;
  const handleSelect = (
    event?:
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
      | React.KeyboardEvent<Element>
  ) => {
    const id = event?.currentTarget.id;
    if (id) {
      dispatch(
        setOptionState({
          ...optionState,
          toggleTemplateText: id,
          selectedOption: id,
          isOpen: !isOpen,
        })
      );
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

  const handleInputChange = (value: string) => {
    dispatch(setInfantAge(value));
  };

  const menuItems = workflows.map((workflow: string, index: number) => {
    return (
      <OptionsMenuItem
        onSelect={handleSelect}
        id={workflow}
        key={index}
        isSelected={selectedOption === workflow}
      >
        {workflow}
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
      <OptionsMenu
        id="option-menu"
        isOpen={isOpen}
        menuItems={menuItems}
        toggle={toggle}
      />
      {selectedOption === "infant-freesurfer-age" && (
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
    </>
  );
};

export default FileDetails;
