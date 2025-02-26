// src/components/Store/utils/StoreSearchBar.tsx
import React from "react";
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";

// Type of fields the user can search by
type SearchField = "name" | "authors" | "category";

interface StoreSearchBarProps {
  // Environment (store) selection
  environment: string; // The currently selected environment name
  environmentOptions: Record<string, string>; // e.g. { 'PUBLIC CHRIS': '...', ... }
  onEnvChange: (env: string) => void;

  // Search
  initialSearchTerm: string;
  initialSearchField: SearchField;
  onChange: (searchTerm: string, searchField: SearchField) => void;
}

/**
 * This component houses:
 * - The environment (store) selection dropdown
 * - The search input + "filter by" dropdown
 * - All inside a PatternFly 5 Toolbar
 */
export const StoreSearchBar: React.FC<StoreSearchBarProps> = ({
  environment,
  environmentOptions,
  onEnvChange,
  initialSearchTerm,
  initialSearchField,
  onChange,
}) => {
  // Local states for user input
  const [searchTerm, setSearchTerm] = React.useState(initialSearchTerm);
  const [searchField, setSearchField] =
    React.useState<SearchField>(initialSearchField);

  // Manage environment dropdown open/close
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = React.useState(false);

  // Manage search-field dropdown open/close
  const [isSearchFieldOpen, setIsSearchFieldOpen] = React.useState(false);

  // Environment selection handler
  const handleSelectEnv = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number,
  ) => {
    if (typeof value === "string") {
      // Call back up to parent to set environment
      onEnvChange(value);
    }
    setIsEnvDropdownOpen(false);
  };

  // Build environment dropdown items
  const environmentDropdownItems = (
    <DropdownGroup label="Select Environment" labelHeadingLevel="h3">
      <DropdownList>
        {Object.keys(environmentOptions).map((envKey) => (
          <DropdownItem
            key={envKey}
            value={envKey}
            isSelected={envKey === environment}
          >
            {envKey}
          </DropdownItem>
        ))}
      </DropdownList>
    </DropdownGroup>
  );

  // Search field dropdown (name/authors/category)
  const handleSelectSearchField = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number,
  ) => {
    if (typeof value === "string") {
      setSearchField(value as SearchField);
    }
    setIsSearchFieldOpen(false);
  };

  const searchFieldDropdownItems = (
    <DropdownGroup label="Search By" labelHeadingLevel="h3">
      <DropdownList>
        {(["name", "category", "authors"] as SearchField[]).map((field) => (
          <DropdownItem
            key={field}
            value={field}
            isSelected={field === searchField}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </DropdownItem>
        ))}
      </DropdownList>
    </DropdownGroup>
  );

  // Whenever user changes searchTerm or searchField, call onChange
  React.useEffect(() => {
    onChange(searchTerm, searchField);
  }, [searchTerm, searchField, onChange]);

  return (
    <Toolbar
      data-testid="store-search-toolbar"
      style={{ marginBottom: "1rem" }}
    >
      <ToolbarContent>
        {/* Environment Selection Dropdown */}
        <ToolbarItem>
          <Dropdown
            isOpen={isEnvDropdownOpen}
            onSelect={handleSelectEnv}
            onOpenChange={(open) => setIsEnvDropdownOpen(open)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsEnvDropdownOpen(!isEnvDropdownOpen)}
                isExpanded={isEnvDropdownOpen}
              >
                {environment}
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            {environmentDropdownItems}
          </Dropdown>
        </ToolbarItem>

        {/* Search Field Dropdown (name / category / authors) */}
        <ToolbarItem>
          <Dropdown
            isOpen={isSearchFieldOpen}
            onSelect={handleSelectSearchField}
            onOpenChange={(open) => setIsSearchFieldOpen(open)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsSearchFieldOpen(!isSearchFieldOpen)}
                isExpanded={isSearchFieldOpen}
              >
                {`Filter By: ${searchField}`}
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            {searchFieldDropdownItems}
          </Dropdown>
        </ToolbarItem>

        {/* Search Input */}
        <ToolbarItem>
          <TextInputGroup style={{ width: "250px" }}>
            <TextInputGroupMain
              icon={<SearchIcon />}
              value={searchTerm}
              onChange={(_e, val) => setSearchTerm(val)}
              placeholder={`Search by ${searchField}...`}
            />
          </TextInputGroup>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
