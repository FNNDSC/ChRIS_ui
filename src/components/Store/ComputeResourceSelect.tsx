import React from "react";
import {
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";
import { message } from "antd";
import type { ComputeResource } from "@fnndsc/chrisapi";

interface ComputeResourceSelectProps {
  // Full list of resources to display
  resourceOptions: ComputeResource[];
  // Currently selected resources (array)
  selectedList: ComputeResource[];
  // Callback whenever user changes selection
  onChange: (values: ComputeResource[]) => void;
}

const ComputeResourceSelect: React.FC<ComputeResourceSelectProps> = ({
  resourceOptions,
  selectedList,
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // The toggle for PatternFly’s popper
  const toggle = (toggleRef: React.RefObject<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }}
      isExpanded={isOpen}
    >
      {/* Display comma-separated resource names or fallback text */}
      {selectedList.length
        ? selectedList.map((r) => r.data.name).join(", ")
        : ""}
    </MenuToggle>
  );

  // Handle selecting/deselecting each resource
  const handleSelect = (
    _e: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number | ComputeResource,
  ) => {
    if (!value) return;
    const resource = value as ComputeResource;

    const alreadySelected = selectedList.some(
      (sel) => sel.data.id === resource.data.id,
    );

    if (alreadySelected) {
      // Deselect resource
      const newSelected = selectedList.filter(
        (sel) => sel.data.id !== resource.data.id,
      );

      // Prevent removing the last resource
      if (newSelected.length === 0) {
        message.error("At least one resource must remain selected.");
        return;
      }

      onChange(newSelected);
    } else {
      onChange([...selectedList, resource]);
    }
  };

  const onOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
  };

  return (
    <Select
      id="compute-resource-select"
      role="menu"
      isOpen={isOpen}
      selected={selectedList}
      onSelect={handleSelect}
      onOpenChange={onOpenChange}
      toggle={toggle}
      popperProps={{ appendTo: () => document.body }}
    >
      <SelectList>
        {resourceOptions.map((resource) => {
          const isChecked = selectedList.some(
            (sel) => sel.data.id === resource.data.id,
          );
          return (
            <SelectOption
              key={resource.data.id}
              hasCheckbox
              value={resource}
              isSelected={isChecked}
            >
              {resource.data.name}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};

export default ComputeResourceSelect;
