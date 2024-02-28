import { Problem } from "../types.ts";
import { Alert } from "@patternfly/react-core";
import React from "react";
import Display from "@patternfly/react-styles/css/utilities/Display/display";
import Sizing from "@patternfly/react-styles/css/utilities/Sizing/sizing";
import Spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import Flex from "@patternfly/react-styles/css/utilities/Flex/flex";
import { css } from "@patternfly/react-styles";
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
    <div
      className={css(Display.displayFlex, Flex.flexDirectionColumn)}
      style={{ height: "100%" }}
    >
      {problems.length === 0 || (
        <div>
          {problems.map(({ variant, title, body }, i) => (
            <Alert variant={variant} title={title} key={i}>
              {body}
            </Alert>
          ))}
        </div>
      )}
      <div className={css(Flex.flexGrow_1, Sizing.h_100)}>
        {fileStates === null || (
          <FilesMenu
            fileStates={fileStates}
            setFileStates={setFileStates}
            pushProblems={pushProblems}
          />
        )}
      </div>
      <div className={css(Flex.flexGrow_0, Spacing.pSm)}>
        <FooterContent />
      </div>
    </div>
  );
};

export { ControlPanel };
