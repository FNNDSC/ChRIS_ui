import React, { useContext } from "react";
import { Types } from "../CreateFeed/types";
import { InputIndex } from "../AddNode/types";
import { List, Avatar, Checkbox } from "antd";
import { TextInput, Hint, HintBody } from "@patternfly/react-core";
import { CreateFeedContext } from "../CreateFeed/context";
import { Pipeline, Plugin } from "@fnndsc/chrisapi";
import GuidedConfig from "../AddNode/GuidedConfig";
import { useDispatch } from "react-redux";
import { getParamsSuccess } from "../../../store/plugin/actions";
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
  const { currentPipelineId, pipeline } = props;
  const { state, dispatch } = useContext(CreateFeedContext);
  const {
    currentNode,
    computeEnvs,
    title,
    pluginPipings,
    input,
    pluginParameters,
    pipelinePlugins,
  } = state.pipelineData[currentPipelineId];
  const computeEnvList =
    computeEnvs && currentNode && computeEnvs[currentNode]
      ? computeEnvs[currentNode].computeEnvs
      : [];
  const [selectedPlugin, setSelectedPlugin] = React.useState<Plugin>();
  let dropdownInput = {};
  let requiredInput = {};

  if (currentNode && input && input[currentNode]) {
    dropdownInput = input[currentNode].dropdownInput;
    requiredInput = input[currentNode].requiredInput;
  }

  console.log("Input", dropdownInput, requiredInput);

  React.useEffect(() => {
    async function fetchResources() {
      if (pluginPipings && currentNode && pluginParameters && pipelinePlugins) {
        const pluginPiping = pluginPipings.filter((piping) => {
          return piping.data.id === currentNode;
        });

        const selectedPlugin = await pluginPiping[0].getPlugin();
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

          dispatchStore(getParamsSuccess(newParamDict));
          // Create a set of paras

          setSelectedPlugin(selectedPlugin);
        }
      }
    }

    fetchResources();
  }, [currentNode, pluginPipings]);

  const inputChange = (
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
  };

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

  return (
    <>
      <Hint
        //@ts-ignore
        style={{
          marginTop: "1rem",
          marginRight: "auto",
          padding: "0.25em",
        }}
      >
        <HintBody
          //@ts-ignore
          style={{
            marginTop: "auto",
            marginRight: "auto",
          }}
        >
          Changes will persist when you configure the pipeline. Please click on
          the reset icon to revert back your changes.
        </HintBody>
      </Hint>
      <div
        style={{
          marginTop: "1rem",
        }}
      >
        <h4>Configuring compute environment for node id: {currentNode} </h4>
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
                        computeEnvs[currentNode].currentlySelected === item.name
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
      </div>
      <div>
        <h4>Configuring Title for node id: {currentNode}</h4>
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
      </div>

      <div>
        {selectedPlugin && (
          <GuidedConfig
            inputChange={inputChange}
            deleteInput={deleteInput}
            plugin={selectedPlugin}
            dropdownInput={dropdownInput}
            requiredInput={requiredInput}
          />
        )}
      </div>
    </>
  );
};

export default ConfigurationPage;
