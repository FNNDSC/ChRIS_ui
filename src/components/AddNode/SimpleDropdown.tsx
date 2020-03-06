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
}

interface SimpleDropdownProps {
  params?: PluginParameter[];
  toggle?: React.ReactElement<any>;
  onSelect?: (event: React.SyntheticEvent<HTMLDivElement>) => void;
  isOpen?: boolean;
  dropdownItems?: any[];
  key?: number;
}

class SimpleDropdown extends React.Component<
  SimpleDropdownProps,
  SimpleDropdownState
> {
  constructor(props: SimpleDropdownProps) {
    super(props);
    this.state = {
      isOpen: false
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

  render() {
    const { isOpen } = this.state;
    const { params } = this.props;

    if (!params) {
      return;
    }
    const dropdownItems = params.map(param => {
      return (
        <DropdownItem key={param.data.id} component="button">
          {param.data.flag}
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
              Choose a Parameter
            </DropdownToggle>
          }
          isOpen={isOpen}
          className="plugin-dropdown"
          dropdownItems={dropdownItems}
        />
        <TextInput type="text" aria-label="text" className="plugin-input" />
        <CloseIcon />
      </div>
    );
  }
}

export default SimpleDropdown;
