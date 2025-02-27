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
  Button,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { Spin } from "antd";
import { DotsIndicator } from "../Common";

type SearchField = "name" | "authors" | "category";

interface StoreSearchBarProps {
  // Environment
  environment: string;
  environmentOptions: Record<string, string>;
  onEnvChange: (env: string) => void;

  // Search
  initialSearchTerm: string;
  initialSearchField: SearchField;
  onChange: (searchTerm: string, searchField: SearchField) => void;

  // Bulk install
  canBulkInstall: boolean;
  onBulkInstall: () => void;
  isBulkInstalling: boolean;
  bulkProgress: number;

  // NEW: number of selected plugins
  selectedCount: number;
}

export const StoreSearchBar: React.FC<StoreSearchBarProps> = ({
  environment,
  environmentOptions,
  onEnvChange,
  initialSearchTerm,
  initialSearchField,
  onChange,
  canBulkInstall,
  onBulkInstall,
  isBulkInstalling,
  bulkProgress,
  selectedCount,
}) => {
  const [searchTerm, setSearchTerm] = React.useState(initialSearchTerm);
  const [searchField, setSearchField] =
    React.useState<SearchField>(initialSearchField);

  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = React.useState(false);
  const [isSearchFieldOpen, setIsSearchFieldOpen] = React.useState(false);

  const handleSelectEnv = (
    _ev: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number,
  ) => {
    if (typeof value === "string") {
      onEnvChange(value);
    }
    setIsEnvDropdownOpen(false);
  };

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

  const handleSelectSearchField = (
    _ev: React.MouseEvent<Element, MouseEvent> | undefined,
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
        {(["name", "authors", "category"] as SearchField[]).map((field) => (
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

  // Pass updated search info to parent
  React.useEffect(() => {
    onChange(searchTerm, searchField);
  }, [searchTerm, searchField, onChange]);

  // We'll build the button label. If user selected some,
  // show "Install All (X)" where X = selectedCount
  let installAllLabel = "Install All";
  if (selectedCount > 1) {
    installAllLabel = `Install All (${selectedCount})`;
  } else if (selectedCount === 1) {
    // Optional: maybe show the single selected plugin is 'Install All (1)'
    installAllLabel = "Install All (1)";
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "#fff",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Toolbar data-testid="store-search-toolbar">
        <ToolbarContent>
          {/* Environment Dropdown */}
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

          {/* Search Field Dropdown */}
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
                onChange={(_event, val) => setSearchTerm(val)}
                placeholder={`Search by ${searchField}...`}
              />
            </TextInputGroup>
          </ToolbarItem>

          {/* "Install All" Button (shown only if canBulkInstall) */}
          {canBulkInstall && (
            <ToolbarItem>
              <Button
                variant="secondary"
                onClick={onBulkInstall}
                icon={
                  isBulkInstalling ? (
                    <Spin size="small" style={{ marginRight: 4 }} />
                  ) : undefined
                }
                isDisabled={isBulkInstalling}
              >
                {isBulkInstalling
                  ? `Installing ${bulkProgress}%...`
                  : installAllLabel}
              </Button>
            </ToolbarItem>
          )}

          {/* Optional spinner indicator */}
          {isBulkInstalling && (
            <ToolbarItem>
              <DotsIndicator title={`${bulkProgress}%`} />
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>
    </div>
  );
};
