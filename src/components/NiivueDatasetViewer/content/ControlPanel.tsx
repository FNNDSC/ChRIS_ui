import { Alert, Flex, FlexItem } from "@patternfly/react-core";
import Sizing from "@patternfly/react-styles/css/utilities/Sizing/sizing";
import Spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import type React from "react";
import FilesMenu, { type FilesMenuProps } from "../components/FilesMenu";
import type { DatasetFileState } from "../statefulTypes";
import type { Problem } from "../types";
import { FooterContent } from "./footer";

type ControlPanelProps = Omit<FilesMenuProps, "fileStates"> & {
  problems: Problem[];
  fileStates: ReadonlyArray<DatasetFileState> | null;
};

/**
 * Displays information and controls for a visual dataset.
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  problems,
  fileStates,
  ...filesMenuProps
}) => {
  return (
    <Flex direction={{ default: "column" }} className={Sizing.h_100}>
      {problems.length === 0 || (
        <FlexItem>
          {problems.map(({ variant, title, body }, i) => (
            <Alert variant={variant} title={title} key={i}>
              {body}
            </Alert>
          ))}
        </FlexItem>
      )}
      <FlexItem grow={{ default: "grow" }}>
        {fileStates === null || (
          <FilesMenu fileStates={fileStates} {...filesMenuProps} />
        )}
      </FlexItem>
      <FlexItem className={Spacing.pSm}>
        <FooterContent />
      </FlexItem>
    </Flex>
  );
};

export { ControlPanel };
