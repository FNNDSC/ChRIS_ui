import React from "react";
import {
  Drawer,
  DrawerPanelContent,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
} from "@patternfly/react-core";
import styles from "./Drawer.module.css";
import BackgroundColor from "@patternfly/react-styles/css/utilities/BackgroundColor/BackgroundColor";
import { css } from "@patternfly/react-styles";
import Sizing from "@patternfly/react-styles/css/utilities/Sizing/sizing";
import { EllipsisVIcon } from "@patternfly/react-icons";

/**
 * A drawer which smushes the main content.
 *
 * https://www.patternfly.org/components/drawer#basic-inline
 */
export const DatasetPageDrawer: React.FC<
  React.PropsWithChildren<{ head: React.ReactNode; side: React.ReactNode }>
> = ({ head, side, children }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // drawer is visible by default. hide it right away on small screens
  React.useEffect(() => {
    if (window.innerWidth < 992) {
      setIsExpanded(false);
    }
  }, []);

  const onExpand = () => {
    drawerRef.current && drawerRef.current.focus();
  };

  const onClick = () => {
    setIsExpanded(!isExpanded);
  };

  const onCloseClick = () => {
    setIsExpanded(false);
  };

  const panelContent = (
    <DrawerPanelContent>
      <DrawerHead>
        {head}
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerContentBody>
        <div
          tabIndex={isExpanded ? 0 : -1}
          ref={drawerRef}
          className={Sizing.h_100}
        >
          {side}
        </div>
      </DrawerContentBody>
    </DrawerPanelContent>
  );

  const buttonStyles = [
    styles.expandButton,
    BackgroundColor.backgroundColorDark_300,
  ];
  const buttonHidden = isExpanded ? [styles.covered] : [];

  return (
    <div className={styles.expandButtonContainer}>
      <Drawer
        isExpanded={isExpanded}
        onExpand={onExpand}
        isInline
        position="start"
      >
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>{children}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
      <button
        onClick={onClick}
        className={css(...buttonStyles, ...buttonHidden)}
      >
        <EllipsisVIcon />
      </button>
    </div>
  );
};

export default DatasetPageDrawer;
