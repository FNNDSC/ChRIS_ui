import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import { Types } from "../CreateFeed/types";
import { InputIndex } from "../AddNode/types";
import { List, Avatar, Checkbox } from "antd";
import { isEmpty } from "lodash";
import {
  Grid,
  GridItem,
  CodeBlockAction,
  CodeBlock,
  CodeBlockCode,
  ClipboardCopyButton,
  clipboardCopyFunc,
  ExpandableSection,
  TextInput,
} from "@patternfly/react-core";
import { CreateFeedContext } from "../CreateFeed/context";
import { Pipeline, Plugin } from "@fnndsc/chrisapi";
import GuidedConfig from "../AddNode/GuidedConfig";
import { getParamsSuccess } from "../../../store/plugin/actions";
import { unpackParametersIntoString } from "../AddNode/lib/utils";

const colorPalette: {
  [key: string]: string;
} = {
  default: "#73bcf7",
  host: "#73bcf7",
  moc: "#704478",
  titan: "#1B9D92",
  galena: "#ADF17F",
};

const ConfigurationPage = (props: {
  currentPipelineId: number;
  pipeline: Pipeline;
}) => {
  const dispatchStore = useDispatch();
  const [copied, setCopied] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { currentPipelineId, pipeline } = props;
  const { state, dispatch } = useContext(CreateFeedContext);
  const {
    currentNode,
    computeEnvs,
    title,
    pluginPipings,
    input,
    pluginParameters,
  } = state.pipelineData[currentPipelineId];
  const computeEnvList =
    computeEnvs && currentNode && computeEnvs[currentNode]
      ? computeEnvs[currentNode].computeEnvs
      : [];
  const [selectedPlugin, setSelectedPlugin] = React.useState<Plugin>();
  let dropdownInput = {};
  let requiredInput = {};

  const onToggle = (isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  if (currentNode && input && input[currentNode]) {
    dropdownInput = input[currentNode].dropdownInput;
    requiredInput = input[currentNode].requiredInput;
  }

  const inputChange = React.useCallback(
    (
      id: string,
      flag: string,
      value: string,
      type: string,
      placeholder: string,
      required: boolean
    ) => {
      const input: InputIndex = {};
      input["id"] = id;
      input["flag"] = flag;
      input["value"] = value;
      input["type"] = type;
      input["placeholder"] = placeholder;

      if (required === true) {
        dispatch({
          type: Types.SetPipelineRequiredInput,
          payload: {
            currentPipelineId,
            currentNodeId: currentNode,
            id,
            input,
          },
        });
      } else {
        dispatch({
          type: Types.SetPipelineDropdownInput,
          payload: {
            currentPipelineId,
            currentNodeId: currentNode,
            id,
            input,
          },
        });
      }
    },
    [currentNode, currentPipelineId, dispatch]
  );

  React.useEffect(() => {
    async function fetchResources() {
      if (pluginPipings && currentNode && pluginParameters) {
        const pluginPiping = pluginPipings.filter((piping) => {
          return piping.data.id === currentNode;
        });

        const selectedPlugin = await pluginPiping[0].getPlugin();
        setSelectedPlugin(selectedPlugin);

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
                  true
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
                    false
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
    dispatch({
      type: Types.DeletePipelineInput,
      payload: {
        currentPipelineId,
        currentNodeId: currentNode,
        input: index,
      },
    });
  };

  let generatedCommand = "";

  if (!isEmpty(requiredInput)) {
    generatedCommand += unpackParametersIntoString(requiredInput);
  }
  if (!isEmpty(dropdownInput)) {
    generatedCommand += unpackParametersIntoString(dropdownInput);
  }

  const actions = (
    <React.Fragment>
      <CodeBlockAction>
        <ClipboardCopyButton
          id="basic-copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, generatedCommand)}
          exitDelay={600}
          maxWidth="110px"
          variant="plain"
        >
          {copied ? "Successfully copied to clipboard" : "Copy to clipboard"}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </React.Fragment>
  );

  const onClick = (event: any, text: any) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };
  return (
    <>
      <h3
        style={{
          marginTop: "1rem",
        }}
      >
        {`Default configuration for ${selectedPlugin?.data.name}:`}
      </h3>
      <CodeBlock actions={actions}>
        <CodeBlockCode id="code-content">{generatedCommand}</CodeBlockCode>
      </CodeBlock>

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
                renderComputeEnv={false}
                inputChange={inputChange}
                deleteInput={deleteInput}
                plugin={selectedPlugin}
                dropdownInput={dropdownInput}
                requiredInput={requiredInput}
              />
            )}
          </GridItem>
          <GridItem span={6}>
            <h4>Configure Compute Environment</h4>
            <List
              itemLayout="horizontal"
              dataSource={computeEnvList ? computeEnvList : []}
              renderItem={(item: { name: string; description: string }) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <>
                        <Checkbox
                          style={{
                            marginRight: "0.5em",
                          }}
                          checked={
                            currentNode &&
                            computeEnvs &&
                            computeEnvs[currentNode] &&
                            computeEnvs[currentNode].currentlySelected ===
                              item.name
                              ? true
                              : false
                          }
                          onClick={() => {
                            dispatch({
                              type: Types.SetCurrentComputeEnvironment,
                              payload: {
                                computeEnv: {
                                  item,
                                  currentNode,
                                  currentPipelineId,
                                  computeEnvList,
                                },
                              },
                            });
                          }}
                        />

                        <Avatar
                          style={{
                            background: `${
                              colorPalette[item.name]
                                ? colorPalette[item.name]
                                : colorPalette["default"]
                            }`,
                          }}
                        />
                      </>
                    }
                    title={item.name}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
            <h4>Configure title for {selectedPlugin?.data.name}</h4>
            <TextInput
              arial-label="Change the plugin instance title in a node"
              value={title && currentNode && title[currentNode]}
              onChange={(value) => {
                dispatch({
                  type: Types.SetCurrentNodeTitle,
                  payload: {
                    currentPipelineId,
                    currentNode,
                    title: value,
                  },
                });
              }}
            />
          </GridItem>
        </Grid>
      </ExpandableSection>
    </>
  );
};

export default ConfigurationPage;
