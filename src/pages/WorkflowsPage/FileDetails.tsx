import React from "react";
import { useHistory } from "react-router-dom";
import {
  PageSection,
  Card,
  CardTitle,
  CardBody,
  Button,
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuToggle,
} from "@patternfly/react-core";
import FileUpload from "../../components/common/fileupload";
import { Steps } from "antd";
import { useTypedSelector } from "../../store/hooks";
import {
  setLocalFile,
  submitAnalysis,
  setOptionState,
  resetWorkflowState,
  deleteLocalFile,
} from "../../store/workflows/actions";
import { useDispatch } from "react-redux";
import { AnalysisStep } from "../../store/workflows/types";
import { LocalFile } from "../../components/feed/CreateFeed/types";

const { Step } = Steps;

const workflows = [
  "covidnet",
  "infant-freesurfer",
  "adult-freesurfer",
  "fastsurfer",
  "fetal-reconstruction",
];

const FileDetails = () => {
  const isAnalysisRunning = useTypedSelector(
    (state) => state.workflows.isAnalysisRunning
  );
  return (
    <PageSection>
      <Card>
        <CardTitle>
          {isAnalysisRunning === true
            ? "Runnng an Analysis"
            : "Run an Analysis"}
        </CardTitle>
        <CardBody>
          <FileUploadComponent />
          <SelectWorkflow />
          <SubmitAnalysis />
        </CardBody>
      </Card>
    </PageSection>
  );
};

const FileUploadComponent = () => {
  const localFilePayload = useTypedSelector(
    (state) => state.workflows.localfilePayload
  );
  const dispatch = useDispatch();
  const { files } = localFilePayload;

  const handleDispatch = (files: LocalFile[]) => {
    dispatch(setLocalFile(files));
  };

  const handleDeleteDispatch = (fileName: string) => {
    dispatch(deleteLocalFile(fileName));
  };

  return (
    <Card className="file-upload-card">
      <CardBody>
        <h1 className="pf-c-title pf-m-2xl">
          File Selection: Local File Upload
        </h1>
        <p>Choose files from your local computer to create a feed</p>
        <br />
        <FileUpload
          handleDeleteDispatch={handleDeleteDispatch}
          localFiles={files}
          dispatchFn={handleDispatch}
        />
      </CardBody>
    </Card>
  );
};

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

    if (id)
      dispatch(
        setOptionState({
          ...optionState,
          toggleTemplateText: id,
          selectedOption: id,
        })
      );
  };

  const onToggle = () => {
    dispatch(
      setOptionState({
        ...optionState,
        isOpen: !isOpen,
      })
    );
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
    <Card>
      <CardBody>
        <OptionsMenu
          id="option menu"
          isOpen={isOpen}
          menuItems={menuItems}
          toggle={toggle}
        />
      </CardBody>
    </Card>
  );
};

const SubmitAnalysis = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const localFiles = useTypedSelector(
    (state) => state.workflows.localfilePayload.files
  );
  const workflowType = useTypedSelector(
    (state) => state.workflows.optionState.selectedOption
  );
  const username = useTypedSelector((state) => state.user.username);

  const steps = useTypedSelector((state) => state.workflows.steps);
  const handleClick = () => {
    if (localFiles.length > 0 && username) {
      dispatch(
        submitAnalysis({
          localFiles,
          workflowType,
          username,
        })
      );
    }
  };

  const feedId = useTypedSelector((state) => state.workflows.checkFeedDetails);
  const isAnalysisRunning = useTypedSelector(
    (state) => state.workflows.isAnalysisRunning
  );

  return (
    <Card>
      <CardBody>
        <Button
          isDisabled={!workflowType || isAnalysisRunning ? true : false}
          onClick={handleClick}
        >
          Submit An Analysis
        </Button>
      </CardBody>
      <CardBody>
        <Steps>
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
      </CardBody>
      <CardBody>
        <Button
          style={{
            marginRight: "0.5rem",
          }}
          onClick={() => {
            if (feedId) {
              history.push(`/feeds/${feedId}`);
            }
          }}
          isDisabled={!feedId ? true : false}
          variant="primary"
        >
          Check Feed Details
        </Button>
        <Button
          onClick={() => dispatch(resetWorkflowState())}
          isDisabled={isAnalysisRunning ? true : false}
        >
          Reset
        </Button>
      </CardBody>
    </Card>
  );
};

export default FileDetails;
