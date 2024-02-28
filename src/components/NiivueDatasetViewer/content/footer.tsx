import { hideOnDesktop, hideOnMobileInline } from "../cssUtils.ts";
import { Chip, Popover, TextContent } from "@patternfly/react-core";
import BUILD_VERSION from "../../../getBuildVersion.ts";
import { css } from "@patternfly/react-styles";
import Display from "@patternfly/react-styles/css/utilities/Display/display.js";
import Flex from "@patternfly/react-styles/css/utilities/Flex/flex.js";

const FeedbackButton = () => (
  <Popover
    triggerAction="hover"
    showClose={true}
    headerContent={<div>We appreciate any comments and suggestions!</div>}
    bodyContent={
      <div>
        Email <a href="mailto:dev@babyMRI.org">dev@babyMRI.org</a> or create an
        issue on <a href="https://github.com/FNNDSC/ChRIS_ui">GitHub</a>.
      </div>
    }
  >
    <Chip isReadOnly={true} component="button">
      <b>Feedback</b>
    </Chip>
  </Popover>
);

const FnndscCopyright = () => (
  <>
    &copy;&nbsp;2024{" "}
    <a href="https://www.fnndsc.org/" target="_blank">
      <span className={hideOnMobileInline}>
        Fetal-Neonatal Neuroimaging Developmental Science Center
      </span>
      <span className={hideOnDesktop}>FNNDSC</span>
    </a>
  </>
);

const displayAsRowOnMobile = css(
  Display.displayFlex,
  Flex.flexDirectionRow,
  Flex.flexDirectionColumnOnLg,
  Flex.justifyContentSpaceBetween,
);

const FooterContent = () => (
  <TextContent>
    <div className={displayAsRowOnMobile}>
      <div>
        <FnndscCopyright />
      </div>
      <div>
        <em>ChRIS_ui</em>{" "}
        <span className={hideOnMobileInline}>version {BUILD_VERSION} </span>
        <FeedbackButton />
      </div>
    </div>
  </TextContent>
);

export { FooterContent };
