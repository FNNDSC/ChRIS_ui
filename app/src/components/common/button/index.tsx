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
import { TbArrowsMinimize } from "react-icons/tb";
import { setDrawerState } from "../../../store/drawer/actions";
import { MdMinimize } from "react-icons/md";

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
  maximized: boolean;
}

export const DrawerActionButton = ({
  handleClose,
  handleMaximize,
  handleMinimize,
  content,
  background,
  maximized,
}: DrawerActionTypes) => {
  const style = { color: "white" };
  return (
    <DrawerHead
      style={{
        background,
      }}
    >
      <DrawerActions>
        <ButtonWithTooltip
          style={{ zIndex: "999", padding: "0" }}
          variant="link"
          content={<span>{content}</span>}
          onClick={handleClose}
          icon={<MdMinimize style={style} />}
        />
        {maximized ? (
          <Button
            style={{
              paddingLeft: "0.5em",
              paddingRight: "0.5em",
              zIndex: "999",
            }}
            variant="link"
            icon={<TbArrowsMinimize style={style} />}
            onClick={handleMinimize}
          />
        ) : (
          <Button
            style={{ paddingLeft: "0.5em", paddingRight: "0.5em" }}
            onClick={handleMaximize}
            variant="link"
            icon={<CgMaximizeAlt style={style} />}
          />
        )}
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

export const handleClose = (actionType: string, dispatch: any) => {
  handleDrawerActions(
    actionType,
    false,
    false,
    false,
    dispatch,
    setDrawerState
  );
};

export const handleMaximize = (actionType: string, dispatch: any) => {
  handleDrawerActions(actionType, true, true, false, dispatch, setDrawerState);
};

export const handleMinimize = (actionType: string, dispatch: any) => {
  handleDrawerActions(actionType, true, false, true, dispatch, setDrawerState);
};

export const handleOpen = (actionType: string, dispatch: any) => {
  handleDrawerActions(actionType, true, false, false, dispatch, setDrawerState);
};

export const handleToggle = (
  actionType: string,
  drawerState: IDrawerState,
  dispatch: any
) => {
  handleDrawerActions(
    actionType,
    !drawerState[actionType].open,
    drawerState[actionType].maximized,
    false,
    dispatch,
    setDrawerState
  );
};
