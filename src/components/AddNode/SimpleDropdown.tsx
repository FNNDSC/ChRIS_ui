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
  placeholder: string;
}

interface SimpleDropdownProps {
  params?: PluginParameter[];
  toggle?: React.ReactElement<any>;
  onSelect?: (event: React.SyntheticEvent<HTMLDivElement>) => void;
  isOpen?: boolean;
  dropdownItems?: any[];
  id: number;
  handleChange(id: number, paramName: string, value: string): void;
  deleteComponent(id:number): void;
  deleteInput(id:number): void;
  userInput: {
    [key: number]: {
      [key: string]: string;
    };
  };
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
      placeholder: ""
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

  componentDidMount() {
    const { userInput, id } = this.props;
    if (userInput[id]) {
      const flag = Object.keys(userInput[id])[0];
      const value = userInput[id][flag];
      this.setState({
        flag,
        value
      });
    }
  }

  handleClick = (event: any) => {
    event.persist();
    const { handleChange, id } = this.props;

    this.setState(
      prevState => {
        return {
          flag: event.target.value,
          placeholder: event.target.name
        };
      },
      () => {
        handleChange(id, this.state.flag, this.state.value);
      }
    );
  };

  deleteDropdown = () => {
    const { id, deleteInput, deleteComponent } = this.props;
    const { flag } = this.state;

    deleteInput(id);
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
    const { isOpen, value, flag, placeholder } = this.state;
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
          name={param.data.help}
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
          placeholder={placeholder}
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
