import React from "react";
import { useDispatch } from "react-redux";
import TitleChange from "./TitleChange";
import ClipboardCopyCommand from "./ClipboardCopyCommand";
import { ConfiguartionPageProps } from "../CreateFeed/types/pipeline";
import { InputIndex } from "../AddNode/types";
import { Grid, GridItem, ExpandableSection } from "@patternfly/react-core";
import { PluginPiping } from "@fnndsc/chrisapi";
import GuidedConfig from "../AddNode/GuidedConfig";
import { getParamsSuccess } from "../../../store/plugin/actions";
import CreatingPipeline from "./CreatePipeline";
import ListCompute from "./ListCompute";

const ConfigurationPage = (props: ConfiguartionPageProps) => {
  const dispatchStore = useDispatch();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const {
    currentPipelineId,
    pipeline,
    state,
    pipelines,
    handleTypedInput,
    handleSetCurrentNodeTitle,
    handleDispatchPipelines,
    handleDeleteInput,
    handleSetCurrentComputeEnv,
    justDisplay,
  } = props;
  console.log("Configuration Page")
  const { currentNode, computeEnvs, pluginPipings, input, pluginParameters } =
    state;
  const computeEnvList =
    computeEnvs && currentNode && computeEnvs[currentNode]
      ? computeEnvs[currentNode].computeEnvs
      : [];
  const [selectedPlugin, setSelectedPlugin] = React.useState<PluginPiping>();

  let dropdownInput = {};
  let requiredInput = {};

  if (currentNode && input && input[currentNode]) {
    dropdownInput = input[currentNode].dropdownInput;
    requiredInput = input[currentNode].requiredInput;
  }

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  const handleTypedInputWrap = React.useCallback(
    (required: boolean, id: string, input: InputIndex) => {
      if (currentNode)
        handleTypedInput(currentPipelineId, currentNode, id, input, required);
    },
    [currentNode, currentPipelineId, handleTypedInput]
  );

  const inputChange = React.useCallback(
    (
      id: string,
      flag: string,
      value: string,
      type: string,
      placeholder: string,
      required: boolean,
      paramName?: string
    ) => {
      const input: InputIndex = {};
      input["id"] = id;
      input["flag"] = flag;
      input["value"] = value;
      input["type"] = type;
      input["placeholder"] = placeholder;
      if (paramName) {
        input["paramName"] = paramName;
      }
      if (required === true && currentNode) {
        handleTypedInputWrap(true, id, input);
      } else if (currentNode) {
        handleTypedInputWrap(false, id, input);
      }
    },
    [currentNode, handleTypedInputWrap]
  );

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

              if (
                param.data.optional === false &&
                !(
                  input &&
                  input[currentNode] &&
                  input[currentNode].requiredInput
                )
              ) {
                inputChange(
                  param.data.id,
                  param.data.flag,
                  //@ts-ignore
                  defaultParam.value,
                  param.data.type,
                  param.data.help,
                  true,
                  param.data.name
                );
              } else {
                if (
                  //@ts-ignore
                  defaultParam.value &&
                  !(
                    input &&
                    input[currentNode] &&
                    input[currentNode].dropdownInput
                  )
                ) {
                  inputChange(
                    param.data.id,
                    param.data.flag,
                    //@ts-ignore
                    defaultParam.value,
                    param.data.type,
                    param.data.help,
                    false,
                    param.data.name
                  );
                }
              }
            }
          });
          dispatchStore(getParamsSuccess(newParamDict));
        }
      }
    }

    fetchResources();
  }, [
    currentNode,
    pluginPipings,
    dispatchStore,
    inputChange,
    pluginParameters,
    input,
  ]);

  const deleteInput = (index: string) => {
    if (currentNode) handleDeleteInput(currentPipelineId, currentNode, index);
  };

  let pluginName = selectedPlugin?.data.title
    ? selectedPlugin?.data.title
    : selectedPlugin?.data.name;

  const pluginVersion = (pluginName += `${selectedPlugin?.data.version}`);
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
              {selectedPlugin && (
                <GuidedConfig
                  pluginName={pluginVersion}
                  defaultValueDisplay={true}
                  renderComputeEnv={false}
                  inputChange={inputChange}
                  deleteInput={deleteInput}
                  dropdownInput={dropdownInput}
                  requiredInput={requiredInput}
                />
              )}
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
