import { PluginPiping } from "@fnndsc/chrisapi";
import {
  ActionGroup,
  Button,
  ExpandableSection,
  Form,
  FormGroup,
  Grid,
  GridItem,
  TextInput,
} from "@patternfly/react-core";
import React from "react";
import { PipelineContext } from "../CreateFeed/context";
import type { ConfiguartionPageProps } from "../CreateFeed/types/pipeline";
import ClipboardCopyCommand from "./ClipboardCopyCommand";
import ListCompute from "./ListCompute";
import TitleChange from "./TitleChange";

const ConfigurationPage = (props: ConfiguartionPageProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const {
    currentPipelineId,
    state,
    handleSetCurrentNodeTitle,
    handleSetCurrentComputeEnv,
    handleFormParameters,
    justDisplay,
  } = props;

  const { currentNode, computeEnvs, pluginPipings, pluginParameters } = state;
  const computeEnvList =
    computeEnvs && currentNode && computeEnvs[currentNode]
      ? computeEnvs[currentNode].computeEnvs
      : [];
  const [selectedPlugin, setSelectedPlugin] = React.useState<PluginPiping>();

  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
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
        const filteredParameters = pluginParameters?.data.filter(
          (param: any) => {
            return param.plugin_piping_id === pluginPiping[0].data.id;
          },
        );

        for (const param of filteredParameters) {
          paramDict[param.param_name] = param;
        }

        const paramItems = params.getItems();

        if (paramItems) {
          const newParamDict: any[] = [];

          for (const param of paramItems) {
            if (paramDict[param.data.name]) {
              const defaultParam = paramDict[param.data.name];
              //@ts-ignore
              const newParam = {
                name: param.data.name,
                default: param.data.default,
              };
              //@ts-ignore
              newParam.default = defaultParam.value;
              newParamDict.push(newParam);
            }
          }

          handleFormParameters(currentNode, currentPipelineId, newParamDict);
        }
      }
    }

    fetchResources();
  }, [
    currentNode,
    pluginPipings,
    pluginParameters,
    handleFormParameters,
    currentPipelineId,
  ]);

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
        computeEnvList,
      );
  };

  return (
    <>
      <ClipboardCopyCommand state={state} />
      {!justDisplay && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ flex: 1, width: "50%" }}>
            <TitleChange
              currentPipelineId={currentPipelineId}
              state={state}
              handleSetCurrentNodeTitle={handleSetCurrentNodeTitle}
              selectedPlugin={selectedPlugin}
            />
          </div>
          <div style={{ flex: 1, width: "50%" }}>
            <ListCompute
              computeList={computeEnvList}
              generalCompute={generalCompute}
              dispatchFn={dispatchFn}
            />
          </div>
        </div>
      )}

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
    paramDict: any[],
  ) => void;
  currentPipelineId: number;
}) => {
  const { state } = React.useContext(PipelineContext);
  const { pipelineData } = state;
  const { parameterList, currentNode } = pipelineData[currentPipelineId];
  const params = parameterList && currentNode && parameterList[currentNode];

  const onFinish = (values: any) => {
    const newParams = params.map((param: any) => {
      const newValue = values[param.name];
      if (newValue) {
        param.default =
          newValue === "true" || newValue === "false"
            ? Boolean(newValue)
            : values[param.name];
      }
      return param;
    });
    handleFormParameters(currentNode, currentPipelineId, newParams);
  };

  return (
    <Form style={{ maxWidth: 600 }}>
      {params &&
        params.length > 0 &&
        params.map((param: any) => {
          return (
            <FormGroup name={param.name} label={param.name} key={param.name}>
              <TextInput
                aria-label="parameter values"
                defaultValue={param.default}
              />
            </FormGroup>
          );
        })}
      <ActionGroup>
        <Button variant="primary" onSubmit={onFinish}>
          Save
        </Button>
      </ActionGroup>
    </Form>
  );
};
