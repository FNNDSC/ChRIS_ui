import {
  Button,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  Tooltip,
} from "@patternfly/react-core";
import type { ReactNode } from "react";
import { CompressArrowsAltIcon, ExpandArrowsAltIcon } from "../Icons";

interface ButtonProps {
  variant?: any;
  content?: any;
  Icon?: ReactNode;
  position?: any;
  description?: string;
  onClick: any;
  className?: any;
  style?: any;
  isDisabled: boolean;
}

export const ButtonWithTooltip = ({
  content,
  position,
  description,
  className,
  onClick,
  isDisabled,
  Icon,
}: ButtonProps) => {
  return (
    <Tooltip position={position} content={content}>
      <Button
        className={className}
        onClick={onClick}
        variant={isDisabled ? "primary" : "control"}
        icon={Icon}
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
  onMaximize: () => void;
  onMinimize: () => void;
  content: string;
  maximized: boolean;
}
export const DrawerActionButton = ({
  onMaximize: handleMaximize,
  onMinimize: handleMinimize,
  maximized,
}: DrawerActionTypes) => {
  return (
    <DrawerHead>
      <DrawerActions>
        {maximized ? (
          <Button
            style={{
              paddingLeft: "0.5em",
              paddingRight: "0.5em",
              zIndex: "999",
            }}
            variant="link"
            icon={<CompressArrowsAltIcon />}
            onClick={handleMinimize}
          />
        ) : (
          <Button
            style={{ paddingLeft: "0.5em", paddingRight: "0.5em", zIndex: 999 }}
            onClick={handleMaximize}
            variant="link"
            icon={<ExpandArrowsAltIcon />}
          />
        )}
      </DrawerActions>
    </DrawerHead>
  );
};
