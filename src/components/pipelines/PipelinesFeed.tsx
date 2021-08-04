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
      .get(`https://store.outreachy.chrisproject.org/api/v1/pipelines/search`, {
        headers: {
          "Content-Type": "application/vnd.collection+json",
        },
        params: { name: Search_query },
      })
      .then((response: any) => {
        setPipelines(response?.data.results);
        console.log("Filtered Pipelines", response.data.count);
        console.log("query Searched", Search_query);
      })
      .catch((errors) => {
        console.error(errors.message);
        console.log("💩💩💩");
      });
  }, [Search_query]);

  const NotFound = () => {
    return (
      <p style={{ textAlign: "center" }}>
        We can&apos;t seem to find your pipeline!!
      </p>
    );
  };

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
            onChange={(searchTerm) => setSearch_query(searchTerm)}
          />
        </FormGroup>
      </Form>
      <div className="pipelines">
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
        ) : Search_query != "" ? (
          <NotFound />
        ) : (
          <Spinner isSVG />
        )}
      </div>
    </PageSection>
  );
};

export default PipelinesFeed;
