import React, { useContext } from "react";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { PipelineContext } from "../CreateFeed/context";
import ListCompute from "./ListCompute";
import { PipelineTypes } from "../CreateFeed/types/pipeline";

const GeneralCompute = ({
  currentPipelineId,
}: {
  currentPipelineId: number;
  handleSetGeneralCompute: (
    currentPipelineId: number,
    computeEnv: string
  ) => void;
}) => {
  const { state, dispatch } = useContext(PipelineContext);
  const [computes, setComputes] = React.useState<any[]>([]);

  const generalCompute = state.pipelineData[currentPipelineId].generalCompute;

  React.useEffect(() => {
    async function fetchCompute() {
      const client = ChrisAPIClient.getClient();
      const computeResourceList = await client.getComputeResources({
        limit: 100,
        offset: 0,
      });
      setComputes(computeResourceList.data);
    }

    fetchCompute();
  }, []);

  const dispatchFn = (item: any) => {
    dispatch({
      type: PipelineTypes.SetGeneralCompute,
      payload: { currentPipelineId, computeEnv: item.name },
    });
  };

  return (
    <div
      style={{
        width: "25%",
        background: "black",
      }}
      className="general-compute"
    >
      <ListCompute
        computeList={computes}
        generalCompute={generalCompute}
        dispatchFn={dispatchFn}
      />
    </div>
  );
};

export default GeneralCompute;
