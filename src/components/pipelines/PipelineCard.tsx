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
      <Card id="second-card" isHoverable onClick={() => history.push("/pipelines/1")} >
        <CardTitle style={{ color: "#042c53", fontSize: "1.2rem" }}>
          {Name}
        </CardTitle>
        <CardBody>{Description}<br/>
        <p style={{color: "#042c53"}}>Jane Doe <b>3 days ago</b></p></CardBody>
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
