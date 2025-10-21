import type { PluginInstance } from "@fnndsc/chrisapi";
import AddNode from "../AddNode/AddNode";
import { AddNodeProvider } from "../AddNode/context";
import AddPipeline from "../AddPipeline/AddPipeline";
import DeleteNode from "../DeleteNode";
import { PipelineProvider } from "../PipelinesCopy/context";

type Props = {
  addNodeLocally: (instance: PluginInstance | PluginInstance[]) => void;
  isStaff: boolean;
};
export default (props: Props) => {
  const { addNodeLocally, isStaff } = props;
  return (
    <>
      <AddNodeProvider>
        <AddNode addNodeLocally={addNodeLocally} />
      </AddNodeProvider>
      <DeleteNode />
      <PipelineProvider>
        <AddPipeline isStaff={isStaff} addNodeLocally={addNodeLocally} />
      </PipelineProvider>
    </>
  );
};
