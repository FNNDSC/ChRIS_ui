import React from "react";
import {
  TextInput,
  Button,
  Alert,
  AlertActionCloseButton,
  ExpandableSection,
} from "@patternfly/react-core";
import SimpleDropdown from "./SimpleDropdown";
import RequiredParam from "./RequiredParam";
import ComputeEnvironments from "./ComputeEnvironment";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { isEmpty } from "lodash";
import { v4 } from "uuid";

import { GuidedConfigState, GuidedConfigProps } from "./types";
import { unpackParametersIntoString } from "./lib/utils";

const GuidedConfig = ({
  dropdownInput,
  requiredInput,
  inputChange,
  plugin,
  params,
  computeEnvs,
  selectedComputeEnv,
  setComputeEnviroment,
  deleteInput,
}: GuidedConfigProps) => {
  const [configState, setConfigState] = React.useState<GuidedConfigState>({
    componentList: [],
    count: 1,
    errors: [],
    alertVisible: false,
    docsExpanded: false,
  });

  const { componentList, count, errors, alertVisible, docsExpanded } =
    configState;

  const setDropdownDefaults = React.useCallback(() => {
    if (dropdownInput) {
      const defaultComponentList = Object.entries(dropdownInput).map(
        ([key]) => {
          return key;
        }
      );
      setConfigState((configState) => {
        return {
          ...configState,
          componentList: defaultComponentList,
          count: defaultComponentList.length,
        };
      });
    }
  }, [dropdownInput]);

  React.useEffect(() => {
    setDropdownDefaults();
  }, [setDropdownDefaults]);

  const handleDocsToggle = () => {
    setConfigState({
      ...configState,
      docsExpanded: !configState.docsExpanded,
    });
  };

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
    if (params && count < params.length) {
      setConfigState({
        ...configState,
        componentList: [...configState.componentList, v4()],
        count: configState.count + 1,
      });
    }

    if (params && count >= params.length) {
      setConfigState({
        ...configState,
        errors: ["You cannot more parameters to this plugin"],
        alertVisible: !configState.alertVisible,
      });
    }
  };

  const hideAlert = () => {
    setConfigState({
      ...configState,
      alertVisible: !configState.alertVisible,
    });
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
          <ExpandableSection
            className="docs"
            toggleText="Compute Environment configuration"
            isExpanded={docsExpanded}
            onToggle={handleDocsToggle}
          >
            {computeEnvs &&
              computeEnvs.map((computeEnv) => {
                return (
                  <div key={computeEnv.data.id} className="param-item">
                    <b className="param-title">{computeEnv.data.name}</b>
                    <div className="param-help">
                      {computeEnv.data.description}
                    </div>
                  </div>
                );
              })}
          </ExpandableSection>
        </div>
      );
    }
  };

  const renderRequiredParams = () => {
    if (params && params.length > 0) {
      return params.map((param, index) => {
        if (param.data.optional === false) {
          return (
            <React.Fragment key={index}>
              <RequiredParam
                param={param}
                requiredInput={requiredInput}
                addParam={addParam}
                inputChange={inputChange}
                id={v4()}
              />
            </React.Fragment>
          );
        } else return undefined;
      });
    }
  };

  const renderDropdowns = () => {
    return componentList.map((id, index) => {
      return (
        <SimpleDropdown
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

  let generatedCommand = plugin && `${plugin.data.name}: `;
  if (!isEmpty(requiredInput)) {
    generatedCommand += unpackParametersIntoString(requiredInput);
  }
  if (!isEmpty(dropdownInput)) {
    generatedCommand += unpackParametersIntoString(dropdownInput);
  }

  return (
    <div className="configuration">
      <div className="configuration__options">
        <h1 className="pf-c-title pf-m-2xl">{`Configure ${plugin?.data.name} v.${plugin?.data.version}`}</h1>
        <p>
          Use the &quot;Add more parameters&quot; button to add command line
          flags and values to the plugin.
        </p>
        <div className="configuration__buttons">
          <Button
            className="configuration__button"
            onClick={addParam}
            variant="primary"
          >
            Add more parameters
          </Button>
        </div>

        <div className="configuration__renders">
          {renderRequiredParams()}
          {renderDropdowns()}
          {renderComputeEnvs()}
        </div>
        {alertVisible &&
          errors.length > 0 &&
          errors.map((error, index) => {
            return (
              <Alert
                className="configuration__renders__alert"
                key={index}
                variant="danger"
                title={error}
                actionClose={<AlertActionCloseButton onClose={hideAlert} />}
              />
            );
          })}
        <div className="autogenerated">
          <TextInput
            className="autogenerated__text"
            type="text"
            aria-label="autogenerated-text"
            value={generatedCommand}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  params: plugin.parameters,
  computeEnvs: plugin.computeEnv,
});

export default connect(mapStateToProps, null)(GuidedConfig);
