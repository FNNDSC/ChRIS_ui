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
  environment: string;
  environmentOptions: Record<string, string>;
  onEnvChange: (env: string) => void;
  initialSearchTerm: string;
  initialSearchField: SearchField;
  onChange: (searchTerm: string, searchField: SearchField) => void;
  canBulkInstall?: boolean;
  onBulkInstall: () => void;
  isBulkInstalling: boolean;
  bulkProgress: number;
  selectedCount: number;
  fetchedCount: number;
  isLoggedIn?: boolean;
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
  fetchedCount,
  isLoggedIn,
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

  React.useEffect(() => {
    onChange(searchTerm, searchField);
  }, [searchTerm, searchField, onChange]);

  // If user selected some plugins, show that number
  // Otherwise, show the number of search results
  const installCount = selectedCount > 0 ? selectedCount : fetchedCount;

  let installAllLabel = "Install All";
  if (installCount === 1) {
    installAllLabel = "Install All (1)";
  } else if (installCount > 1) {
    installAllLabel = `Install All (${installCount})`;
  }

  const showInstallAll = isLoggedIn && canBulkInstall;

  return (
    <Toolbar data-testid="store-search-toolbar" isSticky={true}>
      <ToolbarContent>
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

        <ToolbarItem>
          <TextInputGroup>
            <TextInputGroupMain
              icon={<SearchIcon />}
              value={searchTerm}
              onChange={(_event, val) => setSearchTerm(val)}
              placeholder={`Search by ${searchField}...`}
            />
          </TextInputGroup>
        </ToolbarItem>

        {showInstallAll && (
          <ToolbarItem>
            <Button
              variant="primary"
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

        {isBulkInstalling && (
          <ToolbarItem>
            <DotsIndicator title={`${bulkProgress}%`} />
          </ToolbarItem>
        )}

        <ToolbarItem align={{ default: "alignRight" }}>
          Total Plugins: {fetchedCount}
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
