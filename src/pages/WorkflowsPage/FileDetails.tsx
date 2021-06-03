import React from "react";
import {
  PageSection,
  Card,
  CardTitle,
  CardBody,
  Button,
  FileUpload,
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuToggle,
} from "@patternfly/react-core";
import { CheckIcon } from "@patternfly/react-icons";
import { Steps } from "antd";
import { useTypedSelector } from "../../store/hooks";
import { submitAnalysis } from "../../store/workflows/actions";
import { useDispatch } from "react-redux";
import { AnalysisStep } from "../../store/workflows/types";

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
  const [file, setFile] = React.useState<string | File>();
  const [filename, setFileName] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  const handleFileUpload = () => {
    setUploading(true);
  };

  const handleFileChange = (value: string | File, filename: any) => {
    setFile(file);
    setFileName(filename);
  };

  return (
    <Card>
      <CardBody>
        <FileUpload
          multiple={true}
          validated={file ? "success" : "default"}
          id="file-upload"
          onChange={handleFileChange}
          isClearButtonDisabled={false}
          filenamePlaceholder={
            file
              ? "Run an analysis with the uploaded file or Choose another file"
              : "Drag a file here or browse to upload"
          }
        >
          {file && (
            <div className="pf-u-m-md">
              <CheckIcon
                style={{
                  color: "green",
                  marginRight: "0.25em",
                }}
              />
              <span>{filename} uploaded successfully</span>
            </div>
          )}
        </FileUpload>
        <Button
          style={{
            marginTop: "2em",
          }}
          onClick={handleFileUpload}
        >
          Upload to Swift
        </Button>
      </CardBody>
    </Card>
  );
};

const SelectWorkflow = () => {
  const [optionState, setOptionState] = React.useState({
    isOpen: false,
    toggleTemplateText: "Choose a Workflow",
    selectedOption: "",
  });
  const { selectedOption, isOpen, toggleTemplateText } = optionState;

  const handleSelect = (
    event?:
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
      | React.KeyboardEvent<Element>
  ) => {
    const id = event?.currentTarget.id;

    if (id)
      setOptionState({
        ...optionState,
        toggleTemplateText: id === "covidnet" ? "CovidNET" : "FreeSurfer",
        selectedOption: id,
      });
  };

  const onToggle = () => {
    setOptionState({
      ...optionState,
      isOpen: !isOpen,
    });
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
      id="freesurfer"
      key="option 2"
      isSelected={selectedOption === "freesurfer"}
    >
      FreeSurfer
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
  const currentFile = useTypedSelector((state) => state.workflows.currentFile);

  const steps = useTypedSelector((state) => state.workflows.steps);
  const handleClick = () => {
    if (currentFile) dispatch(submitAnalysis(currentFile));
  };
  const isAnalysisRunning = useTypedSelector(
    (state) => state.workflows.isAnalysisRunning
  );

  return (
    <Card>
      <CardBody>
        <Button
          isDisabled={isAnalysisRunning || !currentFile ? true : false}
          onClick={handleClick}
        >
          Submit An Analysis
        </Button>
        <Steps className="workflow-steps" direction="horizontal">
          {steps.map((step: AnalysisStep) => {
            return (
              <Step
                key={step.id}
                status={step.status}
                title={step.title}
                description={step.description}
              />
            );
          })}
        </Steps>
      </CardBody>
    </Card>
  );
};

export default FileDetails;
