import { Button } from "@patternfly/react-core";
import { Badge } from "../Antd";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setToggleCart } from "../../store/cart/cartSlice";
import { useTypedSelector } from "../../store/hooks";
import { BrainIcon } from "../Icons";

const CartNotify = () => {
  const dispatch = useDispatch();
  const state = useTypedSelector((state) => state.cart);
  const {
    fileDownloadStatus,
    fileUploadStatus,
    folderDownloadStatus,
    folderUploadStatus,
  } = state;

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const showNotification = !isEmpty({
      ...fileDownloadStatus,
      ...fileUploadStatus,
      ...folderDownloadStatus,
      ...folderUploadStatus,
    });
    setShowNotification(showNotification);
  }, [
    fileDownloadStatus,
    folderDownloadStatus,
    fileUploadStatus,
    folderUploadStatus,
  ]);

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
