import React from "react";
import { useDispatch } from "react-redux";
import TitleChange from "./TitleChange";
import ClipboardCopyCommand from "./ClipboardCopyCommand";
import { ConfiguartionPageProps } from "../CreateFeed/types/pipeline";
import { Grid, GridItem, ExpandableSection } from "@patternfly/react-core";
import { PluginPiping } from "@fnndsc/chrisapi";
import CreatingPipeline from "./CreatePipeline";
import ListCompute from "./ListCompute";
import { PipelineContext } from "../CreateFeed/context";
import { Button, Form, Input } from "antd";

const ConfigurationPage = (props: ConfiguartionPageProps) => {
  const dispatchStore = useDispatch();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const {
    currentPipelineId,
    pipeline,
    state,
    pipelines,
    handleSetCurrentNodeTitle,
    handleDispatchPipelines,
    handleFormParameters,
    handleSetCurrentComputeEnv,
    justDisplay,
  } = props;

  const { currentNode, computeEnvs, pluginPipings, input, pluginParameters } =
    state;
  const computeEnvList =
    computeEnvs && currentNode && computeEnvs[currentNode]
      ? computeEnvs[currentNode].computeEnvs
      : [];
  const [selectedPlugin, setSelectedPlugin] = React.useState<PluginPiping>();

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  React.useEffect(() => {
    async function fetchResources() {
      if (pluginPipings && currentNode && pluginParameters) {
        const pluginPiping = pluginPipings.filter((piping: any) => {
          return piping.data.id === currentNode;
        });

        const selectedPlugin = await pluginPiping[0].getPlugin();
        setSelectedPlugin(pluginPiping[0]);

        const params = await selectedPlugin.getPluginParameters({
          limit: 1000,
        });

        const paramDict: {
          [key: string]: string;
        } = {};
        //@ts-ignore
        pluginParameters.data
          .filter((param: any) => {
            return param.plugin_piping_id === pluginPiping[0].data.id;
          })
          .forEach((param: any) => {
            paramDict[param.param_name] = param;
          });

        const paramItems = params.getItems();

        if (paramItems) {
          const newParamDict: any[] = [];

          paramItems.forEach((param: any) => {
            if (paramDict[param.data.name]) {
              const defaultParam = paramDict[param.data.name];
              //@ts-ignore
              const newParam = { data: { ...param.data } };
              //@ts-ignore
              newParam.data["default"] = defaultParam.value;
              newParamDict.push(newParam);
            }
          });

          handleFormParameters(currentNode, currentPipelineId, newParamDict);
        }
      }
    }

    fetchResources();
  }, [currentNode, pluginPipings, dispatchStore, pluginParameters, input]);

  const generalCompute =
    computeEnvs &&
    currentNode &&
    computeEnvs[currentNode] &&
    computeEnvs[currentNode].currentlySelected;

  const dispatchFn = (item: any) => {
    if (currentNode)
      handleSetCurrentComputeEnv(
        item,
        currentNode,
        currentPipelineId,
        computeEnvList
      );
  };

  return (
    <>
      {!justDisplay && (
        <>
          <TitleChange
            currentPipelineId={currentPipelineId}
            state={state}
            handleSetCurrentNodeTitle={handleSetCurrentNodeTitle}
            selectedPlugin={selectedPlugin}
          />
          {
            <CreatingPipeline
              pipelines={pipelines}
              pipeline={pipeline}
              state={state}
              handleDispatchPipelines={handleDispatchPipelines}
            />
          }
        </>
      )}
      <ClipboardCopyCommand state={state} />
      {!justDisplay && (
        <ExpandableSection
          isExpanded={isExpanded}
          toggleText={
            isExpanded
              ? "Hide Advanced Configuration"
              : "Show Advanced Configuration"
          }
          onToggle={onToggle}
        >
          <Grid hasGutter={true}>
            <GridItem span={6}>
              <ConfigurePipelineParameters
                currentPipelineId={currentPipelineId}
                handleFormParameters={handleFormParameters}
              />
            </GridItem>
            <GridItem span={6}>
              <h4>Configure Compute Environment</h4>
              <ListCompute
                computeList={computeEnvList}
                generalCompute={generalCompute}
                dispatchFn={dispatchFn}
              />
            </GridItem>
          </Grid>
        </ExpandableSection>
      )}
    </>
  );
};

export default ConfigurationPage;

export const ConfigurePipelineParameters = ({
  currentPipelineId,
  handleFormParameters,
}: {
  handleFormParameters: (
    currentNode: number,
    currentPipelineId: number,
    paramDict: any[]
  ) => void;
  currentPipelineId: number;
}) => {
  const { state } = React.useContext(PipelineContext);
  const { pipelineData } = state;
  const { parameterList, currentNode } = pipelineData[currentPipelineId];
  const params = parameterList && currentNode && parameterList[currentNode];

  const onFinish = (values: any) => {
    const newParams = params.map((param: any) => {
      if (values[param.data.name]) {
        param.data.default = values[param.data.name];
      }
      return param;
    });
    handleFormParameters(currentNode, currentPipelineId, newParams);
  };

  return (
    <Form name="basic" style={{ maxWidth: 600 }} onFinish={onFinish}>
      {params &&
        params.length > 0 &&
        params.map((param: any) => {
          return (
            <Form.Item
              name={param.data.name}
              label={param.data.name}
              key={param.data.id}
            >
              <Input defaultValue={param.data.default} />
            </Form.Item>
          );
        })}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};
