import {
  getRootID,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import type { ReactNode } from "react";
import type * as DoDrawer from "../../reducers/drawer";
import type { ActionType } from "../../reducers/drawer";
import { ButtonWithTooltip } from "../Feeds/DrawerUtils";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;

type Props = {
  actionType: ActionType;
  icon: ReactNode;
  title: string;
  isDisabled: boolean;

  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
};

export default (props: Props) => {
  const { actionType, icon, title, isDisabled, useDrawer } = props;
  const [classStateDrawer, doDrawer] = useDrawer;
  const drawerID = getRootID(classStateDrawer);
  return (
    <ButtonWithTooltip
      position="bottom"
      className="button-style large-button"
      content={<span>{title}</span>}
      Icon={icon}
      variant="primary"
      onClick={() => {
        doDrawer.toggle(drawerID, actionType);
      }}
      isDisabled={isDisabled}
    />
  );
};
