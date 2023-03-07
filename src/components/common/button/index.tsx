import React, { ReactNode } from "react";
import { Button, Tooltip, DrawerCloseButton } from "@patternfly/react-core";

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
