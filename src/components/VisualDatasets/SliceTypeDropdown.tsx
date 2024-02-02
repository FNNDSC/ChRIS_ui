import React from "react";
import { Dropdown, DropdownItem, DropdownList, MenuToggle, MenuToggleElement } from "@patternfly/react-core";
import { SLICE_TYPE } from "@niivue/niivue";

const SLICE_NAMES: { [key: string]: [SLICE_TYPE, boolean]} = {
  "Axial": [SLICE_TYPE.AXIAL, false],
  "Coronal": [SLICE_TYPE.CORONAL, false],
  "Sagittal": [SLICE_TYPE.SAGITTAL, false],
  "3D render": [SLICE_TYPE.RENDER, false],
  "A+C+S": [SLICE_TYPE.MULTIPLANAR, false],
  "A+C+S+3D": [SLICE_TYPE.MULTIPLANAR, true]
};

type SliceTypeDropdownProps = {
  selectedSliceType: [SLICE_TYPE, boolean];
  onSelect: (sliceType: SLICE_TYPE, multiplanarForceRender: boolean) => void;
};

/**
 * A dropdown menu for selecting slice types supported by Niivue.
 */
const SliceTypeDropdown: React.FC<SliceTypeDropdownProps> = ({ selectedSliceType, onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selected = Object.entries(SLICE_NAMES)
    .find(([_name, [sliceType, multiplanarForceRender]]) => sliceType === selectedSliceType[0] && multiplanarForceRender === selectedSliceType[1]);
  const selectedName = selected ? selected[0] : 'unknown';

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onDropdownSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    setIsOpen(false);
    if (value === undefined) {
      return;
    }
    if (typeof value === 'string') {
      const [sliceType, multiplanarForceRender] = SLICE_NAMES[value];
      return onSelect(sliceType, multiplanarForceRender);
    } else {
      throw new Error('unreachable code');
    }
  };

  return (
    <Dropdown
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          isFullWidth
        >
          {selectedName}
        </MenuToggle>
      )}
      onSelect={onDropdownSelect}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      isOpen={isOpen}
      ouiaId="BasicDropdown"
      shouldFocusToggleOnSelect
      isScrollable
    >
      <DropdownList>
        {Object.keys(SLICE_NAMES).map((name) => (
          <DropdownItem value={name} key={name}>
            {name}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export default SliceTypeDropdown;
