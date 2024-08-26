import {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
} from "@patternfly/react-core";
import { BarsIcon, GripVerticalIcon } from "../../Icons";
import { switchLibraryLayout } from "../../../store/cart/cartSlice";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "../../../store/hooks";

const LayoutSwitch = () => {
  const currentLayout = useTypedSelector((state) => state.cart.currentLayout);
  const dispatch = useDispatch();
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