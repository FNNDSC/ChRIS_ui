import { css } from "@patternfly/react-styles";
import Display from "@patternfly/react-styles/css/utilities/Display/display.js";
import Flex from "@patternfly/react-styles/css/utilities/Flex/flex.js";

export const hideOnMobile = css(Display.displayNone, Display.displayBlockOnMd);
export const hideOnMobileInline = css(
  Display.displayNone,
  Display.displayInlineOnMd,
);
export const hideOnDesktop = Display.displayNoneOnMd;

export const flexRowSpaceBetween = css(
  Display.displayFlex,
  Flex.flexDirectionRow,
  Flex.justifyContentSpaceBetween,
);
