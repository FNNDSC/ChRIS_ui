import React from "react";
import { useDispatch } from "react-redux";
import { Button, Modal } from "@patternfly/react-core";
import { MdOutlineAddCircle } from "react-icons/md";
import PipelineContainer from "../CreateFeed/PipelineContainer";
import { PipelineContext } from "../CreateFeed/context";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { useTypedSelector } from "../../../store/hooks";
import {
  getSelectedPlugin,
  getPluginInstancesSuccess,
} from "../../../store/pluginInstance/actions";
import { getPluginInstanceStatusRequest } from "../../../store/resources/actions";
import ReactJson from "react-json-view";

const AddPipeline = () => {
  const reactDispatch = useDispatch();
  const { selectedPlugin } = useTypedSelector((state) => state.instance);
  const { state } = React.useContext(PipelineContext);
  const { pipelineData, selectedPipeline } = state;
  const [error, setError] = React.useState({});

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const handleToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const addPipeline = async () => {
    if (selectedPlugin && selectedPipeline) {
      setError({});
      const { pluginPipings, pipelinePlugins, pluginParameters } =
        pipelineData[selectedPipeline];

      if (pluginPipings && pluginParameters && pipelinePlugins) {
        const client = ChrisAPIClient.getClient();
        try {
          const nodes_info = client.computeWorkflowNodesInfo(
            //@ts-ignore
            pluginParameters.data
          );
          await client.createWorkflow(selectedPipeline, {
            previous_plugin_inst_id: selectedPlugin.data.id,
            nodes_info: JSON.stringify(nodes_info),
          });

          const data = await selectedPlugin.getDescendantPluginInstances({
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
        } catch (error: any) {
          setError(error.response.data);
        }
      }
      handleToggle();
    }
  };
  return (
    <React.Fragment>
      <Button
        icon={<MdOutlineAddCircle />}
        onClick={handleToggle}
        type="button"
      >
        Add a Pipeline
      </Button>
      <Modal
        style={{
          height: "100%",
        }}
        variant="medium"
        aria-label="My Pipeline Modal"
        isOpen={isModalOpen}
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
        {Object.keys(error).length > 0 && <ReactJson src={error} />}
      </Modal>
    </React.Fragment>
  );
};

export default AddPipeline;
