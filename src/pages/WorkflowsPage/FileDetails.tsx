import React from "react";
import {
  PageSection,
  Card,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Button,
} from "@patternfly/react-core";
import { Steps } from "antd";
import { useTypedSelector } from "../../store/hooks";
import { submitAnalysis } from "../../store/workflows/actions";
import { useDispatch } from "react-redux";
import { AnalysisStep } from "../../store/workflows/types";

const { Step } = Steps;

const FileDetails = () => {
  return (
    <PageSection>
      <Card>
        <CardTitle>Run an Analysis:</CardTitle>
        <CardBody>
          <AnalysisDetails />
          <SubmitAnalysis />
        </CardBody>
      </Card>
    </PageSection>
  );
};

const AnalysisDetails = () => {
  const currentFile = useTypedSelector((state) => state.workflows.currentFile);
  const renderFlexItem = (title: string, value: string) => {
    return (
      <Flex>
        <FlexItem>{title}</FlexItem>
        <FlexItem>{value}</FlexItem>
      </Flex>
    );
  };
  return (
    <Card>
      <CardTitle>Additional Details for the selected study:</CardTitle>
      <CardBody>
        {renderFlexItem(
          "Protocol Name:",
          `${currentFile ? currentFile.data.ProtocolName : "N/A"}`
        )}
        {renderFlexItem(
          "Series Description:",
          `${currentFile ? currentFile.data.SeriesDescription : "N/A"}`
        )}
        {renderFlexItem(
          "PACS Identifier:",
          `${currentFile ? currentFile.data.pacs_identifier : "N/A"}`
        )}
      </CardBody>
    </Card>
  );
};

const SubmitAnalysis = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const currentFile = useTypedSelector((state) => state.workflows.currentFile);
  const steps = useTypedSelector((state) => state.workflows.steps);
  const handleClick = () => {
    setLoading(true);
    if (currentFile) dispatch(submitAnalysis(currentFile));
  };

  return (
    <Card>
      <CardBody>
        <Button isDisabled={loading} onClick={handleClick}>
          Submit An Analysis
        </Button>

        <Steps className="workflow-steps" direction="vertical" size="small">
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
