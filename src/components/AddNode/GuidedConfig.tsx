import React from "react";
import { Form, Label, TextInput, Button } from "@patternfly/react-core";
import { PluginParameter, Plugin } from "@fnndsc/chrisapi";
import SimpleDropdown from "./SimpleDropdown";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import _ from "lodash";

interface GuidedConfigState {
  isOpen: boolean;
  componentList: any[];
  value: string;
  flag: string;
  defaultDropdownFlag: "";
  defaultDropdownValue: "";
}

export interface GuidedConfigProps {
  plugin: Plugin;
  params?: PluginParameter[];
  inputChange(id: number, paramName: string, value: string): void;
  userInput: {
    [key: number]: {
      [key: string]: string;
    };
  };
  deleteInput(input: number): void;
}

class GuidedConfig extends React.Component<
  GuidedConfigProps,
  GuidedConfigState
> {
  constructor(props: GuidedConfigProps) {
    super(props);
    this.state = {
      isOpen: false,
      componentList: [],
      value: "",
      flag: "",
      defaultDropdownFlag: "",
      defaultDropdownValue: "",
    };
  }

  componentDidMount() {
    console.log("Guided Config mount", console.log(this.props.userInput));
    this.setDropdownDefaults(this.props.userInput);
  }

  componentDidUpdate(prevProps: GuidedConfigProps) {
    if (!_.isEqual(prevProps.userInput, this.props.userInput)) {
      this.setDropdownDefaults(this.props.userInput);
    }
  }

  setDropdownDefaults = (userInput: {
    [key: number]: {
      [key: string]: string;
    };
  }) => {
    if (this.state.componentList.length >= 1) {
      return;
    }
    let defaultComponentList = Object.entries(userInput).map(([key, value]) => {
      return key;
    });

    this.setState({
      componentList: defaultComponentList,
    });
  };

  deleteComponent = (id: number) => {
    const { componentList } = this.state;
    let filteredList = componentList.filter((index: number) => {
      return index !== id;
    });
    this.setState({
      componentList: filteredList,
    });
  };

  handleInputChange = (
    value: string,
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const { inputChange } = this.props;
    event.persist();
    const target = event.target as HTMLInputElement;
    const name = target.name;
    const id = parseInt(target.id);

    this.setState(
      {
        flag: name,
        value,
      },
      () => {
        inputChange(id, this.state.flag, this.state.value);
      }
    );
  };

  renderRequiredParams = () => {
    const { params, userInput } = this.props;

    return (
      params &&
      params.map((param) => {
        if (param.data.optional === false) {
          let testValue = "";
          if (!_.isEmpty(userInput)) {
            const test = userInput[param.data.id];
            if (test) {
              let value = Object.keys(test)[0];
              testValue = test[value];
            }
          }

          return (
            <Form className="required-params" key={param.data.id}>
              <Label className="required-label">{`${param.data.flag}:`}</Label>
              <TextInput
                aria-label="required-param"
                spellCheck={false}
                onChange={this.handleInputChange}
                name={param.data.name}
                className="required-param"
                placeholder={param.data.help}
                value={testValue || ""}
                id={`${param.data.id}`}
              />
            </Form>
          );
        }
      })
    );
  };

  addParam = () => {
    const { componentList } = this.state;

    this.setState({
      componentList: [...this.state.componentList, componentList.length + 1],
    });
  };

  renderDropdowns = () => {
    const { componentList } = this.state;
    const { userInput, deleteInput, inputChange, params } = this.props;

    let test: any[] = [];

    test = componentList.map((id) => {
      return (
        <SimpleDropdown
          key={id}
          params={params}
          handleChange={inputChange}
          id={id}
          deleteComponent={this.deleteComponent}
          deleteInput={deleteInput}
          userInput={userInput}
        />
      );
    });

    return test;
  };

  render() {
    const { userInput, plugin } = this.props;

    let generatedCommand = plugin && `${plugin.data.name}: `;

    for (let object in userInput) {
      const flag = Object.keys(userInput[object])[0];
      const value = userInput[object][flag];
      generatedCommand += ` --${flag} ${value}`;
    }

    return (
      <div className="configure-container">
        <div className="configure-options">
          <h1 className="pf-c-title pf-m-2xl">
            Configure MPC Volume Calculation Plugin
          </h1>

          <Button
            className="config-button"
            onClick={this.addParam}
            variant="primary"
          >
            Add Configuration options
          </Button>

          <div className="config-container">
            <div className="generated-config">
              {this.renderRequiredParams()}
              {this.renderDropdowns()}
            </div>

            <div className="autogenerated-config">
              <Label className="autogenerated-label">Generated Command:</Label>
              <TextInput
                className="autogenerated-text"
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

const mapStateToProps = (state: ApplicationState) => ({
  params: state.plugin.parameters,
});

export default connect(mapStateToProps, null)(GuidedConfig);
