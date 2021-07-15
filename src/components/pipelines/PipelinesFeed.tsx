import { PageSection, Spinner, Form, FormGroup, TextInput } from "@patternfly/react-core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import PipelineCard from "./PipelineCard";
import {SearchIcon} from "@patternfly/react-icons"

const PipelinesFeed = () => {
  const [Pipelines, setPipelines] = useState([]);
  const [Search_query, setSearch_query] = useState("")

  useEffect(() => {
    axios
      .get(`https://store.outreachy.chrisproject.org/api/v1/pipelines/`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((response: any) => {
        return setPipelines(response?.data.results);
      })
      .catch((errors) => {
        console.error(errors);
      });
  }, []);


  return (
    <PageSection>
      <Form style={{maxWidth: "250px", marginLeft:"5%"}}>
       <FormGroup fieldId="search_query">
          <TextInput
          iconVariant="search"
          placeholder="Search Pipeline"
            type="text"
            id="search_query"
            name="search_query"
            value={Search_query}
            onChange={(val)=> setSearch_query(val)}
          />
        </FormGroup>
        </Form>
      <div className="pipelines">
        {/* {console.log("Pipelines state", Pipelines)}
        {Pipelines.length > 0 ? (
          Pipelines.map((pipeline: any) => {
            {
              console.log("Pipelines each", pipeline);
            }
            <PipelineCard
              Pipeline_name={pipeline.name}
              Description={pipeline.description}
              Author={pipeline.authors}
              Date_created={pipeline.creation_date}
              Pipeline_id={pipeline.id}
            />;
          })
        ) : (
          <Spinner isSVG />
        )} */}
        <PipelineCard
          Pipeline_name="Fetal Brain MRI Reconstruction pipeline"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
          Author="Jane Doe"
          Date_created={"12-08-2021"}
          Pipeline_id={1}
        />
        <PipelineCard
          Pipeline_name="Fetal Brain MRI Reconstruction pipeline"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
          Author="Jane Doe"
          Date_created={"12-08-2021"}
          Pipeline_id={1}
        />
        <PipelineCard
          Pipeline_name="Fetal Brain MRI Reconstruction pipeline"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
          Author="Jane Doe"
          Date_created={"12-08-2021"}
          Pipeline_id={1}
        />
        <PipelineCard
          Pipeline_name="Fetal Brain MRI Reconstruction pipeline"
          Description="This is a selectable card. Click me to select me. Click again to
          deselect me."
          Author="Jane Doe"
          Date_created={"12-08-2021"}
          Pipeline_id={1}
        />
      </div>
    </PageSection>
  );
};

export default PipelinesFeed;
