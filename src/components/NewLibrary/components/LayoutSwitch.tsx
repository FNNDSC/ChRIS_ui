import {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
} from "@patternfly/react-core";
import { switchLibraryLayout } from "../../../store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { BarsIcon, GripVerticalIcon } from "../../Icons";

const LayoutSwitch = () => {
  const currentLayout = useAppSelector((state) => state.cart.currentLayout);
  const dispatch = useAppDispatch();
  const handleChange: ToggleGroupItemProps["onChange"] = (event) => {
    dispatch(switchLibraryLayout(event.currentTarget.id));
  };
  return (
    <ToggleGroup>
      <ToggleGroupItem
        aria-label="switch to a list layout"
        icon={<BarsIcon />}
        buttonId="list"
        onChange={handleChange}
        isSelected={currentLayout === "list"}
      />
      <ToggleGroupItem
        aria-label="switch to a grid layout"
        buttonId="grid"
        icon={<GripVerticalIcon />}
        onChange={handleChange}
        isSelected={currentLayout === "grid"}
      />
    </ToggleGroup>
  );
};

export default LayoutSwitch;
