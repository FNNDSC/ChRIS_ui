import React from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, List, ListItem } from "@patternfly/react-core";
import { PlusCircleIcon } from "@patternfly/react-icons";
import { useTypedSelector } from "../../../store/hooks";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { addNodeRequest } from "../../../store/pluginInstance/actions";
const AddPipeline = () => {
  const dispatch = useDispatch();
  const { selectedPlugin, pluginInstances } = useTypedSelector(
    (state) => state.instance
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPipeline, setSelectedPipeline] = React.useState<any>();

  const handleToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const addPipeline = async () => {
    const client = ChrisAPIClient.getClient();
    if (selectedPlugin && selectedPipeline) {
      const pipelineInstance = await client.createPipelineInstance(
        selectedPipeline.data.id,
        {
          previous_plugin_inst_id: selectedPlugin.data.id,
        }
      );

      const plugins = await pipelineInstance.getPluginInstances();
      const pluginList = plugins.getItems();
      if (pluginList) {
        for (let i = 0; i < pluginList.length; i++) {
          const pluginItem = pluginList[i];
          dispatch(
            addNodeRequest({
              pluginItem,
              nodes: pluginInstances.data,
            })
          );
        }
      }
    }
    setIsModalOpen(!isModalOpen);
  };

  const handleSelectPipeline = (pipeline: any) => {
    setSelectedPipeline(pipeline);
  };

  return (
    <React.Fragment>
      <Button icon={<PlusCircleIcon />} onClick={handleToggle} type="button">
        Add a Pipeline
      </Button>
      <Modal
        aria-label="My Pipeline Modal"
        isOpen={isModalOpen}
        description="Add a Pipeline to the plugin instance"
        actions={[
          <Button key="confirm" variant="primary" onClick={addPipeline}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={handleToggle}>
            Cancel
          </Button>,
        ]}
      >
        <PipelineList
          selectedPipeline={selectedPipeline}
          handleSelectPipeline={handleSelectPipeline}
          addPipeline={addPipeline}
        />
      </Modal>
    </React.Fragment>
  );
};

export default AddPipeline;

interface PipelineListProps {
  addPipeline: () => void;
  handleSelectPipeline: (pipeline: any) => void;
  selectedPipeline?: any;
}

const PipelineList = ({
  addPipeline,
  selectedPipeline,
  handleSelectPipeline,
}: PipelineListProps) => {
  const [pipelines, setPipelines] = React.useState<any[]>([]);
  React.useEffect(() => {
    async function fetchPipelines() {
      const client = ChrisAPIClient.getClient();
      const params = {
        limit: 10,
        offset: 0,
      };
      const registeredPipelinesList = await client.getPipelines(params);
      const registeredPipelines = registeredPipelinesList.getItems();
      if (registeredPipelines) {
        setPipelines(registeredPipelines);
      }
    }

    fetchPipelines();
  }, []);

  const handleClick = (pipeline: any) => {
    handleSelectPipeline(pipeline);
  };

  return (
    <List isPlain>
      {pipelines.map((pipeline) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1.25em",
          }}
          key={pipeline.data.id}
        >
          <ListItem>{pipeline.data.name}</ListItem>
          <Button
            onClick={() => handleClick(pipeline)}
            variant="primary"
            isDisabled={
              selectedPipeline && selectedPipeline.data.id === pipeline.data.id
            }
          >
            Select
          </Button>
        </div>
      ))}
    </List>
  );
};
