import React, { ReactNode } from "react";
import {
  Button,
  Tooltip,
  DrawerCloseButton,
  DrawerHead,
  DrawerActions,
} from "@patternfly/react-core";
import { CgMaximizeAlt } from "react-icons/cg";
import { DrawerPayloadType, IDrawerState } from "../../../store/drawer/types";
import { MdMinimize } from "react-icons/md";
import { setDrawerState } from "../../../store/drawer/actions";

interface ButtonProps {
  variant: any;
  content?: any;
  icon?: ReactNode;
  position?: any;
  description?: string;
  onClick: any;
  className?: any;
  style?: any;
}

export const ButtonWithTooltip = ({
  variant,
  content,
  icon,
  position,
  description,
  className,
  style,
  onClick,
}: ButtonProps) => {
  return (
    <Tooltip position={position} content={content}>
      <Button
        style={style}
        className={className}
        onClick={onClick}
        variant={variant}
        icon={icon}
      >
        {description}
      </Button>
    </Tooltip>
  );
};

interface DrawerCloseButtonProps {
  onClick: any;
  content: any;
}

export const DrawerCloseButtonWithTooltip = ({
  onClick,
  content,
}: DrawerCloseButtonProps) => {
  return (
    <Tooltip position="bottom" content={content}>
      <DrawerCloseButton onClick={onClick} />
    </Tooltip>
  );
};

interface DrawerActionTypes {
  handleClose: () => void;
  handleMaximize: () => void;
  handleMinimize: () => void;
  content: string;
  background: string;
}

export const DrawerActionButton = ({
  handleClose,
  handleMaximize,
  handleMinimize,
  content,
  background,
}: DrawerActionTypes) => {
  return (
    <DrawerHead
      style={{
        background,
      }}
    >
      <DrawerActions>
        <Button
          style={{ paddingRight: "0px" }}
          variant="link"
          icon={<MdMinimize style={{ color: "white" }} />}
          onClick={handleMinimize}
        />
        <Button
          style={{ paddingRight: "0px" }}
          onClick={handleMaximize}
          variant="link"
          icon={<CgMaximizeAlt style={{ color: "white" }} />}
        />
        <DrawerCloseButtonWithTooltip
          content={<span>{content}</span>}
          onClick={handleClose}
        />
      </DrawerActions>
    </DrawerHead>
  );
};

export const handleDrawerActions = (
  actionType: string,
  open: boolean,
  maximized: boolean,
  minimized: boolean,
  dispatch: any,
  action: (action: DrawerPayloadType) => void
) => {
  dispatch(
    action({
      actionType,
      open,
      maximized,
      minimized,
    })
  );
};

export const handleClose = (
  actionType: string,
  drawerState: IDrawerState,
  dispatch: any
) => {
  handleDrawerActions(
    actionType,
    false,
    false,
    false,
    dispatch,
    setDrawerState
  );
};

export const handleMaximize = (
  actionType: string,
  drawerState: IDrawerState,
  dispatch: any
) => {
  handleDrawerActions(actionType, true, true, false, dispatch, setDrawerState);
};

export const handleMinimize = (
  actionType: string,
  drawerState: IDrawerState,
  dispatch: any
) => {
  handleDrawerActions(actionType, false, false, true, dispatch, setDrawerState);
};
