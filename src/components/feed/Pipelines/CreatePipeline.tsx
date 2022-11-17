import React from "react";
import ReactJson from "react-json-view";
import { Spin } from "antd";
import { Button, TextInput } from "@patternfly/react-core";
import { CreatePipelineProps } from "../CreateFeed/types/pipeline";
import { generatePipelineWithData } from "../CreateFeed/utils/pipelines";

const CreatingPipeline = ({
  pipelines,
  pipeline,
  state,
  handleDispatchPipelines,
}: CreatePipelineProps) => {
  const { pluginParameters, pluginPipings, title, input } = state;
  const [creatingPipeline, setCreatingPipeline] = React.useState({
    loading: false,
    error: {},
    pipelineName: "",
  });
  const handlePipelineCreate = async () => {
    setCreatingPipeline({
      ...creatingPipeline,
      loading: true,
    });
    const mappedArr: any[] = [];
    try {
      pluginPipings?.forEach((piping: any) => {
        const defaults = pluginParameterDefaults(
          //@ts-ignore
          pluginParameters.data,
          piping.data.id,
          input
        );

        const id = pluginPipings.findIndex(
          (pipe: any) => pipe.data.id === piping.data.previous_id
        );

        let titleChange = piping.data.title;
        if (title && title[piping.data.id]) {
          titleChange = title[piping.data.id];
        }

        const treeObl = {
          plugin_name: piping.data.plugin_name,
          plugin_version: piping.data.plugin_version,
          previous_index: id === -1 ? null : id,
          title: titleChange,
          plugin_parameter_defaults: defaults,
        };
        mappedArr.push(treeObl);
      });

      const result = {
        name: `${creatingPipeline.pipelineName}`,
        authors: pipeline.data.authors,
        locked: pipeline.data.locked,
        description: pipeline.data.description,
        plugin_tree: JSON.stringify(mappedArr),
      };

      const { pipelineInstance } = await generatePipelineWithData(result);
      setCreatingPipeline({
        ...creatingPipeline,
        loading: false,
      });
      if (pipelineInstance) {
        handleDispatchPipelines([pipelineInstance, ...pipelines]);
      }
    } catch (error: any) {
      setCreatingPipeline({
        ...creatingPipeline,
        error: error.response.data,
        loading: false,
      });
    }
  };
  return (
    <div>
      <TextInput
        style={{
          marginRight: "1rem",
          width: "30%",
          marginBottom: "1em",
        }}
        aria-label="Name for the edited pipeline"
        placeholder="Enter a name for the pipeline"
        value={creatingPipeline.pipelineName}
        onKeyDown={(event) => {
          event.key === "Enter" && handlePipelineCreate();
        }}
        onChange={(value) =>
          setCreatingPipeline({
            ...creatingPipeline,
            pipelineName: value,
            error: {},
          })
        }
      />
      <Button
        isDisabled={creatingPipeline.loading ? true : false}
        onClick={handlePipelineCreate}
      >
        Save Pipeline
      </Button>

      {creatingPipeline.loading && <Spin tip="Saving a new pipeline" />}
      {Object.keys(creatingPipeline.error).length > 0 && (
        <span>
          <ReactJson src={creatingPipeline.error} />
        </span>
      )}
    </div>
  );
};

export default CreatingPipeline;

const pluginParameterDefaults = (parameters: any[], id: number, input: any) => {
  const currentInput = input[id];

  const defaults = [];

  if (currentInput) {
    let totalInput = {};

    if (currentInput.dropdownInput) {
      totalInput = { ...totalInput, ...currentInput.dropdownInput };
    }
    if (currentInput.requiredInput) {
      totalInput = { ...totalInput, ...currentInput.requiredInput };
    }

    for (const input in totalInput) {
      //@ts-ignore
      const parameter = totalInput[input];
      defaults.push({
        name: parameter.paramName,
        default: parameter.value,
      });
    }
  } else {
    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i];
      if (parameter.plugin_piping_id === id) {
        defaults.push({
          name: parameter.param_name,
          default: parameter.value,
        });
      }
    }
  }

  return defaults;
};
