import { Badge } from "antd";
import { isEmpty } from "lodash";
import { useTypedSelector } from "../../store/hooks";
import { BrainIcon } from "../Icons";
import { useDispatch } from "react-redux";
import { setToggleCart } from "../../store/cart/actions";
import { Button } from "@patternfly/react-core";

const CartNotify = () => {
  const dispatch = useDispatch();
  const state = useTypedSelector((state) => state.cart);
  const {
    fileDownloadStatus,
    fileUploadStatus,
    folderDownloadStatus,
    folderUploadStatus,
  } = state;

  const showNotification = !isEmpty({
    ...fileDownloadStatus,
    ...fileUploadStatus,
    ...folderDownloadStatus,
    ...folderUploadStatus,
  });

  return (
    <Badge dot={showNotification}>
      <Button
        variant="tertiary"
        icon={<BrainIcon />}
        onClick={() => dispatch(setToggleCart())}
      />
    </Badge>
  );
};

export default CartNotify;
