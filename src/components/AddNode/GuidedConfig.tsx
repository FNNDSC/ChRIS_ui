import type {
  Plugin,
  PluginInstanceList,
  PluginInstanceParameter,
  PluginMetaPluginList,
  PluginParameter,
} from "@fnndsc/chrisapi";
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownList,
  Form,
  FormGroup,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  TextInput,
  Tooltip,
} from "@patternfly/react-core";
import { useMutation } from "@tanstack/react-query";
import { Alert, Spin } from "../Antd";
import { isEmpty } from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { quote } from "shlex";
import { v4 } from "uuid";
import { catchError, fetchResource, needsQuoting } from "../../api/common";
import { useTypedSelector } from "../../store/hooks";
import { getParams } from "../../store/plugin/actions";
import { ClipboardCopyFixed, ErrorAlert } from "../Common";
import ComputeEnvironments from "./ComputeEnvironment";
import RequiredParam from "./RequiredParam";
import SimpleDropdown from "./SimpleDropdown";
import { AddNodeContext } from "./context";
import { type InputIndex, Types } from "./types";
import { handleGetTokens, unpackParametersIntoString } from "./utils";

const advancedConfigList = [
  {
    name: "cpu_limit",
    helper_text: "A valid integer is required",
  },
  {
    name: "memory_limit",
    helper_text:
      "The format of the input should be '<i>X</i> Mi' or '<i>X</i> Gi' where <i>'X'</i> is an integer",
  },
  {
    name: "gpu_limit",
    helper_text: "A valid integer is required",
  },
];

const memory_limit = ["Mi", "Gi"];

const GuidedConfig = () => {
  const dispatch = useDispatch();
  const { state, dispatch: nodeDispatch } = useContext(AddNodeContext);
  const { parameters: params, resourceError } = useTypedSelector(
    (state) => state.plugin,
  );
  const { pluginMeta, dropdownInput, requiredInput, componentList, errors } =
    state;

  const [plugins, setPlugins] = React.useState<Plugin[]>();

  useEffect(() => {
    const el = document.querySelector(".react-json-view");

    if (el) {
      el!.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  });

  useEffect(() => {
    const fetchPluginVersions = async () => {
      try {
        // Todo: Use an already available helper here from the Store component
        const pluginList: PluginMetaPluginList | undefined =
          await pluginMeta?.getPlugins({
            limit: 1000,
          });

        if (pluginList) {
          const pluginItems = pluginList.getItems() as unknown as Plugin[];
          setPlugins(pluginItems);
          const plugin = pluginItems[0];
          // Select the first plugin in the list as default
          nodeDispatch({
            type: Types.SetSelectedPluginFromMeta,
            payload: {
              plugin,
            },
          });

          // Fetch the parameters for this particular plugin to display as a form.
          dispatch(getParams(plugin));
        }
      } catch (e) {
        const error_message = catchError(e).error_message;
        dispatch({
          type: Types.SetError,
          payload: {
            error: !isEmpty(error_message)
              ? error_message
              : "Failed to fetch plugin versions.",
          },
        });
      }
    };
    fetchPluginVersions();
  }, [dispatch, pluginMeta, nodeDispatch]);

  useEffect(() => {
    //Construct the dropdown components as the input for optional parameters change
    let defaultComponentList = [];
    if (Object.keys(dropdownInput).length > 0) {
      defaultComponentList = Object.entries(dropdownInput).map(([key]) => {
        return key;
      });

      if (params && defaultComponentList.length < params.dropdown.length) {
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
    // Construct the value for the copy/paste editor as the required and optional values are edited
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
    // Component to render required parameters
    return params.map((param) => {
      return (
        <div key={param.data.id}>
          <RequiredParam param={param} id={v4()} />
        </div>
      );
    });
  };

  const renderDropdowns = () => {
    // Component to render optional parameters
    return componentList.map((id, index) => {
      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
      return <SimpleDropdown key={index} params={params} id={id} />;
    });
  };

  const renderComputeEnvs = () => {
    // Component to render computer enviroments
    return (
      <div className="configure-compute">
        <span className="configure-compute__label">
          Select a compute environment:{" "}
        </span>
        <ComputeEnvironments />
      </div>
    );
  };

  const renderPluginVersions = () => {
    // Component to render plugin versions
    return (
      <div className="configure-compute">
        <span className="configure-compute__label">
          Select a Plugin Version:{" "}
        </span>
        <DropdownBasic plugins={plugins} />
      </div>
    );
  };

  const requiredLength = params?.required.length;
  const dropdownLength = params?.dropdown.length;

  return (
    <div className="configuration">
      <CardComponent>
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <div
              style={{ marginRight: "1rem" }}
              className="configuration__renders"
            >
              {renderPluginVersions()}
            </div>
            <div className="configuration__renders">{renderComputeEnvs()}</div>
          </div>
        </>
      </CardComponent>

      <CardComponent>
        <CheckboxComponent />
      </CardComponent>

      <CardComponent>
        <>
          <h4 style={{ marginBottom: "1rem" }}>Command Line Parameters:</h4>
          <EditorValue params={params} />
        </>
      </CardComponent>

      <CardComponent>
        <>
          <div style={{ marginBottom: "1rem" }}>
            <span>
              Required Parameters{" "}
              <ItalicsComponent
                length={requiredLength}
                isRequiredParam={true}
              />
            </span>
            {params &&
              params.required.length > 0 &&
              renderRequiredParams(params.required)}
          </div>
          <div>
            <span>
              Optional Parameters{" "}
              <ItalicsComponent
                length={dropdownLength}
                isRequiredParam={false}
              />
            </span>

            {renderDropdowns()}
          </div>
        </>
      </CardComponent>
      <AdvancedConfiguration />

      {/* Error handling */}
      {errors && Object.keys(errors).length > 0 && (
        <ErrorAlert
          errors={errors}
          cleanUpErrors={() => {
            nodeDispatch({
              type: Types.SetError,
              payload: {
                error: {},
              },
            });
          }}
        />
      )}

      {resourceError && <Alert type="error" description={resourceError} />}
    </div>
  );
};

export default GuidedConfig;

const CardComponent = ({ children }: { children: React.ReactElement }) => {
  return (
    <Card>
      <CardBody className="patternfly-card-component">{children}</CardBody>
    </Card>
  );
};

const CheckboxComponent = () => {
  // This component automatically constructs the Form and the Editor Value from a previous run of a plugin instance
  const { parameters: params, resourceError } = useTypedSelector(
    (state) => state.plugin,
  );
  const { state, dispatch } = useContext(AddNodeContext);
  const { showPreviousRun, selectedPluginFromMeta } = state;

  const handleCheckboxChange = async () => {
    // Todo: This list needs to use a helper and be paginated
    const pluginInstanceList: PluginInstanceList | undefined =
      await selectedPluginFromMeta?.getPluginInstances({
        limit: 1000,
      });

    const pluginInstances = pluginInstanceList?.getItems();

    if (!pluginInstances) {
      throw new Error(
        "Failed to fetch the parameters from a latest run of this plugin instance",
      );
    }

    if (pluginInstances && pluginInstances.length > 0) {
      // Assuming this is the latest run. The first plugin instance in the list is assumed to be the latest instance that was run
      const pluginInstance = pluginInstances[0];

      // Code to fetch all the parameters assosciated with this instance
      const paramsToFn = { limit: 10, offset: 0 };
      const fn = pluginInstance.getParameters;
      const boundFn = fn.bind(pluginInstance);
      const { resource: pluginParameters } =
        await fetchResource<PluginInstanceParameter>(paramsToFn, boundFn);

      const requiredInput: { [id: string]: InputIndex } = {};
      const dropdownInput: { [id: string]: InputIndex } = {};

      // Construct both the required and optional parts of the form

      const paramsRequiredFetched = params?.required.reduce(
        (acc: any, param) => {
          acc[param.data.name] = [param.data.id, param.data.flag];
          return acc;
        },
        {},
      );

      const paramsDropdownFetched = params?.dropdown.reduce(
        (acc: any, param) => {
          acc[param.data.name] = param.data.flag;
          return acc;
        },
        {},
      );

      for (let i = 0; i < pluginParameters.length; i++) {
        const parameter = pluginParameters[i];
        const { param_name, type, value } = parameter.data;
        if (paramsRequiredFetched?.[param_name]) {
          const quotedValue =
            type === "string" && needsQuoting(value) ? quote(value) : value;
          const [id, flag] = paramsRequiredFetched[param_name];
          requiredInput[id] = {
            value: quotedValue,
            flag,
            type,
            placeholder: "",
          };
        } else if (paramsDropdownFetched) {
          const quotedValue =
            type === "string" && needsQuoting(value) ? quote(value) : value;

          const flag = paramsDropdownFetched[param_name];
          dropdownInput[v4()] = {
            value: quotedValue,
            flag,
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

  const { isPending, isError, error, mutate, reset } = useMutation({
    mutationFn: () => handleCheckboxChange(),
  });

  return (
    <>
      <Checkbox
        isDisabled={!!resourceError}
        isChecked={showPreviousRun ?? false}
        id="fill-parameters"
        label="Fill the form using a latest run of this plugin"
        onChange={(_event, checked) => {
          if (checked) {
            //handleCheckboxChange();
            mutate();
          } else {
            reset();
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

          // Store the checkbox state in the reducer
          dispatch({
            type: Types.SetShowPreviousRun,
            payload: {
              showPreviousRun: checked,
            },
          });
        }}
      />
      {isPending && (
        <div style={{ marginTop: "0.75em" }}>
          <Spin />{" "}
          <span style={{ marginLeft: "0.75em" }}>Contructing the form...</span>
        </div>
      )}
      {isError && <Alert type="error" description={error.message} />}
    </>
  );
};

const ItalicsComponent = ({
  length,
  isRequiredParam,
}: {
  length?: number;
  isRequiredParam: boolean;
}) => {
  return (
    <i>
      (
      {`${
        length && length > 0
          ? length
          : isRequiredParam
            ? "No required"
            : "No optional"
      }${length === 1 ? " parameter" : " parameters"}`}
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

  const handleSelect = (selectedPlugin: Plugin) => {
    nodeDispatch({
      type: Types.SetSelectedPluginFromMeta,
      payload: {
        plugin: selectedPlugin,
      },
    });
    dispatch(getParams(selectedPlugin));
  };

  const menuItems =
    plugins && plugins?.length > 0
      ? plugins.map((selectedPlugin: Plugin) => {
          return (
            <SelectOption
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSelect(selectedPlugin);
                }
              }}
              isSelected={
                selectedPlugin.data.version ===
                selectedPluginFromMeta?.data.version
              }
              onClick={() => {
                handleSelect(selectedPlugin);
              }}
              key={selectedPlugin.data.id}
              name={selectedPlugin.data.version}
              value={selectedPlugin.data.value}
            >
              {selectedPlugin.data.version}
            </SelectOption>
          );
        })
      : [];

  return (
    <Select
      isOpen={isopen}
      toggle={(toggleRef: any) => (
        <MenuToggle ref={toggleRef} onClick={onToggle}>
          {selectedPluginFromMeta?.data.version}
        </MenuToggle>
      )}
    >
      <SelectList>{menuItems}</SelectList>
    </Select>
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
  // This component allows the user to copy paste the values directly into a clipboard, validate it and run the plugin
  const { state, dispatch } = useContext(AddNodeContext);
  const { editorValue } = state;
  const [validating, setValidating] = React.useState(false);

  return (
    <div style={{ width: "100%" }} className="autogenerated__text">
      <Grid hasGutter={true}>
        <GridItem span={12}>
          <ClipboardCopyFixed
            value={editorValue}
            onChange={(_event, text?: string | number) => {
              if (text) {
                dispatch({
                  type: Types.SetEditorValue,
                  payload: {
                    value: text as string,
                  },
                });
              }
            }}
          />
        </GridItem>
        <GridItem span={2}>
          <Tooltip
            exitDelay={100}
            isVisible={true}
            position="right"
            content={
              <span>
                Click this button to validate your parameters if you have
                copy/pasted.
              </span>
            }
          >
            <Button
              variant="primary"
              onClick={() => {
                if (params) {
                  setValidating(true);
                  const { optional, nonOptional } = handleGetTokens(
                    editorValue,
                    params,
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
              {validating ? <span>Validating </span> : <span>Validate</span>}
            </Button>
          </Tooltip>
        </GridItem>
      </Grid>
    </div>
  );
};

const AdvancedConfiguration = () => {
  const { state, dispatch } = useContext(AddNodeContext);
  const [isOpen, setIsOpen] = useState(false);
  const { errors, advancedConfig, memoryLimit } = state;

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onFocus = () => {
    const element = document.getElementById("memory-limit");
    element?.focus();
  };

  const onSelect = () => {
    setIsOpen(false);
    onFocus();
  };
  const dropdownItems = memory_limit.map((unit) => {
    return (
      <DropdownItem
        isSelected={memoryLimit === unit}
        onClick={() => {
          dispatch({
            type: Types.MemoryLimitUnit,
            payload: {
              value: unit,
            },
          });
        }}
        key={unit}
      >
        {unit}
      </DropdownItem>
    );
  });

  return (
    <CardComponent>
      <>
        {advancedConfigList.map((config) => {
          return (
            <Form
              key={config.name}
              onSubmit={(event: any) => {
                event.preventDefault();
              }}
              isHorizontal
              aria-invalid={errors?.[config.name] ? "true" : "false"}
              style={{
                marginBottom: "0.5em",
              }}
            >
              <FormGroup style={{ width: "100%" }} label={`${config.name}:`}>
                <TextInput
                  type="text"
                  aria-label="advanced configuration"
                  value={advancedConfig[config.name]}
                  validated={errors?.[config.name] ? "error" : "default"}
                  onChange={(_event, value: string) => {
                    dispatch({
                      type: Types.AdvancedConfiguration,
                      payload: {
                        key: config.name,
                        value,
                      },
                    });
                  }}
                />
                {config.name === "memory_limit" && (
                  <Dropdown
                    toggle={(toggleRef) => {
                      return (
                        <MenuToggle ref={toggleRef} onClick={onToggle}>
                          {memoryLimit}
                        </MenuToggle>
                      );
                    }}
                    onSelect={onSelect}
                    isOpen={isOpen}
                    shouldFocusToggleOnSelect
                  >
                    <DropdownList>{dropdownItems}</DropdownList>
                  </Dropdown>
                )}
                <HelperText style={{ marginTop: "0.25em" }}>
                  <HelperTextItem>
                    <div
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                      dangerouslySetInnerHTML={{
                        __html: `${config.helper_text}`,
                      }}
                    />
                  </HelperTextItem>
                </HelperText>
              </FormGroup>
            </Form>
          );
        })}
      </>
    </CardComponent>
  );
};
