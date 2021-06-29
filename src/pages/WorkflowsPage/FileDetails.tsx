import React from "react";
import { useHistory } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuToggle,
  Form,
  TextInput,
  Alert,
} from "@patternfly/react-core";
import FileUpload from "../../components/common/fileupload";
import { Steps } from "antd";
import { useTypedSelector } from "../../store/hooks";
import {
  setLocalFile,
  submitAnalysis,
  setOptionState,
  setInfantAge,
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
  "infant-freesurfer-age",
  "adult-freesurfer",
  "fastsurfer",
  "fetal-reconstruction",
];

const FileDetails = () => {
  return (
    <>
      <FileUploadComponent />
      <SelectWorkflow />
      <SubmitAnalysis />
    </>
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
        <h1 className="pf-c-title pf-m-lg">
          File Selection: Local File Upload
        </h1>
        <p>Choose files from your local computer to run a workflow</p>
        <br />
        <FileUpload
          className="workflow-file-upload"
          handleDeleteDispatch={handleDeleteDispatch}
          localFiles={files}
          dispatchFn={handleDispatch}
        />
      </CardBody>
    </Card>
  );
};

const SelectWorkflow = () => {
  const [error, setError] = React.useState("");
  const dispatch = useDispatch();
  const optionState = useTypedSelector((state) => state.workflows.optionState);
  const username = useTypedSelector((state) => state.user.username);
  const localFiles = useTypedSelector(
    (state) => state.workflows.localfilePayload.files
  );

  const infantAge = useTypedSelector((state) => state.workflows.infantAge);

  React.useEffect(() => {
    if (infantAge) setError("");
    if (localFiles.length < 15) setError("");
  }, [infantAge, localFiles]);
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
          isOpen: !isOpen,
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

  const dispatchAction = () => {
    if (localFiles.length > 0 && username) {
      dispatch(
        submitAnalysis({
          localFiles,
          username,
          workflowType: selectedOption,
          infantAge,
        })
      );
    }
  };

  const handleClick = () => {
    if (selectedOption === "infant-freesurfer-age") {
      if (!infantAge) {
        setError("Please enter an age for the infant");
      } else {
        dispatchAction();
      }
    } else if (selectedOption === "covidnet") {
      if (localFiles.length > 15) {
        setError("The covidnet workflow can only run on 15 files or less");
      } else {
        dispatchAction();
      }
    } else dispatchAction();
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

  const handleInputChange = (value: string) => {
    dispatch(setInfantAge(value));
  };

  return (
    <Card>
      <CardBody>
        <OptionsMenu
          id="option menu"
          isOpen={isOpen}
          menuItems={menuItems}
          toggle={toggle}
        />
        <Button 
        className='workflow-button'
        onClick={handleClick}>Submit An Analysis</Button>
        {selectedOption === "infant-freesurfer-age" && (
          <div className="workflow-form">
            <Form isHorizontal>
              <TextInput
                isRequired
                type="text"
                id="infant-age"
                name="infant-age"
                onChange={handleInputChange}
                placeholder="Enter an Infant's age"
              />
            </Form>
          </div>
        )}
        {error && <Alert title={error} />}
      </CardBody>
    </Card>
  );
};

const SubmitAnalysis = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const steps = useTypedSelector((state) => state.workflows.steps);

  const feedId = useTypedSelector((state) => state.workflows.checkFeedDetails);
  const isAnalysisRunning = useTypedSelector(
    (state) => state.workflows.isAnalysisRunning
  );

  return (
    <Card>
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
          Reset Page
        </Button>
      </CardBody>
    </Card>
  );
};

export default FileDetails;
