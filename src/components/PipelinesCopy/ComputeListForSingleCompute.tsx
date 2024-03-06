import { Pipeline } from "@fnndsc/chrisapi";
import { Form } from "antd";
import { useContext } from "react";
import { EmptyStateComponent } from "../Common";
import ListCompute from "./ListCompute";
import { PipelineContext, Types } from "./context";

type OwnProps = {
  currentPipeline: Pipeline;
};

function ComputeListForSingleCompute({ currentPipeline }: OwnProps) {
  const { state, dispatch } = useContext(PipelineContext);
  const { computeInfo, currentlyActiveNode } = state;
  const { id } = currentPipeline.data;

  const currentNode = currentlyActiveNode?.[id];
  const currentCompute = currentNode
    ? computeInfo?.[id]?.[currentNode]
    : undefined;

  const computeResources = currentCompute?.computeEnvs || [];

  return (
    <Form layout="vertical">
      <Form.Item label="Compute registered for the selected node">
        {computeResources ? (
          <ListCompute
            currentlyActive={currentCompute?.currentlySelected}
            computeResources={computeResources}
            showCheckbox={true}
            handleComputeChange={(compute: string) => {
              dispatch({
                type: Types.SetChangeCompute,
                payload: {
                  pipelineId: id,
                  nodeId: currentlyActiveNode?.[id],
                  compute,
                },
              });
            }}
          />
        ) : (
          <EmptyStateComponent />
        )}
      </Form.Item>
    </Form>
  );
}

export default ComputeListForSingleCompute;
