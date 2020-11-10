import React from "react";
import {
  Label,
  TextInput,
  Button,
  Alert,
  AlertActionCloseButton,
  ExpandableSection
} from "@patternfly/react-core";
import SimpleDropdown from "./SimpleDropdown";
import RequiredParam from "./RequiredParam";
import ComputeEnvironments from './ComputeEnvironment'
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { isEqual, isEmpty } from "lodash";
import { v4 } from "uuid";

import { GuidedConfigState, GuidedConfigProps, InputType } from "./types";
import {
  getRequiredParams,
  unpackParametersIntoString,
} from "./lib/utils";

class GuidedConfig extends React.Component<
  GuidedConfigProps,
  GuidedConfigState
> {
  timer: number = 0;
  constructor(props: GuidedConfigProps) {
    super(props);
    this.state = {
      isOpen: false,
      componentList: [],
      count: 1,
      errors: [],
      alertVisible: false,
      docsExpanded: false,
    };
    this.deleteComponent = this.deleteComponent.bind(this);
    this.addParam = this.addParam.bind(this);
    this.hideAlert = this.hideAlert.bind(this);

  }

  componentDidMount() {
    const { dropdownInput, params } = this.props;

    if (params && params.length > 0) {
      let requiredParams = getRequiredParams(params);

      this.setState({
        count: requiredParams.length,
      });
    }
    this.setDropdownDefaults(dropdownInput);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentDidUpdate(prevProps: GuidedConfigProps) {
    const { dropdownInput } = this.props;
    if (!isEqual(prevProps.dropdownInput, dropdownInput)) {
      this.setDropdownDefaults(dropdownInput);
    }
  }

  setDropdownDefaults(dropdownInput: InputType) {
    if (!isEmpty(dropdownInput)) {
      let defaultComponentList = Object.entries(dropdownInput).map(
        ([key, _value]) => {
          return key;
        }
      );

      this.setState({
        componentList: defaultComponentList,
        count: defaultComponentList.length,
      });
    }
  }

  deleteComponent(id: string) {
    const { componentList } = this.state;
    let filteredList = componentList.filter((key) => {
      return key !== id;
    });
    this.setState({
      componentList: filteredList,
      count: this.state.count - 1,
    });
  }

  addParam() {
    const { componentList, count, alertVisible } = this.state;
    const { params } = this.props;

    if (params && count < params.length) {
      this.setState({
        componentList: [...componentList, v4()],
        count: this.state.count + 1,
      });
    }

    if (params && count >= params.length) {
      this.setState({
        errors: ["You cannot add more parameters to this plugin"],
        alertVisible: !alertVisible,
      });
    }
  }

  handleDocsToggle=()=>{
    this.setState({
      docsExpanded:!this.state.docsExpanded
    })
  }

  renderComputeEnvs() {
    const {
      computeEnvs,
      computeEnvironment,
      setComputeEnviroment,
    } = this.props;
    if (computeEnvs && computeEnvs.length > 0) {
      return (
        <div className="configure-compute">
          <Label className="configure-compute__label">
            Configure a compute environment:{" "}
          </Label>
          <ComputeEnvironments
            selectedOption={computeEnvironment}
            computeEnvs={computeEnvs}
            setComputeEnviroment={setComputeEnviroment}
          />
          <ExpandableSection
            className="docs"
            toggleText="Compute Environment configuration"
            isExpanded={this.state.docsExpanded}
            onToggle={this.handleDocsToggle}
          >
            {computeEnvs &&
              computeEnvs.map((computeEnv) => {
                return (
                  <div key={computeEnv.data.id} className="param-item">
                    <b className="param-title">{computeEnv.data.name}</b>
                    <div className="param-help">
                      {computeEnv.data.description}
                    </div>
                    <div className="param-help">
                      {computeEnv.data.compute_url}
                    </div>
                  </div>
                );
              })}
          </ExpandableSection>
        </div>
      );
    }
  }

  renderRequiredParams() {
    const { params, requiredInput, inputChange } = this.props;
    if (params && params.length > 0) {
      return params.map((param, index) => {
        if (param.data.optional === false) {
          return (
            <React.Fragment key={index}>
              <RequiredParam
                param={param}
                requiredInput={requiredInput}
                addParam={this.addParam}
                inputChange={inputChange}
              />
            </React.Fragment>
          );
        }
      });
    }
  }

  renderDropdowns() {
    const { componentList } = this.state;
    const { dropdownInput, deleteInput, inputChange, params } = this.props;
   

    return componentList.map((id, index) => {
      return (
        <SimpleDropdown
          key={index}
          params={params}
          handleChange={inputChange}
          id={id}
          deleteComponent={this.deleteComponent}
          deleteInput={deleteInput}
          dropdownInput={dropdownInput}
          addParam={this.addParam}
        />
      );
    });
  }

  hideAlert() {
    this.setState({ alertVisible: !this.state.alertVisible });
  }

  render() {
    const { dropdownInput, plugin, requiredInput } = this.props;
    const { alertVisible, errors } = this.state;

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
          <h1 className="pf-c-title pf-m-2xl">{`Configure ${plugin?.data.name}`}</h1>
          <p>
            Use the "Add more parameters" button to add command line flags and
            values to the plugin.
          </p>
          <div className="configuration__buttons">
            <Button
              className="configuration__button"
              onClick={this.addParam}
              variant="primary"
            >
              Add more parameters
            </Button>
          </div>

          <div className="configuration__renders">
            {this.renderRequiredParams()}
            {this.renderDropdowns()}
            {this.renderComputeEnvs()}
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
                  actionClose={
                    <AlertActionCloseButton onClose={this.hideAlert} />
                  }
                />
              );
            })}
          <div className="autogenerated">
            <Label className="autogenerated__label">Generated Command:</Label>
            <TextInput
              className="autogenerated__text"
              type="text"
              aria-label="autogenerated-text"
              value={generatedCommand}
            />
          </div>

          <Alert
            style={{
              marginTop: "15px",
            }}
            variant="info"
            title="If you prefer a free form input box where you might copy paste all the command line parameters, you can safely hit 'next' here."
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  params: plugin.parameters,
  computeEnvs:plugin.computeEnv
});

export default connect(mapStateToProps, null)(GuidedConfig);
