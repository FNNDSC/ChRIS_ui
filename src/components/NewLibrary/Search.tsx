import {
  Button,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from "@patternfly/react-core";
import { Alert } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { SearchIcon } from "../Icons";

interface SearchProps {
  checked: boolean;
  handleChange: () => void;
  handleUploadModal: () => void;
}

const Search = ({ checked, handleChange, handleUploadModal }: SearchProps) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [statusIsExpanded, setStatusIsExpanded] = useState(false);
  const [statusSelected, setStatusSelected] = useState("");

  const statusOptions = ["PACS Files", "User Files", "Feed Files"];

  const onInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const onStatusToggle = () => {
    setStatusIsExpanded(!statusIsExpanded);
  };

  const onStatusSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number,
  ) => {
    if (value) {
      setStatusSelected(value as string);
    }

    setStatusIsExpanded(false);
  };

  const handleSearch = async () => {
    if (inputValue && statusSelected) {
      navigate(
        `/librarysearch?value=${
          inputValue as string
        }&&search=${statusSelected}`,
      );
    } else {
      if (!inputValue) {
        setError("Please provide a search term");
      }
      if (!statusSelected) {
        setError("Please choose a space to search in");
      }
    }
  };

  const spacer: {
    default?: "spacerLg";
  } = { default: "spacerLg" };

  const toggleGroupItems = (
    <React.Fragment>
      <ToolbarItem variant="search-filter">
        <SearchInput
          aria-label="Component toggle groups example search input"
          onChange={(_event, value) => onInputChange(value)}
          value={inputValue}
          onClear={() => {
            onInputChange("");
          }}
          onKeyDown={(_event) => {
            if (_event.key === "Enter") {
              handleSearch();
            }
          }}
        />
      </ToolbarItem>
      <ToolbarGroup variant="filter-group">
        <ToolbarItem spacer={spacer}>
          <Select
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => onStatusToggle()}
                isExpanded={statusIsExpanded}
                style={
                  {
                    width: "300px",
                  } as React.CSSProperties
                }
              >
                {statusSelected || "Select a files space to search in"}
              </MenuToggle>
            )}
            onSelect={onStatusSelect}
            onOpenChange={(isOpen) => setStatusIsExpanded(isOpen)}
            selected={statusSelected}
            isOpen={statusIsExpanded}
          >
            <SelectList>
              {statusOptions.map((option, index) => (
                <SelectOption key={index} value={option}>
                  {option}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </ToolbarItem>

        <ToolbarItem spacer={spacer}>
          <Button onClick={handleUploadModal} variant="primary" size="sm">
            Upload Data
          </Button>
        </ToolbarItem>

        <ToolbarItem spacer={spacer}>
          <Switch
            label="Card Layout"
            labelOff="Tree Layout"
            isChecked={checked}
            onChange={handleChange}
            ouiaId="Switch Layouts"
          />
        </ToolbarItem>
      </ToolbarGroup>
    </React.Fragment>
  );

  const items = (
    <ToolbarToggleGroup
      toggleIcon={
        <SearchIcon
          style={{
            marginLeft: "1rem",
          }}
        />
      }
      breakpoint="xl"
    >
      {toggleGroupItems}
    </ToolbarToggleGroup>
  );

  return (
    <>
      <Toolbar id="search" className="pf-m-toggle-group-container">
        <ToolbarContent>{items}</ToolbarContent>
      </Toolbar>
      {error && <Alert type="error" message={error} closable />}
    </>
  );
};

export default Search;
