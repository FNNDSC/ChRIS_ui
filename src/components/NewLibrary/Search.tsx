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
import { Alert, Badge } from "antd";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { CartIcon, SearchIcon } from "../Icons";
import { LibraryContext } from "./context";

interface SearchProps {
  checked: boolean;
  handleChange: () => void;
  handleUploadModal: () => void;
  showOpen: () => void;
}

const Search = ({
  checked,
  handleChange,
  handleUploadModal,
  showOpen,
}: SearchProps) => {
  const navigate = useNavigate();
  const { state } = useContext(LibraryContext);
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
    </React.Fragment>
  );

  const items = (
    <>
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
      <ToolbarGroup variant="filter-group">
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
    </>
  );

  return (
    <>
      <Toolbar id="search" className="pf-m-toggle-group-container">
        <ToolbarContent>{items}</ToolbarContent>
      </Toolbar>
      <div
        style={{
          position: "absolute",
          right: "3rem",
          marginTop: "1rem",
        }}
      >
        <Badge
          style={{
            color: "white",
          }}
          color="blue"
          count={state.selectedPaths.length}
          offset={[10, 1]}
        >
          <Button onClick={showOpen} variant="tertiary">
            <CartIcon
              style={{
                height: "1.35em",
                width: "1.35em",
              }}
            />
          </Button>
        </Badge>
      </div>
      {error && <Alert type="error" message={error} closable />}
    </>
  );
};

export default Search;
