import { Pipeline } from "@fnndsc/chrisapi";
import { Grid, GridItem } from "@patternfly/react-core";
import CodeBlockComponent from "./CodeBlockComponent";
import ComputeListForSingleCompute from "./ComputeListForSingleCompute";
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
          marginTop: "3em",
        }}
        hasGutter={true}
      >
        <GridItem span={12} md={6} lg={6} xl={4}>
          <ComputeListForSingleCompute currentPipeline={pipeline} />
        </GridItem>

        <GridItem span={12} md={6} lg={6} xl={4}>
          <TitleChange currentPipeline={pipeline} />
        </GridItem>
      </Grid>
      <CodeBlockComponent currentPipeline={pipeline} />
    </>
  );
}

export default PipelinesComponent;
