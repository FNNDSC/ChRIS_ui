import React from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Modal,
  List,
  ListItem,
  TextVariants,
  TextContent,
  Text,
  Alert,
  Divider,
} from "@patternfly/react-core";
import { PlusCircleIcon } from "@patternfly/react-icons";
import { useTypedSelector } from "../../../store/hooks";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { addNodeRequest } from "../../../store/pluginInstance/actions";
import { runPipelineSequence } from "../CreateFeed/utils/createFeed";
import { fetchResources } from "../CreateFeed/utils/pipelines";
const AddPipeline = () => {
  const dispatch = useDispatch();
  const { selectedPlugin, pluginInstances } = useTypedSelector(
    (state) => state.instance
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPipeline, setSelectedPipeline] = React.useState<any>();
  const [creatingPipeline, setCreatingPipeline] = React.useState(false);

  const handleToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const addPipeline = async () => {
    setCreatingPipeline(true);
    if (selectedPlugin && selectedPipeline) {
      const resources = await fetchResources(selectedPipeline);
      const {
        pluginPipings,
        parameters: pluginParameters,
        pipelinePlugins,
      } = resources;

      if (pluginPipings && pluginParameters && pipelinePlugins) {
        const pluginInstanceList = await runPipelineSequence(
          pluginPipings,
          pluginParameters,
          pipelinePlugins,
          selectedPlugin
        );
        for (let i = 0; i < pluginInstanceList.length; i++) {
          dispatch(
            addNodeRequest({
              pluginItem: pluginInstanceList[i],
              nodes: pluginInstances.data,
            })
          );
        }
      }
    }
    setIsModalOpen(!isModalOpen);
    setSelectedPipeline(undefined);
    setCreatingPipeline(false);
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
        onClose={handleToggle}
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
        {creatingPipeline && (
          <React.Fragment>
            <Alert
              variant="info"
              isInline
              isPlain
              title="Adding the pipeline to the selected Node"
            />
          </React.Fragment>
        )}
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
    <>
      <TextContent>
        <Text component={TextVariants.h1}>Select a Pipeline</Text>
      </TextContent>
      <List isPlain>
        {pipelines.map((pipeline) => (
          <React.Fragment key={pipeline.data.id}>
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
                  selectedPipeline &&
                  selectedPipeline.data.id === pipeline.data.id
                }
              >
                Select
              </Button>
            </div>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </>
  );
};
