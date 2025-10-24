import { Niivue } from "@niivue/niivue";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from "@patternfly/react-core";
import React from "react";

const _NIIVUE = new Niivue();
const NIIVUE_COLORMAPS = _NIIVUE.colormaps();

type ColormapDropdownProps = {
  selectedColormap: string;
  onSelect: (colormap: string) => void;
};

/**
 * A dropdown menu for selecting colormap names supported by Niivue.
 */
const ColormapDropdown: React.FC<ColormapDropdownProps> = ({
  selectedColormap,
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
    if (typeof value === "string") {
      onSelect(value);
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
          {selectedColormap}
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
        {NIIVUE_COLORMAPS.map((colormapName) => (
          <DropdownItem value={colormapName} key={colormapName}>
            {colormapName}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export default ColormapDropdown;
