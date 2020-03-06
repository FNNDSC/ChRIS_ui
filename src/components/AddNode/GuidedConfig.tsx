import React from "react";
import { Switch, Form, Label, TextInput, Button } from "@patternfly/react-core";
import { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import SimpleDropdown from "./SimpleDropdown";

interface GuidedConfigState {
  isChecked: boolean;
  params: PluginParameter[];
  isOpen: boolean;
  componentList: any[];
}

interface GuidedConfigProps {
  plugin: Plugin;
}

class GuidedConfig extends React.Component<
  GuidedConfigProps,
  GuidedConfigState
> {
  constructor(props: GuidedConfigProps) {
    super(props);
    this.state = {
      isChecked: true,
      params: [],
      isOpen: false,
      componentList: []
    };
  }

  componentDidMount() {
    this.fetchParams();
  }

  componendDidUpdate(prevProps: GuidedConfigProps) {
    if (prevProps.plugin.data.id !== this.props.plugin.data.id) {
      this.fetchParams();
    }
  }

  async fetchParams() {
    const { plugin } = this.props;

    if (plugin) {
      const paramList = await plugin.getPluginParameters();
      const params = paramList.getItems();
      this.setState({
        params
      });
    }
  }

  handleChange = (isChecked: boolean) => {
    this.setState({ isChecked });
  };

  renderRequiredParams() {
    const { params } = this.state;

    return params.map(param => {
      if (param.data.optional === false) {
        return (
          <Form className="required-params" key={param.data.id}>
            <Label className="required-label">{param.data.flag}</Label>
            <TextInput aria-label="required-param" spellCheck={false} />
          </Form>
        );
      }
    });
  }

  addParam = () => {
    const { componentList, params } = this.state;

    if (componentList.length < params.length) {
      const key = componentList.length;

      this.setState({
        componentList: [
          ...componentList,
          <SimpleDropdown key={key} params={params} />
        ]
      });
    } else {
      console.log("You cannot any more parameters");
    }
  };

  renderDropdowns() {
    const { componentList } = this.state;
    return componentList.map(component => component);
  }

  render() {
    const { isChecked, params } = this.state;

    return (
      <div className="screen-two">
        <h1 className="pf-c-title pf-m-2xl">
          Configure MPC Volume Calculation Plugin
        </h1>
        <Switch
          id="simple-switch"
          label="Guided configuration on. Click to disable"
          labelOff="Guided configuration off."
          isChecked={isChecked}
          onChange={this.handleChange}
        />
        <Button onClick={this.addParam} variant="primary">
          Add Configuration options
        </Button>

        {this.renderRequiredParams()}
        {this.renderDropdowns()}
      </div>
    );
  }
}

export default GuidedConfig;
