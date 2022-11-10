import React from "react";
import { useDispatch } from "react-redux";
import { SinglePipeline } from "../CreateFeed/types/pipeline";
import { InputIndex } from "../AddNode/types";
import { List, Avatar, Checkbox, Spin } from "antd";
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
  Button,
} from "@patternfly/react-core";
import { Pipeline, PluginPiping } from "@fnndsc/chrisapi";
import GuidedConfig from "../AddNode/GuidedConfig";
import { getParamsSuccess } from "../../../store/plugin/actions";
import { unpackParametersIntoString } from "../AddNode/lib/utils";
import { MdCheck, MdEdit, MdClose } from "react-icons/md";
import {
  generatePipelineWithData,
  hasCode,
  intToRGB,
} from "../CreateFeed/utils/pipelines";
import ReactJson from "react-json-view";

const ConfigurationPage = (props: {
  pipelines: any;
  currentPipelineId: number;
  pipeline: Pipeline;
  state: SinglePipeline;
  handleTypedInput: (
    currentPipelineId: number,
    currentNodeId: number,
    id: string,
    input: InputIndex,
    required: boolean
  ) => void;
  handleDeleteInput: (
    currentPipelineId: number,
    currentNode: number,
    index: string
  ) => void;
  handleSetCurrentNodeTitle: (
    currentPipelineId: number,
    currentNode: number,
    title: string
  ) => void;
  handleDispatchPipelines: (registeredPipelines: any) => void;
  handleSetCurrentComputeEnv: (
    item: {
      name: string;
      description: string;
    },
    currentNode: number,
    currentPipelineId: number,
    computeEnvList: any[]
  ) => void;
}) => {
  const dispatchStore = useDispatch();
  const [copied, setCopied] = React.useState(false);
  const [value, setValue] = React.useState("");
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
  } = props;
  const {
    currentNode,
    computeEnvs,
    title,
    pluginPipings,
    input,
    pluginParameters,
  } = state;
  const computeEnvList =
    computeEnvs && currentNode && computeEnvs[currentNode]
      ? computeEnvs[currentNode].computeEnvs
      : [];
  const [selectedPlugin, setSelectedPlugin] = React.useState<PluginPiping>();
  const [edit, setEdit] = React.useState(false);
  const [creatingPipeline, setCreatingPipeline] = React.useState({
    loading: false,
    error: {},
    pipelineName: "",
  });
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
        handleTypedInput(currentPipelineId, currentNode, id, input, true);
      } else if (currentNode) {
        handleTypedInput(currentPipelineId, currentNode, id, input, false);
      }
    },
    [currentNode, currentPipelineId]
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

  const handleCorrectInput = () => {
    setEdit(false);
    if (currentNode)
      handleSetCurrentNodeTitle(currentPipelineId, currentNode, value);
  };

  const handlePipelineCreate = async () => {
    setCreatingPipeline({
      ...creatingPipeline,
      loading: true,
    });
    const mappedArr: any[] = [];
    try {
      pluginPipings?.forEach((piping: any) => {
        const defaults = pluginParameterDefaults(
          //@ts-ignore
          pluginParameters.data,
          piping.data.id,
          input
        );

        const id = pluginPipings.findIndex(
          (pipe: any) => pipe.data.id === piping.data.previous_id
        );

        let titleChange = "";
        if (title && title[piping.data.id]) {
          titleChange = title[piping.data.id];
        }

        const treeObl = {
          plugin_name: piping.data.plugin_name,
          plugin_version: piping.data.plugin_version,
          previous_index: id === -1 ? null : id,
          title: titleChange,
          plugin_parameter_defaults: defaults,
        };
        mappedArr.push(treeObl);
      });

      const result = {
        name: `${creatingPipeline.pipelineName}`,
        authors: pipeline.data.authors,
        locked: pipeline.data.locked,
        description: pipeline.data.description,
        plugin_tree: JSON.stringify(mappedArr),
      };

      const { pipelineInstance } = await generatePipelineWithData(result);
      setCreatingPipeline({
        ...creatingPipeline,
        loading: false,
      });
      if (pipelineInstance) {
        handleDispatchPipelines([pipelineInstance, ...pipelines]);
      }
    } catch (error: any) {
      setCreatingPipeline({
        ...creatingPipeline,
        error: error.response.data,
        loading: false,
      });
    }
  };

  const iconFontSize = {
    fontSize: "1.25rem",
  };

  let pluginName = selectedPlugin?.data.title
    ? selectedPlugin?.data.title
    : selectedPlugin?.data.name;

  const pluginVersion = (pluginName += `${selectedPlugin?.data.version}`);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextInput
          aria-label="Configure Title"
          style={{
            margin: "1rem 0.5rem 0 0",
            width: "30%",
          }}
          type="text"
          placeholder={edit ? "Add a title to the node" : ""}
          isReadOnly={!edit}
          value={
            edit
              ? value
              : title && currentNode && title[currentNode]
              ? `${title[currentNode]} (id:${currentNode})`
              : `${
                  selectedPlugin?.data
                    ? selectedPlugin?.data.title
                    : selectedPlugin?.data.plugin_name
                } (id:${currentNode})`
          }
          onChange={(value) => {
            setValue(value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleCorrectInput();
            }
          }}
        />

        {!edit && (
          <MdEdit
            style={{
              ...iconFontSize,
              color: "#06c",
            }}
            onClick={() => {
              setEdit(true);
            }}
          />
        )}
        {edit && (
          <>
            <MdCheck
              style={{
                marginRight: "0.5rem",
                color: "#3e8635",
                ...iconFontSize,
              }}
              onClick={handleCorrectInput}
            />
            <MdClose
              onClick={() => {
                setEdit(false);
              }}
              style={{
                ...iconFontSize,
                color: "#c9190b",
              }}
            />
          </>
        )}
      </div>
      <div
        style={{
          display: "flex",
          margin: "1rem 0.5rem 0.5rem 0",
        }}
      >
        <TextInput
          style={{
            marginRight: "1rem",
            width: "30%",
          }}
          aria-label="Name for the edited pipeline"
          placeholder="Enter a name for the pipeline"
          value={creatingPipeline.pipelineName}
          onKeyDown={(event) => {
            event.key === "Enter" && handlePipelineCreate();
          }}
          onChange={(value) =>
            setCreatingPipeline({
              ...creatingPipeline,
              pipelineName: value,
              error: {},
            })
          }
        />
        <Button
          isDisabled={creatingPipeline.loading ? true : false}
          onClick={handlePipelineCreate}
        >
          Save Pipeline
        </Button>

        {creatingPipeline.loading && <Spin tip="Saving a new pipeline" />}
      </div>

      {Object.keys(creatingPipeline.error).length > 0 && (
        <span>
          <ReactJson src={creatingPipeline.error} />
        </span>
      )}

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
                            if (currentNode) {
                              handleSetCurrentComputeEnv(
                                item,
                                currentNode,
                                currentPipelineId,
                                computeEnvList
                              );
                            }
                          }}
                        />

                        <Avatar
                          style={{
                            background: `#${intToRGB(hasCode(item.name))}`,
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
          </GridItem>
        </Grid>
      </ExpandableSection>
    </>
  );
};

export default ConfigurationPage;

const pluginParameterDefaults = (parameters: any[], id: number, input: any) => {
  const currentInput = input[id];

  const defaults = [];

  if (currentInput) {
    let totalInput = {};

    if (currentInput.dropdownInput) {
      totalInput = { ...totalInput, ...currentInput.dropdownInput };
    }
    if (currentInput.requiredInput) {
      totalInput = { ...totalInput, ...currentInput.requiredInput };
    }

    for (const input in totalInput) {
      //@ts-ignore
      const parameter = totalInput[input];
      defaults.push({
        name: parameter.paramName,
        default: parameter.value,
      });
    }
  } else {
    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i];
      if (parameter.plugin_piping_id === id) {
        defaults.push({
          name: parameter.param_name,
          default: parameter.value,
        });
      }
    }
  }

  return defaults;
};
