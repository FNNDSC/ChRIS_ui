import React from "react";
import {
  Select,
  SelectOption,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";
import type { ComputeResource } from "@fnndsc/chrisapi";

interface ComputeResourceSelectProps {
  resourceOptions: ComputeResource[];
  selected?: ComputeResource;
  onChange: (value: ComputeResource) => void;
}

const ComputeResourceSelect: React.FC<ComputeResourceSelectProps> = ({
  resourceOptions,
  selected,
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Otherwise, show the PatternFly Select if logged in
  const toggle = (toggleRef: React.RefObject<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen((prev) => !prev)}
      isExpanded={isOpen}
    >
      {selected?.data.name || "Select a resource"}
    </MenuToggle>
  );

  const handleSelect = (
    _e: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: ComputeResource | number | string,
  ) => {
    onChange(value as ComputeResource);
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
        appendTo: () => document.body,
      }}
    >
      {resourceOptions.map((resource) => (
        <SelectOption
          key={resource.data.id}
          value={resource}
          isSelected={resource.data.id === selected?.data.id}
        >
          {resource.data.name}
        </SelectOption>
      ))}
    </Select>
  );
};

export default ComputeResourceSelect;
