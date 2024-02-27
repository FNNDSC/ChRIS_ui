import { Pipeline } from "@fnndsc/chrisapi";
import { Grid, GridItem } from "@patternfly/react-core";
import CodeBlockComponent from "./CodeBlockComponent";
import ComputeListForSingleCompute from "./ComputeListForSingleCompute";
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
          marginTop: "3em",
        }}
        hasGutter={true}
      >
        <GridItem span={12} md={4} lg={5} xl={4}>
          <GeneralCompute />
        </GridItem>

        <GridItem span={12} md={6} lg={5} xl={4}>
          <ComputeListForSingleCompute currentPipeline={pipeline} />
        </GridItem>

        <GridItem span={12} md={2} lg={2} xl={4}>
          <TitleChange currentPipeline={pipeline} />
        </GridItem>
      </Grid>
      <CodeBlockComponent currentPipeline={pipeline} />
    </>
  );
}

export default PipelinesComponent;
