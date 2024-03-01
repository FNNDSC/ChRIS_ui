import { Alert, Flex, FlexItem } from "@patternfly/react-core";
import React from "react";
import Sizing from "@patternfly/react-styles/css/utilities/Sizing/sizing";
import Spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import { Problem, TagsDictionary } from "../types";
import { FooterContent } from "./footer";
import FilesMenu from "../components/FilesMenu";
import { DatasetFileState } from "../statefulTypes";
import { ChNVROptions } from "../models.ts";
import { Updater } from "use-immer";

type ControlPanelProps = {
  problems: Problem[];
  fileStates: ReadonlyArray<DatasetFileState> | null;
  setFileStates: React.Dispatch<
    React.SetStateAction<ReadonlyArray<DatasetFileState>>
  >;
  tagsDictionary: TagsDictionary;

  options: ChNVROptions;
  setOptions: Updater<ChNVROptions>;
  size: number;
  setSize: (size: number) => void;
  sizeIsScaling: boolean;
  setSizeIsScaling: (sizeIsScaling: boolean) => void;
};

/**
 * Displays information and controls for a visual dataset.
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  problems,
  fileStates,
  setFileStates,
  tagsDictionary,

  options,
  setOptions,
  size,
  setSize,
  sizeIsScaling,
  setSizeIsScaling,
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
            tagsDictionary={tagsDictionary}
            options={options}
            setOptions={setOptions}
            size={size}
            setSize={setSize}
            sizeIsScaling={sizeIsScaling}
            setSizeIsScaling={setSizeIsScaling}
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
