import { Button } from "@patternfly/react-core";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { setToggleCart } from "../../store/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Badge } from "../Antd";
import { BrainIcon } from "../Icons";

const CartNotify = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.cart);
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
