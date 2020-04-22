import React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  TextInput,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import { CloseIcon } from "@patternfly/react-icons";
import { SimpleDropdownProps, SimpleDropdownState } from "./types";
import { unPackForKeyValue } from "./lib/utils";

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
    this.onSelect = this.onSelect.bind(this);
    this.onToggle = this.onToggle.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.deleteDropdown = this.deleteDropdown.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }
  componentDidMount() {
    const { dropdownInput, id } = this.props;

    //Setting dropdown
    if (id in dropdownInput) {
      const [flag, value] = unPackForKeyValue(dropdownInput[id]);
      this.setState({
        flag,
        value,
      });
    }
  }

  onToggle(isOpen: boolean) {
    this.setState({
      isOpen,
    });
  }
  onSelect(event?: React.SyntheticEvent<HTMLDivElement>): void {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  handleClick(event: any) {
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
  }

  deleteDropdown() {
    const { id, deleteInput, deleteComponent } = this.props;
    deleteInput(id);
    deleteComponent(id);
  }

  handleInputChange(value: string) {
    const { handleChange, id } = this.props;
    this.setState(
      {
        value,
      },

      () => {
        handleChange(id, this.state.flag, this.state.value, false);
      }
    );
  }

  render() {
    const { isOpen, value, flag, placeholder } = this.state;
    const { params } = this.props;

    if (!params) {
      return;
    }
    const dropdownItems = params
      .filter((param) => param.data.optional === true)
      .map((param) => {
        const id = param.data.id;
        return (
          <DropdownItem
            key={id}
            onClick={this.handleClick}
            component="button"
            className="plugin-configuration__parameter"
            value={param.data.name}
            name={param.data.help}
          >
            {param.data.name}
          </DropdownItem>
        );
      });

    return (
      <div className="plugin-configuration">
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
          className="plugin-configuration__dropdown"
          dropdownItems={dropdownItems.length > 0 ? dropdownItems : []}
        />
        <TextInput
          type="text"
          aria-label="text"
          className="plugin-configuration__input"
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
