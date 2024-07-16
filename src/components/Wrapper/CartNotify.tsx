import { Badge } from "antd";
import { isEmpty } from "lodash";
import { useTypedSelector } from "../../store/hooks";
import { CartIcon } from "../Icons";
import { useDispatch } from "react-redux";
import { setToggleCart } from "../../store/cart/actionts";
import { Button } from "@patternfly/react-core";

const CartNotify = () => {
  const dispatch = useDispatch();
  const state = useTypedSelector((state) => state.cart);
  const { selectedPaths } = state;
  return (
    <Badge dot={!isEmpty(selectedPaths)}>
      <Button
        variant="tertiary"
        icon={<CartIcon />}
        onClick={() => dispatch(setToggleCart())}
      />
    </Badge>
  );
};

export default CartNotify;
