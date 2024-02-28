import { Problem } from "../types.ts";
import { Alert, Flex, FlexItem } from "@patternfly/react-core";
import React from "react";
import Sizing from "@patternfly/react-styles/css/utilities/Sizing/sizing";
import Spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import { FooterContent } from "./footer.tsx";
import FilesMenu from "../components/FilesMenu.tsx";
import { DatasetFileState } from "../statefulTypes.ts";

type ControlPanelProps = {
  problems: Problem[];
  fileStates: ReadonlyArray<DatasetFileState> | null;
  setFileStates: React.Dispatch<
    React.SetStateAction<ReadonlyArray<DatasetFileState>>
  >;
  pushProblems: (problems: Problem[]) => void;
};

/**
 * Displays information and controls for a visual dataset.
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  problems,
  fileStates,
  setFileStates,
  pushProblems,
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
          <FilesMenu
            fileStates={fileStates}
            setFileStates={setFileStates}
            pushProblems={pushProblems}
          />
        )}
      </FlexItem>
      <FlexItem className={Spacing.pSm}>
        <FooterContent />
      </FlexItem>
    </Flex>
  );
};

export { ControlPanel };
