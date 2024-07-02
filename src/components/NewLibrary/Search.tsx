import {
  Button,
  MenuToggle,
  SearchInput,
  SelectGroup,
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
import { useLocation, useNavigate } from "react-router";
import { CartIcon, SearchIcon } from "../Icons";
import { LibraryContext, Types } from "./context";

interface SearchProps {
  checked: boolean;
  handleChange: () => void;
  handleUploadModal: () => void;
}

const pacsFilters = [
  "PatientID",
  "PatientName",
  "PatientSex",
  "PatientAge",
  "StudyDate",
  "AccessionNumber",
  "ProtocolName",
  "StudyInstanceUID",
  "StudyDescription",
  "SeriesInstanceUID",
  "SeriesDescription",
  "pacs_identifier",
];

const Search = ({ checked, handleChange, handleUploadModal }: SearchProps) => {
  const { pathname } = useLocation();
  const decodedPath = decodeURIComponent(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { state, dispatch } = useContext(LibraryContext);
  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [error, setError] = useState("");

  const onInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleSearch = async () => {
    if (inputValue && decodedPath) {
      navigate(
        `/librarysearch?value=${
          inputValue as string
        }&&path=${decodedPath}&&filter=${selectedItem}`,
      );
    } else {
      if (!inputValue) {
        setError("Please provide a search term");
      }
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent | undefined, value: string) => {
    setSelectedItem(value);
    onToggleClick();
  };

  const spacer: {
    default?: "spacerLg";
  } = { default: "spacerLg" };

  const toggleGroupItems = (
    <React.Fragment>
      <ToolbarItem>
        {(decodedPath.startsWith("/library/SERVICES/") ||
          decodedPath === "/library/SERVICES") && (
          <Select
            isOpen={isOpen}
            ref={menuRef}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={onToggleClick}
                isExpanded={isOpen}
              >
                {selectedItem ? selectedItem : "Select PACS FILTERS"}
              </MenuToggle>
            )}
            // eslint-disable-next-line no-console
            onActionClick={(_event, value, actionId) =>
              console.log(`clicked on ${value} - ${actionId}`)
            }
            onSelect={(event, value) => {
              onSelect(event, value as string);
            }}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
          >
            <SelectGroup label="Actions">
              <SelectList>
                {pacsFilters.map((filter) => {
                  return (
                    <SelectOption
                      key={filter}
                      isSelected={selectedItem === filter}
                      description=""
                      value={filter}
                    >
                      {filter}
                    </SelectOption>
                  );
                })}
              </SelectList>
            </SelectGroup>
          </Select>
        )}
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
          <Button
            onClick={() => {
              dispatch({
                type: Types.SET_TOGGLE_CART,
              });
            }}
            variant="tertiary"
          >
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
