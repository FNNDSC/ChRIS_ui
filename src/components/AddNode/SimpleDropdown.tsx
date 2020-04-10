import React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  TextInput,
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
  id: string;
  handleChange(
    id: string,
    paramName: string,
    value: string,
    required: boolean
  ): void;
  deleteComponent(id: string): void;
  deleteInput(id: string): void;
  dropdownInput: {
    [key: string]: {
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
      placeholder: "",
    };
  }
  onToggle = (isOpen: boolean) => {
    this.setState({
      isOpen,
    });
  };
  onSelect = (event?: React.SyntheticEvent<HTMLDivElement>): void => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  componentDidMount() {
    const { dropdownInput, id } = this.props;

    if (id in dropdownInput) {
      const flag = Object.keys(dropdownInput[id])[0];
      const value = dropdownInput[id][flag];
      this.setState({
        flag,
        value,
      });
    }
  }

  handleClick = (event: any) => {
    event.persist();
    const { handleChange, id } = this.props;

    this.setState(
      (prevState) => {
        return {
          flag: event.target.value,
          placeholder: event.target.name,
        };
      },
      () => {
        handleChange(id, this.state.flag, this.state.value, false);
      }
    );
  };

  deleteDropdown = () => {
    const { id, deleteInput, deleteComponent } = this.props;

    deleteInput(id);
    deleteComponent(id);
  };

  handleInputChange = (value: string) => {
    const { handleChange, id } = this.props;
    this.setState(
      {
        value,
      },

      () => {
        handleChange(id, this.state.flag, this.state.value, false);
      }
    );
  };

  render() {
    const { isOpen, value, flag, placeholder } = this.state;
    const { params } = this.props;

    if (!params) {
      return;
    }
    const dropdownItems = params.map((param) => {
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
