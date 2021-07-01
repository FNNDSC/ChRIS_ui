import { PageSection } from "@patternfly/react-core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import PipelineCard from "../../../components/pipelines/PipelineCard";

// get request to chris api for pipeline with params: {plugin instance}
const PipelinesFeed = () => {
  const [Pipelines, setPipelines] = useState([]);

  useEffect(() => {
    axios
      .get(`https://store.outreachy.chrisproject.org/api/v1/pipelines/`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((response: any) => {
        // console.log(" Response from API", response.data.template.data);
        return setPipelines(response?.data.template.data);
      });
  }, []);

  return (
    <PageSection>
      <h1>Pipelines in here</h1>
      {/* {Pipelines.map((pipeline: any) => {
          <p>{Object.values(pipeline)}</p>;
          console.log("pipelines output", Object.values(pipeline)[0]);
        })} */}
      <div className="pipelines">
        <PipelineCard
          Name="PipelineCard name"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
        />
        <PipelineCard
          Name="PipelineCard name"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
        />
        <PipelineCard
          Name="PipelineCard name"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
        />
        <PipelineCard
          Name="PipelineCard name"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
        />
        <PipelineCard
          Name="PipelineCard name"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
        />
        <PipelineCard
          Name="PipelineCard name"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
        />
        <PipelineCard
          Name="PipelineCard name"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
        />
        <PipelineCard
          Name="PipelineCard name"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
        />
      </div>
    </PageSection>
  );
};

export default PipelinesFeed;
