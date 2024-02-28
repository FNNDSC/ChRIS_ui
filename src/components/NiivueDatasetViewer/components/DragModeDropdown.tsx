import React from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { DRAG_MODE } from "@niivue/niivue";

/**
 * Names shown in the dropdown list.
 */
const LIST_NAMES: [DRAG_MODE, string][] = [
  [DRAG_MODE.none, "None"],
  [DRAG_MODE.measurement, "Measurement tool"],
  [DRAG_MODE.contrast, "Adjust contrast"],
  [DRAG_MODE.pan, "Pan view"],
];

/**
 * (Shorter) name shown for selected mode.
 */
const SELECTED_NAMES: Map<DRAG_MODE, string> = new Map([
  [DRAG_MODE.none, "None"],
  [DRAG_MODE.measurement, "Measure"],
  [DRAG_MODE.contrast, "Contrast"],
  [DRAG_MODE.pan, "Pan view"],
]);

type DragModeDropdownProps = {
  selectedMode: DRAG_MODE;
  onSelect: (dragMode: DRAG_MODE) => void;
};

/**
 * A dropdown menu for selecting (right-click) drag modes supported by Niivue.
 */
const DragModeDropdown: React.FC<DragModeDropdownProps> = ({
  selectedMode,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

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
    if (typeof value === "number") {
      return onSelect(value);
    } else {
      throw new Error("unreachable code");
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
          {SELECTED_NAMES.get(selectedMode)}
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
        {LIST_NAMES.map(([dragMode, name]) => (
          <DropdownItem value={dragMode} key={dragMode}>
            {name}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export default DragModeDropdown;
