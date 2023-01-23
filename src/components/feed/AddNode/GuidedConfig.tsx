import React, { useEffect } from "react";
import {
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  ClipboardCopyButton,
  Dropdown,
  DropdownToggle,
  DropdownItem,
} from "@patternfly/react-core";
import SimpleDropdown from "./SimpleDropdown";
import RequiredParam from "./RequiredParam";
import ComputeEnvironments from "./ComputeEnvironment";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { v4 } from "uuid";
import { GuidedConfigState, GuidedConfigProps } from "./types";
import { unpackParametersIntoString } from "./lib/utils";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { Plugin } from "@fnndsc/chrisapi";
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
  pluginName,
  handlePluginSelect,
  plugin,
  errors,
}: GuidedConfigProps) => {
  const [configState, setConfigState] = React.useState<GuidedConfigState>({
    componentList: [],
    count: 0,
    alertVisible: false,
    editorValue: "",
  });

  const [copied, setCopied] = React.useState(false);
  const [plugins, setPlugins] = React.useState<Plugin[]>();
  const [pluginVersion, setPluginVersion] = React.useState<string>("");

  // Hard way

  React.useEffect(() => {
    const selectPluginVersion = async () => {
      const client = ChrisAPIClient.getClient();
      const pluginList = await client.getPlugins({ name_exact: pluginName });
      const pluginItems = pluginList.getItems() as unknown as Plugin[];

      setPlugins(pluginItems);
    };

    selectPluginVersion();
  }, [pluginName]);

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

  const clipboardCopyFunc = (event: any, text: string) => {
    navigator.clipboard.writeText(text.toString());
  };

  const onClick = (event: any, text: string) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const actions = (
    <React.Fragment>
      <CodeBlockAction>
        <ClipboardCopyButton
          id="basic-copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, configState.editorValue)}
          exitDelay={copied ? 1500 : 600}
          maxWidth="110px"
          variant="plain"
          onTooltipHidden={() => setCopied(false)}
        >
          {copied ? "Successfully copied to clipboard!" : "Copy to clipboard"}
        </ClipboardCopyButton>
      </CodeBlockAction>
    </React.Fragment>
  );

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
          {
            <ComputeEnvironments
              selectedOption={selectedComputeEnv}
              computeEnvs={computeEnvs}
              setComputeEnvironment={setComputeEnviroment}
            />
          }
        </div>
      );
    }
  };

  const renderRequiredParams = () => {
    if (params && params["required"].length > 0) {
      return params["required"].map((param, index) => {
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
    }
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

  const DropdownBasic = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const onToggle = (isOpen: boolean) => {
      setIsOpen(isOpen);
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
        ? plugins
            .sort((a, b) =>
              a.data.version > b.data.version
                ? -1
                : b.data.version > a.data.version
                ? 1
                : 0
            )
            .map((selectedPlugin: Plugin) => {
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
                    selectedPlugin.data.version === plugin?.data.version ? (
                      <FaCheck style={{ color: "green" }} />
                    ) : (
                      <></>
                    )
                  }
                  onClick={() => {
                    setPluginVersion(selectedPlugin.data.version);
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
              {pluginVersion || plugin?.data.version}
            </DropdownToggle>
          </span>
        }
        dropdownItems={dropdownItems}
      />
    );
  };

  return (
    <>
      <div className="configuration">
        <div className="configuration__options">
          {!defaultValueDisplay && (
            <h1 className="pf-c-title pf-m-2xl">{`Configure ${pluginName}`}</h1>
          )}
          <div className="configuration__renders">
            <h4 style={{ display: "inline", marginRight: "1rem" }}>Version</h4>
            <DropdownBasic />
          </div>

          <div className="configuration__renders">
            <div>
              <h4>Required Parameters</h4>
              {renderRequiredParams()}
            </div>

            <div
              style={{
                margin: "1.5em 0 1.5em 0",
              }}
            >
              <h4>Optional Parameters</h4>
              {renderDropdowns()}
            </div>

            {renderComputeEnv && renderComputeEnvs()}
          </div>
        </div>
      </div>
      {errors && <ReactJson src={errors} />}
      <div
        style={{
          marginTop: "3rem",
        }}
      >
        <CodeBlock actions={actions}>
          <CodeBlockCode>{configState.editorValue}</CodeBlockCode>
        </CodeBlock>
      </div>
    </>
  );
};

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  params: plugin.parameters,
  computeEnvs: plugin.computeEnv,
});

export default connect(mapStateToProps, null)(GuidedConfig);
