import {
  PageSection,
  Spinner,
  Form,
  FormGroup,
  TextInput,
} from "@patternfly/react-core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import PipelineCard from "./PipelineCard";

const PipelinesFeed = () => {
  const [Pipelines, setPipelines] = useState([]);
  const [Search_query, setSearch_query] = useState("");

  useEffect(() => {
    axios
      .get(`https://store.outreachy.chrisproject.org/api/v1/pipelines/`, {
        headers: {
          "Content-Type": "application/vnd.collection+json",
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
      <Form style={{ maxWidth: "250px", marginLeft: "5%" }}>
        <FormGroup fieldId="search_query">
          <TextInput
            iconVariant="search"
            placeholder="Search Pipeline"
            type="text"
            id="search_query"
            name="search_query"
            value={Search_query}
            onChange={(val) => setSearch_query(val)}
          />
        </FormGroup>
      </Form>
      <div className="pipelines">
        {console.log("Pipelines state", Pipelines)}
        {Pipelines.length > 0 ? (
          Pipelines.map((pipeline: any) => {
            return (
              <PipelineCard
                key={pipeline.id}
                Pipeline_name={pipeline.name}
                Description={pipeline.description}
                Author={pipeline.authors}
                Date_created={pipeline.creation_date}
                Pipeline_id={pipeline.id}
              />
            );
          })
        ) : (
          <Spinner isSVG />
        )}
      </div>
    </PageSection>
  );
};

export default PipelinesFeed;
