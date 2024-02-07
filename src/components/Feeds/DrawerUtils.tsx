import { ReactNode } from "react";
import {
  Button,
  Tooltip,
  DrawerCloseButton,
  DrawerHead,
  DrawerActions,
} from "@patternfly/react-core";

import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

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
  handleMaximize: () => void;
  handleMinimize: () => void;
  content: string;
  maximized: boolean;
}
export const DrawerActionButton = ({
  handleMaximize,
  handleMinimize,
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
            icon={<ArrowsPointingInIcon className="pf-v5-svg" />}
            onClick={handleMinimize}
          />
        ) : (
          <Button
            style={{ paddingLeft: "0.5em", paddingRight: "0.5em" }}
            onClick={handleMaximize}
            variant="link"
            icon={<ArrowsPointingOutIcon className="pf-v5-svg" />}
          />
        )}
      </DrawerActions>
    </DrawerHead>
  );
};
