import { Pipeline } from "@fnndsc/chrisapi";
import CodeBlockComponent from "./CodeBlockComponent";
import ComputeListForSingleCompute from "./ComputeListForSingleCompute";
import { Grid, GridItem } from "@patternfly/react-core";
import GeneralCompute from "./GeneralCompute";
import TitleChange from "./TitleChange";
import Tree from "./Tree";

type OwnProps = {
  pipeline: Pipeline;
};

function PipelinesComponent(props: OwnProps) {
  const { pipeline } = props;
  return (
    <>
      <Tree currentPipeline={pipeline} />
      <Grid
        style={{
          marginTop: "2em",
        }}
        hasGutter={true}
      >
        <GridItem span={4}>
          <GeneralCompute />
        </GridItem>

        <GridItem span={4}>
          <ComputeListForSingleCompute currentPipeline={pipeline} />
        </GridItem>

        <GridItem span={4}>
          <TitleChange currentPipeline={pipeline} />
        </GridItem>
      </Grid>

      <CodeBlockComponent currentPipeline={pipeline} />
    </>
  );
}

export default PipelinesComponent;
