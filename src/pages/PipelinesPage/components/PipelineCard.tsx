import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
} from "@patternfly/react-core";
import { EyeIcon } from "@patternfly/react-icons";
import React from "react";
import { useHistory } from "react-router";

const PipelineCard = ({ Name, Description, ...props }: any) => {
  const history = useHistory();

  return (
    <div {...props}>
      <Card id="second-card" isHoverable>
        <CardTitle>{Name}</CardTitle>
        <CardBody>{Description}</CardBody>
        <CardFooter>
          <Button
            icon={<EyeIcon />}
            iconPosition="left"
            onClick={() => history.push("/pipelines/1")}
          >
            View Pipeline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PipelineCard;
