import React from "react";
import {
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectOption,
} from "@patternfly/react-core";
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

  const onToggleClick = (event: React.MouseEvent<MenuToggleElement>) => {
    // Stop event propagation so the card's onClick won't fire.
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number | Plugin,
  ) => {
    // Also stop propagation when selecting an item
    event?.stopPropagation();

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
      popperProps={{
        appendTo: () => document.body,
      }}
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
