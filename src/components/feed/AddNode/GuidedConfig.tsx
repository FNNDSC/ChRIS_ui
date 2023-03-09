import React, { useEffect, useContext } from "react";
import {
  ClipboardCopy,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  Card,
  CardBody,
  Checkbox,
  Grid,
  GridItem,
  Tooltip,
} from "@patternfly/react-core";
import { PluginInstance, PluginInstanceParameter } from "@fnndsc/chrisapi";
import SimpleDropdown from "./SimpleDropdown";
import RequiredParam from "./RequiredParam";
import ComputeEnvironments from "./ComputeEnvironment";
import { v4 } from "uuid";
import { handleGetTokens, unpackParametersIntoString } from "./lib/utils";
import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import { FaCheck } from "react-icons/fa";
import { AddNodeContext } from "./context";
import { Types, InputIndex } from "./types";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import { getParams } from "../../../store/plugin/actions";
import { fetchResource } from "../../../api/common";
import { Button } from "antd";

const GuidedConfig = () => {
  const dispatch = useDispatch();
  const { state, dispatch: nodeDispatch } = useContext(AddNodeContext);
  const params = useTypedSelector((state) => state.plugin.parameters);
  const { pluginMeta, dropdownInput, requiredInput, componentList } = state;
  const [plugins, setPlugins] = React.useState<Plugin[]>();
  useEffect(() => {
    const fetchPluginVersions = async () => {
      const pluginList = await pluginMeta?.getPlugins({
        limit: 1000,
      });

      if (pluginList) {
        const pluginItems = pluginList.getItems() as unknown as Plugin[];
        setPlugins(pluginItems);
        const plugin = pluginItems[0];
        nodeDispatch({
          type: Types.SetSelectedPluginFromMeta,
          payload: {
            plugin,
          },
        });
        dispatch(getParams(plugin));
      }
    };
    fetchPluginVersions();
  }, [dispatch, pluginMeta, nodeDispatch]);

  useEffect(() => {
    let defaultComponentList = [];
    if (Object.keys(dropdownInput).length > 0) {
      defaultComponentList = Object.entries(dropdownInput).map(([key]) => {
        return key;
      });

      if (params && defaultComponentList.length < params["dropdown"].length) {
        defaultComponentList = [...defaultComponentList, v4()];
      }
      nodeDispatch({
        type: Types.SetComponentList,
        payload: {
          componentList: defaultComponentList,
        },
      });
    }
  }, [dropdownInput, nodeDispatch, params]);

  useEffect(() => {
    let derivedValue = "";

    if (requiredInput) {
      derivedValue += unpackParametersIntoString(requiredInput);
    }

    if (dropdownInput) {
      derivedValue += unpackParametersIntoString(dropdownInput);
    }

    nodeDispatch({
      type: Types.SetEditorValue,
      payload: {
        value: derivedValue,
      },
    });
  }, [dropdownInput, requiredInput, nodeDispatch]);

  useEffect(() => {
    nodeDispatch({
      type: Types.SetComponentList,
      payload: {
        componentList: [v4()],
      },
    });
  }, [nodeDispatch]);

  const renderRequiredParams = (params: PluginParameter[]) => {
    return params.map((param) => {
      return (
        <div key={param.data.id}>
          <RequiredParam param={param} id={v4()} />
        </div>
      );
    });
  };

  const renderDropdowns = () => {
    return componentList.map((id, index) => {
      return <SimpleDropdown key={index} params={params} id={id} />;
    });
  };

  const renderComputeEnvs = () => {
    return (
      <div className="configure-compute">
        <span className="configure-compute__label">
          Select a compute environment:{" "}
        </span>
        <ComputeEnvironments />
      </div>
    );
  };

  const requiredLength = params && params["required"].length;
  const dropdownLength = params && params["dropdown"].length;

  return (
    <div className="configuration">
      <CardComponent>
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "1rem",
              gap: "20px"
            }}
          >
            <DropdownBasic plugins={plugins} />
            <div
              className="configuration__renders"
            >
              {renderComputeEnvs()}
            </div>
          </div>
        </>
      </CardComponent>

      <CardComponent>
        <CheckboxComponent />
      </CardComponent>

      <CardComponent>
        <>
          <h4>Command Line Parameters:</h4>
          <EditorValue params={params} />
        </>
      </CardComponent>

      <CardComponent>
        <>
          <div>
            <h4>
              Required Parameters <ItalicsComponent length={requiredLength} />
            </h4>
            {params &&
              params["required"].length > 0 &&
              renderRequiredParams(params["required"])}
          </div>
          <div>
            <h4>
              Optional Parameters <ItalicsComponent length={dropdownLength} />
            </h4>

            {renderDropdowns()}
          </div>
        </>
      </CardComponent>
    </div>
  );
};

export default GuidedConfig;

const CardComponent = ({ children }: { children: React.ReactElement }) => {
  return (
    <Card>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

const CheckboxComponent = () => {
  const params = useTypedSelector((state) => state.plugin.parameters);
  const { state, dispatch } = useContext(AddNodeContext);
  const { showPreviousRun, selectedPluginFromMeta } = state;

  const handleCheckboxChange = async () => {
    const pluginInstanceList = await selectedPluginFromMeta?.getPluginInstances(
      {
        limit: 1,
      }
    );
    const pluginInstances = pluginInstanceList?.getItems();

    if (pluginInstances && pluginInstances.length > 0) {
      const pluginInstance: PluginInstance = pluginInstances[0];
      const paramsToFn = { limit: 10, offset: 0 };
      const fn = pluginInstance.getParameters;
      const boundFn = fn.bind(pluginInstance);
      const { resource: pluginParameters } =
        await fetchResource<PluginInstanceParameter>(paramsToFn, boundFn);

      const requiredInput: { [id: string]: InputIndex } = {};
      const dropdownInput: { [id: string]: InputIndex } = {};

      for (let i = 0; i < pluginParameters.length; i++) {
        const parameter: PluginInstanceParameter = pluginParameters[i];
        const { id, param_name, type, value } = parameter.data;

        if (params && params["required"].includes(param_name)) {
          requiredInput[id] = {
            value,
            flag: `--${param_name}`,
            type,
            placeholder: "",
          };
        } else {
          dropdownInput[v4()] = {
            value,
            flag: `--${param_name}`,
            type,
            placeholder: "",
          };
        }
      }

      dispatch({
        type: Types.DropdownInput,
        payload: {
          input: dropdownInput,
          editorValue: true,
        },
      });

      dispatch({
        type: Types.RequiredInput,
        payload: {
          input: requiredInput,
          editorValue: true,
        },
      });
    }
  };

  return (
    <Checkbox
      isChecked={showPreviousRun ? true : false}
      id="fill-parameters"
      label="Fill the form using a latest run of this plugin"
      onChange={(checked) => {
        if (checked === true) {
          handleCheckboxChange();
        } else {
          dispatch({
            type: Types.RequiredInput,
            payload: {
              input: {},
              editorValue: true,
            },
          });
          dispatch({
            type: Types.DropdownInput,
            payload: {
              input: {},
              editorValue: true,
            },
          });
        }
        dispatch({
          type: Types.SetShowPreviousRun,
          payload: {
            showPreviousRun: checked,
          },
        });
      }}
    />
  );
};

const ItalicsComponent = ({ length }: { length?: number }) => {
  return (
    <i
      style={{
        color: "#4f5255",
        fontSize: "0.9rem",
      }}
    >
      (
      {`${length && length > 0 ? length : "No required"}${
        length === 1 ? " parameter" : " parameters"
      }`}
      )
    </i>
  );
};

const DropdownBasic = ({ plugins }: { plugins?: Plugin[] }) => {
  const dispatch = useDispatch();
  const [isopen, setIsOpen] = React.useState(false);
  const { state, dispatch: nodeDispatch } = useContext(AddNodeContext);
  const { selectedPluginFromMeta } = state;

  const onToggle = () => {
    setIsOpen(!isopen);
  };

  const onFocus = () => {
    const element = document.getElementById("toggle-child-node-version");
    element && element.focus();
  };

  const onSelect = () => {
    setIsOpen(false);
    onFocus();
  };

  const handleSelect = (selectedPlugin: Plugin) => {
    nodeDispatch({
      type: Types.SetSelectedPluginFromMeta,
      payload: {
        plugin: selectedPlugin,
      },
    });
    dispatch(getParams(selectedPlugin));
  };

  const dropdownItems =
    plugins && plugins?.length > 0
      ? plugins.map((selectedPlugin: Plugin) => {
          return (
            <DropdownItem
              style={{ padding: "0" }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSelect(selectedPlugin);
                }
              }}
              icon={
                selectedPlugin.data.version ===
                selectedPluginFromMeta?.data.version ? (
                  <FaCheck style={{ color: "green" }} />
                ) : (
                  <></>
                )
              }
              onClick={() => {
                handleSelect(selectedPlugin);
              }}
              key={selectedPlugin.data.id}
              name={selectedPlugin.data.version}
              value={selectedPlugin.data.value}
            >
              {selectedPlugin.data.version}
            </DropdownItem>
          );
        })
      : [];

  return (
    <div style={{display:'flex', flexDirection:'row'}}>
      <span className="configure-compute__label">Select a Plugin Version:</span>
      <Dropdown
        onSelect={onSelect}
        isOpen={isopen}
        toggle={
          <span style={{ display: "inline-flex" }}>
            <DropdownToggle id="toggle-child-node-version" onToggle={onToggle}>
              {selectedPluginFromMeta?.data.version}
            </DropdownToggle>
          </span>
        }
        dropdownItems={dropdownItems}
      />
    </div>
  );
};

const EditorValue = ({
  params,
}: {
  params?: {
    required: PluginParameter[];
    dropdown: PluginParameter[];
  };
}) => {
  const { state, dispatch } = useContext(AddNodeContext);
  const { editorValue } = state;
  const [validating, setValidating] = React.useState(false);

  return (
    <div className="autogenerated__text">
      <Grid hasGutter={true}>
        <GridItem span={10}>
          <ClipboardCopy
            onChange={(text?: string | number) => {
              if (text) {
                dispatch({
                  type: Types.SetEditorValue,
                  payload: {
                    value: text as string,
                  },
                });
              }
            }}
            hoverTip="Copy"
            clickTip="copied"
          >
            {editorValue}
          </ClipboardCopy>
        </GridItem>
        <GridItem span={2} className="icon">
          <Tooltip
            content={
              <div>
                Please validate your parameters by clicking the button if you
                have copy/pasted
              </div>
            }
          >
            <Button
              icon={<FaCheck />}
              onClick={() => {
                if (params) {
                  setValidating(true);
                  const { optional, nonOptional } = handleGetTokens(
                    editorValue,
                    params
                  );

                  if (Object.keys(optional).length > 0) {
                    dispatch({
                      type: Types.DropdownInput,
                      payload: {
                        input: optional,
                        editorValue: true,
                      },
                    });
                  }

                  if (Object.keys(nonOptional).length > 0) {
                    dispatch({
                      type: Types.RequiredInput,
                      payload: {
                        input: nonOptional,
                        editorValue: true,
                      },
                    });
                  }
                  setValidating(false);
                }
              }}
            >
              {validating ? (
                <span style={{ marginLeft: "0.25em" }}>Validating </span>
              ) : (
                ""
              )}
            </Button>
          </Tooltip>
        </GridItem>
      </Grid>
    </div>
  );
};