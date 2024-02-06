import {
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import React, { useState } from "react";

export type FeedTreeScaleType = "time" | "size";

interface NodeScaleDropdownProps {
  selected: FeedTreeScaleType;
  onChange: (type: FeedTreeScaleType) => void;
}

export const NodeScaleDropdown = ({
  selected,
  onChange,
}: NodeScaleDropdownProps) => {
  const [open, setOpen] = useState(false);

  // TODO: enable output size
  const labels: Map<FeedTreeScaleType, string> = new Map([
    ["time", "Compute Time"],
    ["size", "Output Size"],
  ]);

  const onToggle = () => setOpen(!open);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={open}
      style={
        {
          width: "200px",
        } as React.CSSProperties
      }
    >
      {selected}
    </MenuToggle>
  );

  return (
    <Select
      aria-label="Select Input with descriptions"
      isOpen={open}
      onSelect={(_: any, label: any) => {
        const type = Array.from(labels.keys()).find(
          (type) => labels.get(type) == label,
        );
        if (type) {
          onChange(type);
        }
        setOpen(false);
      }}
      toggle={toggle}
      onOpenChange={onToggle}
      selected={labels.get(selected)}
    >
      <SelectList>
        <SelectOption key="time" value={labels.get("time")} />
        <SelectOption key="size" value={labels.get("size")} disabled />
      </SelectList>
    </Select>
  );
};
