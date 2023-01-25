import React, { useEffect } from "react";
import {
  ClipboardCopy,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  Card,
  CardBody,
} from "@patternfly/react-core";
import SimpleDropdown from "./SimpleDropdown";
import RequiredParam from "./RequiredParam";
import ComputeEnvironments from "./ComputeEnvironment";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { v4 } from "uuid";
import { GuidedConfigState, GuidedConfigProps } from "./types";
import { unpackParametersIntoString } from "./lib/utils";
import { Plugin, PluginParameter, PluginMeta } from "@fnndsc/chrisapi";
import { FaCheck } from "react-icons/fa";
import ReactJson from "react-json-view";

const GuidedConfig = ({
  defaultValueDisplay,
  renderComputeEnv,
  dropdownInput,
  requiredInput,
  inputChange,
  params,
  computeEnvs,
  selectedComputeEnv,
  setComputeEnviroment,
  deleteInput,
  selectedPluginFromMeta,
  handlePluginSelect,
  pluginMeta,
  errors,
}: GuidedConfigProps) => {
  const [configState, setConfigState] = React.useState<GuidedConfigState>({
    componentList: [],
    count: 0,
    alertVisible: false,
    editorValue: "",
  });

  const [plugins, setPlugins] = React.useState<Plugin[]>();

  React.useEffect(() => {
    const selectPluginVersion = async () => {
      const pluginList = await pluginMeta?.getPlugins({
        limit: 1000,
      });

      if (pluginList) {
        const pluginItems = pluginList.getItems() as unknown as Plugin[];
        setPlugins(pluginItems);
        handlePluginSelect &&
          handlePluginSelect(pluginItems[pluginItems.length - 1]);
      }
    };

    selectPluginVersion();
  }, [pluginMeta]);

  React.useEffect(() => {
    setConfigState((configState) => {
      return {
        ...configState,
        count: 1,
        componentList: [v4()],
      };
    });
  }, []);

  useEffect(() => {
    let derivedValue = "";

    if (requiredInput) {
      derivedValue += unpackParametersIntoString(requiredInput);
    }

    if (dropdownInput) {
      derivedValue += unpackParametersIntoString(dropdownInput);
    }

    setConfigState((state) => {
      return {
        ...state,
        editorValue: derivedValue,
      };
    });
  }, [dropdownInput, requiredInput]);

  const { componentList, count } = configState;

  const deleteComponent = (id: string) => {
    const filteredList = componentList.filter((key) => {
      return key !== id;
    });

    setConfigState({
      ...configState,
      componentList: filteredList,
      count: configState.count - 1,
    });
  };

  const addParam = () => {
    if (params && count < params["dropdown"].length) {
      setConfigState({
        ...configState,
        componentList: [...configState.componentList, v4()],
        count: configState.count + 1,
      });
    }
  };

  const renderComputeEnvs = () => {
    if (computeEnvs && computeEnvs.length > 0) {
      return (
        <div className="configure-compute">
          <span className="configure-compute__label">
            Select a compute environment:{" "}
          </span>
          <ComputeEnvironments
            selectedOption={selectedComputeEnv}
            computeEnvs={computeEnvs}
            setComputeEnvironment={setComputeEnviroment}
          />
        </div>
      );
    }
  };

  const renderRequiredParams = (params: PluginParameter[]) => {
    return params.map((param, index) => {
      return (
        <React.Fragment key={index}>
          <RequiredParam
            param={param}
            requiredInput={requiredInput}
            inputChange={inputChange}
            id={v4()}
          />
        </React.Fragment>
      );
    });
  };

  const renderDropdowns = () => {
    return componentList.map((id, index) => {
      return (
        <SimpleDropdown
          defaultValueDisplay={defaultValueDisplay}
          key={index}
          params={params}
          handleChange={inputChange}
          id={id}
          deleteComponent={deleteComponent}
          deleteInput={deleteInput}
          dropdownInput={dropdownInput}
          addParam={addParam}
        />
      );
    });
  };

  const requiredLength = params && params["required"].length;
  const dropdownLength = params && params["dropdown"].length;

  return (
    <>
      <div className="configuration">
        <div className="configuration__options">
          {!defaultValueDisplay && (
            <h1 className="pf-c-title pf-m-2xl">{`Configure ${selectedPluginFromMeta?.data.name} v.${selectedPluginFromMeta?.data.version}`}</h1>
          )}
          <CardComponent>
            <>
              <h4 style={{ display: "inline", marginRight: "1rem" }}>
                Version
              </h4>
              <DropdownBasic
                plugins={plugins}
                selectedPluginFromMeta={selectedPluginFromMeta}
                handlePluginSelect={handlePluginSelect}
              />
            </>
          </CardComponent>

          <CardComponent>
            <>
              <div>
                <h4>
                  Required Parameters{" "}
                  <ItalicsComponent length={requiredLength} />
                </h4>

                {params &&
                  params["required"].length > 0 &&
                  renderRequiredParams(params["required"])}
              </div>

              <div>
                <h4>
                  Optional Parameters{" "}
                  <ItalicsComponent length={dropdownLength} />
                </h4>
                {renderDropdowns()}
              </div>
            </>
          </CardComponent>

          <CardComponent>
            <div className="configuration__renders">
              {renderComputeEnv && renderComputeEnvs()}
            </div>
          </CardComponent>
        </div>
      </div>
      <>
        <CardComponent>
          <div>
            {Object.keys(errors).length > 0 && <ReactJson src={errors} />}
          </div>
        </CardComponent>

        <div className="autogenerated__text">
          <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="copied">
            {configState.editorValue}
          </ClipboardCopy>
        </div>
      </>
    </>
  );
};

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  params: plugin.parameters,
  computeEnvs: plugin.computeEnv,
});

export default connect(mapStateToProps, null)(GuidedConfig);

const CardComponent = ({ children }: { children: React.ReactElement }) => {
  return (
    <Card>
      <CardBody>{children}</CardBody>
    </Card>
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

const DropdownBasic = ({
  plugins,
  handlePluginSelect,
  selectedPluginFromMeta,
}: {
  plugins?: Plugin[];
  selectedPluginFromMeta?: Plugin;
  handlePluginSelect: (plugin: Plugin) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onFocus = () => {
    const element = document.getElementById("toggle-child-node-version");
    element && element.focus();
  };

  const onSelect = () => {
    setIsOpen(false);
    onFocus();
  };

  const dropdownItems =
    plugins && plugins?.length > 0 && typeof handlePluginSelect === "function"
      ? plugins.map((selectedPlugin: Plugin) => {
          return (
            <DropdownItem
              style={{ padding: "0" }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handlePluginSelect(selectedPlugin);
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
                handlePluginSelect(selectedPlugin);
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
    <Dropdown
      onSelect={onSelect}
      isOpen={isOpen}
      toggle={
        <span style={{ display: "inline-flex" }}>
          <DropdownToggle id="toggle-child-node-version" onToggle={onToggle}>
            {selectedPluginFromMeta?.data.version}
          </DropdownToggle>
        </span>
      }
      dropdownItems={dropdownItems}
    />
  );
};
