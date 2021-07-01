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

type PipelineCardProps={
  Name: string,
  Description: string,
  props?: any
}

const PipelineCard = ({ Name, Description, ...props }: PipelineCardProps ) => {
  const history = useHistory();

  return (
    <div {...props}>
      <Card id="second-card" isHoverable>
        <CardTitle style={{ color: "#042c53", fontSize: "1.5rem" }}>
          {Name}
        </CardTitle>
        <CardBody>{Description}</CardBody>
        <CardFooter>
          <Button
            style={{ backgroundColor: "#042c53" }}
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
