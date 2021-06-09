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
} from "../../store/workflows/actions";
import { useDispatch } from "react-redux";
import { AnalysisStep } from "../../store/workflows/types";
import { LocalFile } from "../../components/feed/CreateFeed/types";

const { Step } = Steps;

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
  const { files, error, loading } = localFilePayload;

  const handleDispatch = (files: LocalFile[]) => {
    dispatch(setLocalFile(files));
  };

  return (
    <Card>
      <CardBody>
        <FileUpload localFiles={files} dispatchFn={handleDispatch} />
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
          toggleTemplateText:
            id === "covidnet"
              ? "CovidNET"
              : id === "infant-fressurfer"
              ? "Infant FreeSurfer"
              : "Adult FreeSurfer",
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

  const menuItems = [
    <OptionsMenuItem
      onSelect={handleSelect}
      id="covidnet"
      key="option 1"
      isSelected={selectedOption === "covidnet"}
    >
      CovidNET
    </OptionsMenuItem>,
    <OptionsMenuItem
      onSelect={handleSelect}
      id="infant-freesurfer"
      key="option 2"
      isSelected={selectedOption === "infant-freesurfer"}
    >
      Infant Freesurfer
    </OptionsMenuItem>,
    <OptionsMenuItem
      onSelect={handleSelect}
      id="adult-freesurfer"
      key="option 3"
      isSelected={selectedOption === "adult-freesurfer"}
    >
      Adult Freesurfer
    </OptionsMenuItem>,
  ];

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
  const currentPacsFile = useTypedSelector(
    (state) => state.workflows.currentPacsFile
  );
  const localFiles = useTypedSelector(
    (state) => state.workflows.localfilePayload.files
  );
  const workflowType = useTypedSelector(
    (state) => state.workflows.optionState.selectedOption
  );
  const username = useTypedSelector((state) => state.user.username);

  const steps = useTypedSelector((state) => state.workflows.steps);
  const handleClick = () => {
    if ((currentPacsFile.length > 0 || localFiles.length > 0) && username) {
      dispatch(
        submitAnalysis({
          pacsFile: currentPacsFile,
          localFiles,
          workflowType,
          username,
        })
      );
    }
  };
  const isAnalysisRunning = useTypedSelector(
    (state) => state.workflows.isAnalysisRunning
  );

  const feedId = useTypedSelector((state) => state.workflows.checkFeedDetails);

  return (
    <Card>
      <CardBody>
        <Button isDisabled={!workflowType ? true : false} onClick={handleClick}>
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
      </CardBody>
    </Card>
  );
};

export default FileDetails;
