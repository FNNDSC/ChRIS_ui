import React, { useContext } from "react";
import { AiOutlineUpload } from "react-icons/ai";
import ReactJSON from "react-json-view";
import { Types } from "../CreateFeed/types";
import { CreateFeedContext } from "../CreateFeed/context";
import { Button, Alert } from "@patternfly/react-core";
import { generatePipeline } from "../CreateFeed/utils/pipelines";

export const UploadJson = () => {
  const { dispatch } = useContext(CreateFeedContext);
  const fileOpen = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState({});

  const showOpenFile = () => {
    if (fileOpen.current) {
      fileOpen.current.click();
    }
  };

  const readFile = (file: any) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        if (reader.result) {
          const result = JSON.parse(reader.result as string);

          result["plugin_tree"] = JSON.stringify(result["plugin_tree"]);
          setFileName(result.name);
          const { resources, pipelineInstance } = await generatePipeline(
            result.name,
            result
          );
          const { parameters, pluginPipings, pipelinePlugins } = resources;

          dispatch({
            type: Types.AddPipeline,
            payload: {
              pipeline: pipelineInstance,
            },
          });

          dispatch({
            type: Types.SetPipelineResources,
            payload: {
              parameters,
              pluginPipings,
              pipelinePlugins,
            },
          });
        }
      } catch (error: any) {
        console.log("Error", error)
        const errorMessage = error.response.data;
        setError(errorMessage);
      }
    };
    if (file) {
      reader.readAsText(file);
    }
  };

  const handleUpload = (event: any) => {
    const file = event.target.files && event.target.files[0];
    readFile(file);
  };

  const keys = Object.keys(error).length;

  return (
    <>
      <div
        style={{
          margin: "0.35em 0",
        }}
      >
        <span style={{ marginRight: "0.5rem", fontWeight: 700 }}>
          {fileName}
        </span>
        <Button onClick={showOpenFile} icon={<AiOutlineUpload />}>
          Upload a JSON spec{" "}
        </Button>
      </div>
      <div
        style={{
          height: "200px",
        }}
      >
        {keys > 0 && (
          <ReactJSON
            name={false}
            displayDataTypes={false}
            src={error}
            displayObjectSize={false}
            collapsed={false}
          />
        )}
      </div>

      <input
        ref={fileOpen}
        style={{ display: "none" }}
        type="file"
        onChange={handleUpload}
      />
    </>
  );
};

export default UploadJson;
