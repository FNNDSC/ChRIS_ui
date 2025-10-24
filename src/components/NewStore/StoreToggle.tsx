import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from "@patternfly/react-core";
import type React from "react";
import { useState } from "react";
import { envOptions } from "./hooks/useFetchPlugins";

interface StoreToggleProps {
  onEnvironmentChange?: (url: string) => void;
}

const StoreToggle: React.FC<StoreToggleProps> = ({ onEnvironmentChange }) => {
  const [environment, setEnvironment] = useState<string>("PUBLIC ChRIS");
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState<boolean>(false);

  const handleSelectEnv = (
    _event?: React.MouseEvent<Element, MouseEvent>,
    value?: string | number,
  ) => {
    if (typeof value === "string") {
      setEnvironment(value);
      onEnvironmentChange?.(value);
    }
    setIsEnvDropdownOpen(false);
  };

  const environmentDropdownItems = (
    <DropdownGroup label="Select Environment" labelHeadingLevel="h3">
      <DropdownList>
        {Object.keys(envOptions).map((envKey) => (
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

  return (
    <Dropdown
      isOpen={isEnvDropdownOpen}
      onSelect={handleSelectEnv}
      onOpenChange={(open) => setIsEnvDropdownOpen(open)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef as React.Ref<HTMLButtonElement>}
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
  );
};

export default StoreToggle;
