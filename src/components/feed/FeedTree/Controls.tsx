import { Select, SelectOption, SelectVariant } from "@patternfly/react-core";
import React, { useState } from "react";

export type FeedTreeScaleType = 'time' | 'size';

interface NodeScaleDropdownProps {
  selected: FeedTreeScaleType;
  onChange: (type: FeedTreeScaleType) => void;
}

export const NodeScaleDropdown = ({ selected, onChange }: NodeScaleDropdownProps) => {
  const [open, setOpen] = useState(false);

  // TODO: enable output size
  const labels: Map<FeedTreeScaleType, string> = new Map([
    ['time', 'Compute Time'],
    ['size', 'Output Size']
  ]);

  return (
    <Select
      variant={SelectVariant.single}
      placeholderText="Select an option"
      aria-label="Select Input with descriptions"
      onToggle={isOpen => setOpen(isOpen)}
      isOpen={open}
      onSelect={(_, label) => {
        const type = Array.from(labels.keys()).find(type => labels.get(type) == label);
        if (type) {
          onChange(type);
        }
        setOpen(false);
      }}
      selections={labels.get(selected)}
    >
      <SelectOption
        key="time"
        value={labels.get('time')}
      />
      <SelectOption
        key="size"
        value={labels.get('size')}
        disabled
      />
    </Select>
  )
}