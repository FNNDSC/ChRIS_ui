import React from "react";
import { useDispatch } from "react-redux";
import ReactJson from "react-json-view";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { PlusButtonIcon } from "../../icons";
import PipelineContainer from "../CreateFeed/PipelineContainter";
import { PipelineContext } from "../CreateFeed/context";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";
import {
  getSelectedPlugin,
  getPluginInstancesSuccess,
} from "../../store/pluginInstance/actions";
import { getPluginInstanceStatusRequest } from "../../store/resources/actions";
import { PipelineTypes } from "../CreateFeed/types/pipeline";
import { getNodeOperations } from "../../store/plugin/actions";

const AddPipeline = () => {
  const reactDispatch = useDispatch();

  const feed = useTypedSelector((state) => state.feed.currentFeed.data);
  const { selectedPlugin } = useTypedSelector((state) => state.instance);
  const { childPipeline } = useTypedSelector(
    (state) => state.plugin.nodeOperations,
  );
  const { state, dispatch: pipelineDispatch } =
    React.useContext(PipelineContext);
  const { pipelineData, selectedPipeline } = state;
  const [error, setError] = React.useState({});

  const handleToggle = () => {
    setError({});
    reactDispatch(getNodeOperations("childPipeline"));
  };

  React.useEffect(() => {
    const el = document.querySelector(".react-json-view");

    if (el) {
      //@ts-ignore
      el!.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  const addPipeline = async () => {
    setError({});
    if (selectedPlugin && selectedPipeline && feed) {
      setError({});
      const {
        pluginPipings,
        pipelinePlugins,
        pluginParameters,
        computeEnvs,
        parameterList,
        title,
      } = pipelineData[selectedPipeline];

      if (pluginPipings && pluginParameters && pipelinePlugins) {
        const client = ChrisAPIClient.getClient();
        try {
          const nodes_info = client.computeWorkflowNodesInfo(
            //@ts-ignore
            pluginParameters.data,
          );
          nodes_info.forEach((node) => {
            if (computeEnvs && computeEnvs[node["piping_id"]]) {
              const compute_node =
                computeEnvs[node["piping_id"]]["currentlySelected"];

              const titleChange = title && title[node["piping_id"]];
              if (titleChange) {
                node.title = titleChange;
              }
              if (compute_node) {
                node.compute_resource_name = compute_node;
              }
            }

            if (parameterList && parameterList[node["piping_id"]]) {
              const params = parameterList[node["piping_id"]];
              node["plugin_parameter_defaults"] = params;
            }
          });
          await client.createWorkflow(selectedPipeline, {
            previous_plugin_inst_id: selectedPlugin.data.id,
            nodes_info: JSON.stringify(nodes_info),
          });

          pipelineDispatch({
            type: PipelineTypes.ResetState,
          });

          const data = await feed.getPluginInstances({
            limit: 1000,
          });
          if (data.getItems()) {
            const instanceList = data.getItems();
            const firstInstance = instanceList && instanceList[0];
            reactDispatch(getSelectedPlugin(firstInstance));
            if (instanceList) {
              const pluginInstanceObj = {
                selected: firstInstance,
                pluginInstances: instanceList,
              };
              reactDispatch(getPluginInstancesSuccess(pluginInstanceObj));
              reactDispatch(getPluginInstanceStatusRequest(pluginInstanceObj));
            }
          }
          handleToggle();
        } catch (error: any) {
          const errorMessage = error.response.data || error.message;
          setError(errorMessage);
        }
      }
    }
  };

  return (
    <React.Fragment>
      <Button icon={<PlusButtonIcon />} onClick={handleToggle} type="button">
        Add a Pipeline <span style={{ padding: "2px" }}>( P )</span>
      </Button>
      <Modal
        variant={ModalVariant.large}
        aria-label="My Pipeline Modal"
        isOpen={childPipeline}
        onClose={handleToggle}
        description="Add a Pipeline to the plugin instance"
        actions={[
          <Button
            isDisabled={!state.selectedPipeline}
            key="confirm"
            variant="primary"
            onClick={addPipeline}
          >
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={handleToggle}>
            Cancel
          </Button>,
        ]}
      >
        <PipelineContainer />
        <div id="error">
          {Object.keys(error).length > 0 && (
            <ReactJson theme="grayscale" src={error} />
          )}
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default AddPipeline;
