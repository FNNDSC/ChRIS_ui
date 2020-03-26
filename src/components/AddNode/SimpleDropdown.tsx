import React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  TextInput
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import { PluginParameter } from "@fnndsc/chrisapi";
import { CloseIcon } from "@patternfly/react-icons";

interface SimpleDropdownState {
  isOpen: boolean;
  value: string;
  flag: string;
  test: string;
}

interface SimpleDropdownProps {
  params?: PluginParameter[];
  toggle?: React.ReactElement<any>;
  onSelect?: (event: React.SyntheticEvent<HTMLDivElement>) => void;
  isOpen?: boolean;
  dropdownItems?: any[];
  id: number;
  handleChange(id: number, paramName: string, value: string): void;
  deleteComponent(id: number): void;
  deleteInput(input: string): void;
}

class SimpleDropdown extends React.Component<
  SimpleDropdownProps,
  SimpleDropdownState
> {
  constructor(props: SimpleDropdownProps) {
    super(props);
    this.state = {
      isOpen: false,
      value: "",
      flag: "",
      test: ""
    };
  }
  onToggle = (isOpen: boolean) => {
    this.setState({
      isOpen
    });
  };
  onSelect = (event?: React.SyntheticEvent<HTMLDivElement>): void => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  handleClick = (event: any) => {
    event.persist();
    const { handleChange, id } = this.props;
    const flag = event.target.value;
    const value = this.state.value;

    console.log(flag, value, event.target.name);

    this.setState(
      prevState => {
        return {
          flag: event.target.value
        };
      },
      () => {
        handleChange(id, this.state.flag, this.state.value);
      }
    );
  };

  deleteDropdown = () => {
    const { id, deleteComponent, deleteInput } = this.props;
    const { flag } = this.state;

    deleteInput(flag);
    deleteComponent(id);
  };

  handleInputChange = (value: string) => {
    const { handleChange, id } = this.props;
    this.setState(
      {
        value
      },
      () => {
        handleChange(id, this.state.flag, this.state.value);
      }
    );
  };

  render() {
    const { isOpen, value, flag } = this.state;
    const { params } = this.props;

    if (!params) {
      return;
    }
    const dropdownItems = params.map(param => {
      const id = param.data.id;
      return (
        <DropdownItem
          key={id}
          onClick={this.handleClick}
          component="button"
          className="plugin-parameter"
          value={param.data.name}
          name={param.data.name}
        >
          {param.data.name}
        </DropdownItem>
      );
    });

    return (
      <div className="plugin-config">
        <Dropdown
          onSelect={this.onSelect}
          toggle={
            <DropdownToggle
              id="toggle-id"
              onToggle={this.onToggle}
              iconComponent={CaretDownIcon}
            >
              {flag ? `${flag}` : "Choose a Parameter"}
            </DropdownToggle>
          }
          isOpen={isOpen}
          className="plugin-dropdown"
          dropdownItems={dropdownItems}
        />
        <TextInput
          type="text"
          aria-label="text"
          className="plugin-input"
          onChange={this.handleInputChange}
          value={value}
        />
        <div className="close-icon">
          <CloseIcon onClick={this.deleteDropdown} />
        </div>
      </div>
    );
  }
}

export default SimpleDropdown;
