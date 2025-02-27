import React from "react";
import {
  Select,
  SelectOption,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";

interface ComputeResourceSelectProps {
  resourceOptions: string[];
  selected: string;
  onChange: (value: string) => void;
}

const ComputeResourceSelect: React.FC<ComputeResourceSelectProps> = ({
  resourceOptions,
  selected,
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = (toggleRef: React.RefObject<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
    >
      {selected}
    </MenuToggle>
  );

  const handleSelect = (
    _e: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number,
  ) => {
    if (typeof value === "string") {
      onChange(value);
    }
    setIsOpen(false);
  };

  return (
    <Select
      isOpen={isOpen}
      selected={selected}
      onSelect={handleSelect}
      onOpenChange={(open) => setIsOpen(open)}
      toggle={toggle}
      popperProps={{
        // append to body so it won’t be clipped by the card
        appendTo: () => document.body,
      }}
    >
      {resourceOptions.map((r) => (
        <SelectOption key={r} value={r} isSelected={r === selected}>
          {r}
        </SelectOption>
      ))}
    </Select>
  );
};

export default ComputeResourceSelect;
