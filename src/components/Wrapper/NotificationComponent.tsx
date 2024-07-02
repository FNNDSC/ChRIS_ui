import {
  NotificationBadge,
  NotificationBadgeVariant,
} from "@patternfly/react-core";
import { useContext } from "react";
import { LibraryContext, Types } from "../NewLibrary/context";
import { Badge } from "antd";
import { isEmpty } from "lodash";

const NotificationComponent = () => {
  const { state, dispatch } = useContext(LibraryContext);
  const { fileDownloadStatus, folderDownloadStatus } = state;
  let notificationType = NotificationBadgeVariant.unread;

  if (state.openCart) {
    notificationType = NotificationBadgeVariant.read;
  }

  return (
    <Badge dot={!isEmpty(fileDownloadStatus) || !isEmpty(folderDownloadStatus)}>
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
