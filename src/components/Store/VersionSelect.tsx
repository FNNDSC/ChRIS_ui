import {
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectOption,
} from "@patternfly/react-core";
// components/VersionSelect.tsx
import React from "react";
import type { Plugin } from "./utils/types";

interface VersionSelectProps {
  plugins: Plugin[];
  currentVersion: string;
  handlePluginVersion: (value: Plugin) => void;
}

export const VersionSelect: React.FC<VersionSelectProps> = ({
  plugins,
  currentVersion,
  handlePluginVersion,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number | Plugin,
  ) => {
    if (value) {
      handlePluginVersion(value as Plugin);
    }
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={{ width: "200px" }}
    >
      {currentVersion}
    </MenuToggle>
  );

  return (
    <Select
      id="version-select"
      isOpen={isOpen}
      selected={currentVersion}
      onSelect={onSelect}
      onOpenChange={(open) => setIsOpen(open)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      {plugins.map((plugin) => (
        <SelectOption
          isSelected={currentVersion === plugin.version}
          key={plugin.version}
          value={plugin}
        >
          {plugin.version}
        </SelectOption>
      ))}
    </Select>
  );
};
