import { useContext } from "react";
import { LibraryContext, Types } from "../LibraryCopy/context";
import { Badge } from "antd";
import { Button } from "@patternfly/react-core";
import { CartIcon } from "../Icons";

const NotificationComponent = () => {
  const { state, dispatch } = useContext(LibraryContext);

  return (
    <Badge
      style={{
        color: "white",
      }}
      color="blue"
      count={state.selectedPaths.length}
      offset={[10, 1]}
    >
      <Button
        onClick={() => {
          dispatch({
            type: Types.SET_TOGGLE_CART,
          });
        }}
        variant="tertiary"
      >
        <CartIcon
          style={{
            height: "1.35em",
            width: "1.35em",
          }}
        />
      </Button>
    </Badge>
  );
};

export default NotificationComponent;
