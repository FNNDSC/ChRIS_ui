import {
  NotificationBadge,
  NotificationBadgeVariant,
} from "@patternfly/react-core";
import { useContext } from "react";
import { LibraryContext, Types } from "../LibraryCopy/context";
import { Badge } from "antd";

const NotificationComponent = () => {
  const { state, dispatch } = useContext(LibraryContext);
  let notificationType = NotificationBadgeVariant.unread;

  if (state.openCart) {
    notificationType = NotificationBadgeVariant.read;
  }

  return (
    <Badge>
      <NotificationBadge
        variant={notificationType}
        aria-label="Library Operations"
        onClick={() => {
          dispatch({
            type: Types.SET_TOGGLE_CART,
          });
        }}
      />
    </Badge>
  );
};

export default NotificationComponent;
