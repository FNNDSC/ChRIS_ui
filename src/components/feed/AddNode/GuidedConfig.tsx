import React from "react";
import { Form, Label, TextInput, Button } from "@patternfly/react-core";
import SimpleDropdown from "./SimpleDropdown";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { isEqual, isEmpty } from "lodash";
import { uuid } from "uuidv4";
import { Alert, AlertActionCloseButton } from "@patternfly/react-core";
import { GuidedConfigState, GuidedConfigProps } from "./types";
import {
  getRequiredParams,
  unPackForKeyValue,
  unpackParametersIntoString,
} from "./lib/utils";
import { InputType } from "./types";

class GuidedConfig extends React.Component<
  GuidedConfigProps,
  GuidedConfigState
> {
  constructor(props: GuidedConfigProps) {
    super(props);
    this.state = {
      isOpen: false,
      componentList: [],
      count: 1,
      errors: [],
      alertVisible: false,
    };
    this.deleteComponent = this.deleteComponent.bind(this);
    this.addParam = this.addParam.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
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

  handleInputChange(value: string, event: React.FormEvent<HTMLInputElement>) {
    event.persist();
    const { inputChange } = this.props;

    const target = event.target as HTMLInputElement;
    const name = target.name;
    const id = target.id;

    inputChange(id, name, value, true);
  }

  addParam() {
    const { componentList, count, alertVisible } = this.state;
    const { params } = this.props;

    if (params && count < params.length) {
      this.setState({
        componentList: [...componentList, uuid()],
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

  renderRequiredParams() {
    const { params, requiredInput } = this.props;

    return (
      params &&
      params
        .filter((param) => param.data.optional === false)
        .map((param) => {
          let parameterValue = "";
          if (!isEmpty(requiredInput)) {
            if (requiredInput[param.data.id]) {
              //eslint-disable-next-line
              const [_key, value] = unPackForKeyValue(
                requiredInput[param.data.id]
              );
              parameterValue = value;
            }
          }

          return (
            <Form className="required-params" key={param.data.id}>
              <div className="required-params__layout">
                <Label className="required-params__label">
                  {`${param.data.flag}:`}
                  <span className="required-params__star">*</span>
                </Label>
                <Label className="required-params__infoLabel">
                  (*Required)
                </Label>
              </div>

              <TextInput
                aria-label="required-parameters"
                onChange={this.handleInputChange}
                name={param.data.name}
                className="required-params__textInput"
                placeholder={param.data.help}
                value={parameterValue || ""}
                id={`${param.data.id}`}
              />
            </Form>
          );
        })
    );
  }

  hideAlert() {
    this.setState({ alertVisible: !this.state.alertVisible });
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
        />
      );
    });
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
          <h1 className="pf-c-title pf-m-2xl">
            Configure MPC Volume Calculation Plugin
          </h1>

          <Button
            className="configuration__button"
            onClick={this.addParam}
            variant="primary"
          >
            Add Optional Parameters
          </Button>

          <div>
            <div className="configuration__renders">
              {this.renderRequiredParams()}
              {this.renderDropdowns()}
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
                    action={<AlertActionCloseButton onClose={this.hideAlert} />}
                  />
                );
              })}
            <div className="autogenerated">
              <Label className="autogenerated__label">Generated Command:</Label>
              <TextInput
                className="autogenerated__text"
                type="text"
                aria-label="autogenerated-config"
                value={generatedCommand}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  params: plugin.parameters,
});

export default connect(mapStateToProps, null)(GuidedConfig);
