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
import { PipelineCardProps } from "./pipelinetypes";

const PipelineCard = ({
  Pipeline_name,
  Description,
  Author,
  Date_created,
  Pipeline_id,
}: PipelineCardProps) => {
  const history = useHistory();

  return (
    <div>
      <Card key={Pipeline_id} isHoverable>
        <CardTitle style={{ color: "#042c53", fontSize: "1.2rem" }}>
          {Pipeline_name}
        </CardTitle>
        <CardBody>
          {Description}
          <br />
          <p style={{ color: "#042c53" }}>
            {Author} <b>{Date_created}</b>
          </p>
        </CardBody>
        <CardFooter>
          <Button
            style={{
              backgroundColor: "#042c53",
              cursor: "pointer",
              marginRight: "2px",
            }}
            icon={<EyeIcon />}
            iconPosition="left"
            onClick={() => history.push(`/pipelines/${Pipeline_id}`)}
          >
            View Pipeline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PipelineCard;
